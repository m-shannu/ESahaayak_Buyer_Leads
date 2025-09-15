import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { name, email } = body ?? {};
  // find or create user by email (if provided)
  let user;
  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name }
      });
    }
  } else {
    // create anonymous demo user
    user = await prisma.user.create({ data: { name: name || "demo" } });
  }

  const res = NextResponse.json({ user });
  // set cookie (30 days)
  const cookie = `user-id=${user.id}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 30}`;
  res.headers.set("Set-Cookie", cookie);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", `user-id=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
  return res;
}
