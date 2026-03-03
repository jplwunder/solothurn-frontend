"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import {
  IconLayoutRows,
  IconLoader2,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { api } from "@/lib/api";
import type { AuthResponse } from "@/lib/types";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    try {
      const response = await api.post<AuthResponse>("/api/v1/auth/login", {
        email,
        password,
      });
      localStorage.setItem("auth_token", response.access_token);
      try {
        const payload = JSON.parse(atob(response.access_token.split(".")[1]));
        if (payload.sub != null && !isNaN(Number(payload.sub))) {
          localStorage.setItem("user_id", String(payload.sub));
        }
      } catch {
        // JWT decode failed — user_id stays unset, dashboard falls back to all customers
      }
    } catch {
      setLoginError("Invalid email or password");
      setLoginLoading(false);
      return;
    }

    setLoginLoading(false);
    window.location.href = "/dashboard";
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleLogin}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link href="/" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <IconLayoutRows className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </Link>
            <h1 className="text-xl font-bold">Welcome back</h1>
            <FieldDescription>
              Don&apos;t have an account?{" "}
              <a href="/signup">Sign up</a>
            </FieldDescription>
          </div>

          {justRegistered && (
            <p className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-2 text-sm text-center dark:bg-green-950 dark:text-green-300 dark:border-green-800">
              Account created! Sign in to continue.
            </p>
          )}

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary text-xs underline underline-offset-4"
              >
                Forgot password?
              </a>
            </div>
            <InputGroup>
              <InputGroupInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>

          <Field>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <IconLoader2 className="animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
            {loginError && (
              <FieldError className="text-center">{loginError}</FieldError>
            )}
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
