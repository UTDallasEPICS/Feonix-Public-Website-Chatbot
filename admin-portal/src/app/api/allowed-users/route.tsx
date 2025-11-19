import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const users = await prisma.allowedUser.findMany();
  return Response.json(users);
}

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return new Response("Email required", { status: 400 });
  }

  const user = await prisma.allowedUser.create({ data: { email } });
  return Response.json(user, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: { email: string } }
) {
  const { email } = params;

  await prisma.allowedUser.delete({
    where: { email },
  });

  return new Response(null, { status: 204 });
}
