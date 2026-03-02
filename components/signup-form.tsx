"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
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
  IconEye,
  IconEyeOff,
  IconLayoutRows,
  IconLoader2,
} from "@tabler/icons-react";
import { api } from "@/lib/api";

const PASSWORD_RULES = [
  { label: "8+ characters", test: (p: string) => p.length >= 8, msg: "At least 8 characters" },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p), msg: "Must contain at least one uppercase letter" },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p), msg: "Must contain at least one lowercase letter" },
  { label: "Number", test: (p: string) => /[0-9]/.test(p), msg: "Must contain at least one number" },
  { label: "Special character", test: (p: string) => /[^A-Za-z0-9]/.test(p), msg: "Must contain at least one special character" },
];

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [errors, setErrors] = useState<{ password?: string[]; confirm?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("password_confirmation") as HTMLInputElement).value;

    const failedRules = PASSWORD_RULES.filter((r) => !r.test(password)).map((r) => r.msg);
    const nextErrors: typeof errors = {};
    if (failedRules.length > 0) nextErrors.password = failedRules;
    if (password !== confirm) nextErrors.confirm = "Passwords do not match.";
    if (nextErrors.password || nextErrors.confirm) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setLoading(true);

    try {
      await api.post("/api/v1/users/users", { email, name, password });
    } catch (error) {
      setSubmitError("An error occurred while creating your account.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/login");
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <IconLayoutRows className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Acme Inc.</h1>
            <FieldDescription>
              Already have an account? <a href="/login">Sign in</a>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Your name"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <IconEyeOff className="size-4" />
                  ) : (
                    <IconEye className="size-4" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 text-sm">
              {PASSWORD_RULES.map((rule, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex items-center gap-1.5",
                    rule.test(passwordValue)
                      ? "text-green-600 dark:text-green-400"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="font-bold">{rule.test(passwordValue) ? "✓" : "·"}</span>
                  {rule.label}
                </li>
              ))}
            </ul>
            {errors.password && (
              <FieldError errors={errors.password.map((msg) => ({ message: msg }))} />
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="password_confirmation">
              Confirm Password
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="password_confirmation"
                name="password_confirmation"
                type={showConfirm ? "text" : "password"}
                required
                autoComplete="new-password"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <IconEyeOff className="size-4" />
                  ) : (
                    <IconEye className="size-4" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {errors.confirm && <FieldError>{errors.confirm}</FieldError>}
          </Field>
          <Field>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <IconLoader2 className="animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
            {submitError && <FieldError>{submitError}</FieldError>}
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
