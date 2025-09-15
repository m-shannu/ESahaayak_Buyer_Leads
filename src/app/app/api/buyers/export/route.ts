import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BuyerCreateSchema } from "@/lib/validators/buyer-validator";
import { getUserIdFromReq, getIpFromReq } from "@/lib/server-utils";

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

  // Handle BigInt serialization (convert to string)
  const serializedData = data.map((buyer) => ({
    ...buyer,
    budgetMin: buyer.budgetMin?.toString() ?? null,
    budgetMax: buyer.budgetMax?.toString() ?? null,
  }));

  return NextResponse.json({
    total,
    page,
    pageSize,
    data: serializedData,
  });
}
