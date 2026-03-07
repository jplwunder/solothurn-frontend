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
  IconLayoutRows,
  IconLoader2,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { api } from "@/lib/api";
import type { Company } from "@/lib/types";

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "One number" },
  {
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
    label: "One special character",
  },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const score = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const label =
    score <= 1 ? "Weak" : score <= 3 ? "Fair" : score === 4 ? "Good" : "Strong";
  const color =
    score <= 1
      ? "bg-destructive"
      : score <= 3
        ? "bg-amber-500"
        : "bg-green-500";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= score ? color : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [step, setStep] = useState<1 | 2>(1);
  const [companyName, setCompanyName] = useState("");
  const [errors, setErrors] = useState<{
    companyName?: string;
    password?: string[];
    confirm?: string;
    general?: string;
  }>({});
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleNext() {
    if (!companyName.trim()) {
      setErrors({ companyName: "Company name is required." });
      return;
    }
    setErrors({});
    setStep(2);
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const confirm = (
      form.elements.namedItem("password_confirmation") as HTMLInputElement
    ).value;

    const failedRules = PASSWORD_RULES.filter((r) => !r.test(password)).map(
      (r) => r.label
    );

    const nextErrors: typeof errors = {};
    if (failedRules.length > 0) {
      nextErrors.password = failedRules;
    }
    if (password !== confirm) {
      nextErrors.confirm = "Passwords do not match.";
    }
    if (nextErrors.password || nextErrors.confirm) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const company = await api.postPublic<Company>(
        "/api/v1/auth/register-company",
        { name: companyName }
      );
      await api.postPublic("/api/v1/auth/register", {
        email,
        name,
        password,
        company_id: company.id,
      });
    } catch {
      setErrors({ general: "An error occurred while creating your account." });
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/login?registered=1");
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a href="/" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <IconLayoutRows className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-xl font-bold">Create your account</h1>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span className={cn("font-medium", step === 1 && "text-foreground")}>
                1. Company
              </span>
              <span>—</span>
              <span className={cn("font-medium", step === 2 && "text-foreground")}>
                2. Account
              </span>
            </div>
            <FieldDescription>
              Already have an account?{" "}
              <a href="/login">Sign in</a>
            </FieldDescription>
          </div>

          {step === 1 && (
            <>
              <Field>
                <FieldLabel htmlFor="company_name">Company Name</FieldLabel>
                <Input
                  id="company_name"
                  name="company_name"
                  type="text"
                  required
                  placeholder="Your company name"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (errors.companyName) setErrors({});
                  }}
                />
                {errors.companyName && (
                  <FieldError>{errors.companyName}</FieldError>
                )}
              </Field>

              <Field>
                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Your name"
                />
              </Field>

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
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <PasswordStrength password={password} />
                {errors.password && (
                  <FieldError>
                    <ul className="ml-4 list-disc space-y-0.5">
                      {errors.password.map((msg) => (
                        <li key={msg}>{msg}</li>
                      ))}
                    </ul>
                  </FieldError>
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
                    autoComplete="new-password"
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                      onClick={() => setShowConfirm((v) => !v)}
                    >
                      {showConfirm ? <IconEyeOff /> : <IconEye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {errors.confirm && <FieldError>{errors.confirm}</FieldError>}
              </Field>

              <Field>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <IconLoader2 className="animate-spin" />
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </div>
                {errors.general && (
                  <FieldError className="text-center">{errors.general}</FieldError>
                )}
              </Field>
            </>
          )}

          <FieldDescription className="text-center text-xs">
            By creating an account, you agree to our{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}
