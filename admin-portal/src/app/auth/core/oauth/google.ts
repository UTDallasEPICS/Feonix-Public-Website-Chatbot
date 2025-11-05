import { env } from "process"
import { OAuthClient } from "./base"
import { z } from "zod"

export function createGoogleOAuthClient() {
  return new OAuthClient({
    provider: "google",
    clientId: env.GOOGLE_CLIENT_ID as string,
    clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    scopes: ["openid", "email", "profile"],
    urls: {
      auth: "https://accounts.google.com/o/oauth2/v2/auth",
      token: "https://oauth2.googleapis.com/token",
      user: "https://openidconnect.googleapis.com/v1/userinfo",
    },
    userInfo: {
      schema: z.object({
        sub: z.string(),         
        name: z.string(),
        email: z.string().email(),
      }),
      parser: user => ({
        id: user.sub,            
        name: user.name,
        email: user.email,
      }),
    },
  })
}
