import { SignupForm } from "@/components/signup-form";
import { IconLayoutRows } from "@tabler/icons-react";

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Branding panel */}
      <div className="bg-primary text-primary-foreground hidden flex-col justify-between p-10 lg:flex">
        <div className="flex items-center gap-2 font-semibold">
          <IconLayoutRows className="size-5" />
          <span>Acme Inc.</span>
        </div>
        <blockquote className="space-y-2">
          <p className="text-lg leading-snug">
            &ldquo;Getting started was seamless. Our team was up and running in
            minutes.&rdquo;
          </p>
          <footer className="text-sm opacity-70">
            James L., Engineering Lead
          </footer>
        </blockquote>
      </div>

      {/* Form panel */}
      <div className="bg-background flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm rounded-xl border p-6 shadow-sm">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
