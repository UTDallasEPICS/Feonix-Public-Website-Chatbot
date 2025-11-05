"use server";
import { z } from "zod";
import { redirect } from "next/navigation";

import { OAuthProvider } from "./schemas";

import { cookies } from "next/headers";
import { createUserSession, removeUserFromSession } from "../core/session";
import { getOAuthClient } from "../core/oauth/base";

export async function logOut() {
  await removeUserFromSession(await cookies());
  redirect("/");
}

export async function oAuthSignIn(provider: OAuthProvider) {
  const oAuthClient = getOAuthClient(provider);
  redirect(oAuthClient.createAuthUrl(await cookies()));
}
