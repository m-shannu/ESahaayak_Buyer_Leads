import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BuyerUpdateSchema } from "@/lib/validators/buyer-validator";
import { getUserIdFromReq } from "@/lib/server-utils";
import { Prisma } from "@prisma/client";

// This function handles the GET request to fetch a single buyer by ID.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const buyer = await prisma.buyer.findUnique({ where: { id } });

  if (!buyer) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Manually serialize BigInt fields to strings before sending the response
  const serializedBuyer = {
    ...buyer,
    budgetMin: buyer.budgetMin?.toString(),
    budgetMax: buyer.budgetMax?.toString(),
    tags: buyer.tags ? buyer.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
  };

  return NextResponse.json(serializedBuyer);
}

// This function handles the PUT request to update a single buyer by ID.
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await req.json().catch(() => null);
  if (!body) return new NextResponse("Invalid JSON", { status: 400 });

  // validate
  const parsed = BuyerUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const userId = getUserIdFromReq(req) ?? "anonymous";
  const buyer = await prisma.buyer.findUnique({ where: { id } });
  if (!buyer) return new NextResponse("Not found", { status: 404 });

  // Ownership check
  if (buyer.ownerId !== userId && userId !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Concurrency check
  const clientUpdatedAt = new Date(parsed.data.updatedAt).toISOString();
  if (buyer.updatedAt.toISOString() !== clientUpdatedAt) {
    return new NextResponse("Record changed, please refresh", { status: 409 });
  }

  try {
    const { fullName, tags, updatedAt, budgetMin, budgetMax, ...rest } = parsed.data;
    const tagsString = tags?.length ? tags.join(",") : null;

    // Ensure budgetMin and budgetMax are never empty strings
    const safeBudgetMin =
      budgetMin === undefined ? null : budgetMin;
    const safeBudgetMax =
      budgetMax === undefined ? null : budgetMax;

    const oldBuyer = buyer;

    const updated = await prisma.buyer.update({
      where: { id },
      data: {
        ...rest,
        budgetMin: safeBudgetMin,
        budgetMax: safeBudgetMax,
        tags: tagsString,
      },
    });

    // Serialize BigInt fields to strings for history logging
    const diff = {
      from: {
        ...oldBuyer,
        budgetMin: oldBuyer.budgetMin?.toString(),
        budgetMax: oldBuyer.budgetMax?.toString(),
        tags: oldBuyer.tags?.split(",")
      },
      to: {
        ...updated,
        budgetMin: updated.budgetMin?.toString(),
        budgetMax: updated.budgetMax?.toString(),
        tags: updated.tags?.split(",")
      },
    };

    await prisma.buyerHistory.create({
      data: {
        buyerId: id,
        changedBy: userId,
        diff: JSON.stringify(diff),
      },
    });

    const serializedBuyer = {
      ...updated,
      budgetMin: updated.budgetMin?.toString(),
      budgetMax: updated.budgetMax?.toString(),
      tags: updated.tags ? updated.tags.split(",").map((t) => t.trim()) : [],
    };

    return NextResponse.json({ data: serializedBuyer });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      if (Array.isArray(error.meta?.target) && error.meta.target.includes('email')) {
        return NextResponse.json({ error: "A buyer with this email already exists." }, { status: 409 });
      }
    }
    throw error;
  }
}

// This function handles the DELETE request to delete a single buyer by ID.
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const userId = getUserIdFromReq(req) ?? "anonymous";
  const buyer = await prisma.buyer.findUnique({ where: { id } });
  if (!buyer) return new NextResponse("Not found", { status: 404 });

  // Ownership check
  if (buyer.ownerId !== userId && userId !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  await prisma.buyerHistory.create({
    data: {
      buyerId: id,
      changedBy: userId,
      diff: JSON.stringify({ deleted: true }),
    },
  });

  await prisma.buyer.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}