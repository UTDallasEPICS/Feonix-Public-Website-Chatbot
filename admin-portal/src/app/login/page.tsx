"use client";

import React, { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [oauthError, setOauthError] = useState("");

  useEffect(() => {
    const error = searchParams?.get("oauthError") || "";
    setOauthError(error);
  }, [searchParams]);

  return <LoginForm oauthError={oauthError} />;
}
