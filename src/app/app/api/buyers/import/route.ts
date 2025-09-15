import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();

    // ✅ parse CSV
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });


    await prisma.buyer.createMany({
      data: records.map((b: any) => ({
        fullName: b.fullName,
        email: b.email || null,
        phone: b.phone,
        city: b.city,
        propertyType: b.propertyType,
        bhk: b.bhk || null,
        purpose: b.purpose,
        budgetMin: b.budgetMin ? parseInt(b.budgetMin) : null,
        budgetMax: b.budgetMax ? parseInt(b.budgetMax) : null,
        timeline: b.timeline,
        source: b.source,
        notes: b.notes || "",
        status: b.status || "New",
        ownerId: "1", // ✅ set here
      })),
    });

    return NextResponse.json({ success: true, count: records.length });
  } catch (err: any) {
    console.error("Import error:", err);
    return NextResponse.json(
      { error: "Failed to import buyers" },
      { status: 500 }
    );
  }
}
