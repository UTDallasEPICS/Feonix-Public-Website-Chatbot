import { z } from "zod"

export const oAuthProviders = ["github", "google"] as const
export type OAuthProvider = (typeof oAuthProviders)[number]
