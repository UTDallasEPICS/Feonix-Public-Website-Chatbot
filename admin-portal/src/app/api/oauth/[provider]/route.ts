import { getOAuthClient } from "@/app/auth/core/oauth/base"
import { createUserSession } from "@/app/auth/core/session"
import { PrismaClient } from "@prisma/client";
import { oAuthProviders, OAuthProvider } from "@/app/auth/nextjs/schemas"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NextRequest } from "next/server"
import { z } from "zod"

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: rawProvider } = await params
  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const provider = z.enum(oAuthProviders).parse(rawProvider)

  if (typeof code !== "string" || typeof state !== "string") {
    return redirect(
      `/login?oauthError=${encodeURIComponent(
        "Failed to connect. Please try again."
      )}`
    )
  }

  const oAuthClient = getOAuthClient(provider)
  try {
    const oAuthUser = await oAuthClient.fetchUser(code, state, await cookies())
    console.log("**", oAuthUser, provider)
    const user = await connectUserToAccount(oAuthUser, provider)
    
    await createUserSession(user, await cookies())
  } catch (error) {
    console.error(error)
    return redirect(
      `/login?oauthError=${encodeURIComponent(
        "Failed to connect. Please try again."
      )}`
    )
  }

  return redirect("/")
}

async function connectUserToAccount(
  { id, email, name }: { id: string; email: string; name: string },
  provider: OAuthProvider
) {
  return prisma.$transaction(async (trx) => {
    let user = await trx.user.findFirst({
      where: { email: email },
      select: { id: true },
    });

    if (user == null) {
      const newUser = await trx.user.create({
        data: {
          email: email,
          name: name,
          createdAt: new Date(),
        },
      });
      user = newUser;
    }

    // check if the new oAuthAccount already exists
    const existingOAuthAccount = await trx.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: provider,
          providerAccountId: id,
        },
      },
    });

    if (existingOAuthAccount) {
      // if the account already exists then just return early
      return { id: user.id };
    }

    // if the account doesn't exist, create a new one
    await trx.oAuthAccount.create({
      data: {
        provider: provider,
        providerAccountId: id,
        userId: user.id,
      },
    });

    return { id: user.id,};
  });
}
