import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import { useMutation } from "@tanstack/react-query";
import { loginFunction, verifyEmail } from "./mutations";

export default function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("'useAuth' accessed outside of AuthProvider");
  }

  return context;
}

export function useVerifyEmail() {
  return useMutation({
    mutationKey: ["verify-email"],
    mutationFn: verifyEmail,
  });
}

export function useLogin() {
  return useMutation({
    mutationKey: ["login-mutation"],
    mutationFn: loginFunction,
  });
}
