import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BuyerCreateSchema } from "@/lib/validators/buyer-validator";
import { getUserIdFromReq, getIpFromReq } from "@/lib/server-utils";
import { Prisma } from "@prisma/client";

const CREATE_RATE_LIMIT = 60; // per hour per user/IP
const createCounts = new Map<string, { count: number; ts: number }>();

function checkRateLimit(key: string) {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const existing = createCounts.get(key);
  if (!existing || now - existing.ts > hour) {
    createCounts.set(key, { count: 1, ts: now });
    return { ok: true };
  }
  if (existing.count >= CREATE_RATE_LIMIT) {
    return { ok: false, retryAfter: (existing.ts + hour - now) / 1000 };
  }
  existing.count += 1;
  createCounts.set(key, existing);
  return { ok: true };
}

// A helper function to serialize BigInts to strings
function replacer(key: any, value: any) {
  return typeof value === 'bigint' ? value.toString() : value;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") || "1");
  const pageSize = 10;
  const skip = (Math.max(1, page) - 1) * pageSize;

  const city = url.searchParams.get("city");
  const propertyType = url.searchParams.get("propertyType");
  const status = url.searchParams.get("status");
  const timeline = url.searchParams.get("timeline");
  const q = url.searchParams.get("q");

  const where: any = {};

  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) where.timeline = timeline;

  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.buyer.count({ where }),
    prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  // Handle BigInt serialization
  const serializedData = data.map((buyer) => ({
    ...buyer,
    budgetMin: buyer.budgetMin?.toString(),
    budgetMax: buyer.budgetMax?.toString(),
    tags: buyer.tags ? buyer.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
  }));

  return new NextResponse(JSON.stringify({
    data: serializedData,
    total,
    page,
    pageSize,
  }, replacer), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return new NextResponse("Invalid JSON", { status: 400 });

  const userId = getUserIdFromReq(req);
  const ip = getIpFromReq(req);
  const rateKey = userId ?? ip;
  const rate = checkRateLimit(rateKey);
  if (!rate.ok) {
    const retryAfter = rate.retryAfter;
    if (typeof retryAfter !== "undefined") {
      return new NextResponse("Rate limit exceeded", { status: 429, headers: { "Retry-After": `${Math.ceil(retryAfter)}` } });
    }
  }

  const parsed = BuyerCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const { fullName, tags, budgetMin, budgetMax, ...rest } = parsed.data;
    const tagsString = tags?.length ? tags.join(",") : null;
    const ownerId = userId ?? "anonymous";

    // Ensure budgetMin and budgetMax are valid types
    const safeBudgetMin = budgetMin === undefined ? null : budgetMin;
    const safeBudgetMax = budgetMax === undefined ? null : budgetMax;

    const newBuyer = await prisma.buyer.create({
      data: {
        ...rest,
        fullName,
        tags: tagsString,
        ownerId,
        budgetMin: safeBudgetMin,
        budgetMax: safeBudgetMax,
      },
    });

    await prisma.buyerHistory.create({
      data: {
        buyerId: newBuyer.id,
        changedBy: ownerId,
        diff: JSON.stringify({ created: true, data: parsed.data }),
      },
    });

    const serializedBuyer = {
      ...newBuyer,
      budgetMin: newBuyer.budgetMin?.toString(),
      budgetMax: newBuyer.budgetMax?.toString(),
      tags: parsed.data.tags ?? [],
    };

    return new NextResponse(JSON.stringify({ data: serializedBuyer }, replacer), {
      headers: { 'Content-Type': 'application/json' },
      status: 201
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      if (Array.isArray(error.meta?.target) && error.meta.target.includes('email')) {
        return new NextResponse(JSON.stringify({ error: "A buyer with this email already exists." }), {
          headers: { 'Content-Type': 'application/json' },
          status: 409
        });
      }
    }
    throw error;
  }
}
