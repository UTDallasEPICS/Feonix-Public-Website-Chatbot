"use client";
import React, { createContext, useContext } from "react";
import { User } from "../lib/types";

interface UserContextValue {
  user: User | null;
}

const UserContext = createContext<UserContextValue>({ user: null });

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}
