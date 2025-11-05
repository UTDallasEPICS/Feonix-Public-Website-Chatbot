"use client";

import React from "react";
import LoginForm from "./LoginForm";
import { useSearchParams } from "next/navigation";

export default async function LoginPage() {
  const searchParams = useSearchParams();
  const oauthError = searchParams?.get("oauthError") || "";

  return <LoginForm oauthError={oauthError} />;
}
