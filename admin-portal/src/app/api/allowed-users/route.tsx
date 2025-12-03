import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.allowedUser.findMany();
    return NextResponse.json(users);
  } catch (error) {
    return new NextResponse("Failed to fetch users", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("Email required", { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new NextResponse("Invalid email format", { status: 400 });
    }

    const existingUser = await prisma.allowedUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response("Email already exists", { status: 409 });
    }

    const newUser = await prisma.allowedUser.create({
      data: { email },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return new NextResponse("Failed to create user", { status: 500 });
  }
}
