import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    const user = await prisma.allowedUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return new NextResponse("Failed to fetch user", { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("Email required", { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new NextResponse("Invalid email format", { status: 400 });
    }

    const existingUser = await prisma.allowedUser.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    const emailExists = await prisma.allowedUser.findFirst({
      where: {
        email,
        id: { not: userId },
      },
    });

    if (emailExists) {
      return new NextResponse("Email already exists", { status: 409 });
    }

    const updatedUser = await prisma.allowedUser.update({
      where: { id: userId },
      data: { email },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return new NextResponse("Failed to update user", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    const existingUser = await prisma.allowedUser.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    await prisma.allowedUser.delete({
      where: { id: userId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Failed to delete user", { status: 500 });
  }
}
