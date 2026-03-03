"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Customer } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { IconUsers, IconPlus, IconLoader2 } from "@tabler/icons-react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TableRowSkeleton() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

type FormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
};

const emptyForm: FormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
};

export function CustomerTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<Customer[]>(`/api/v1/customers/all`);
        setCustomers(data);
      } catch {
        setError("Failed to load customers. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  function handleOpenSheet() {
    setForm(emptyForm);
    setFormErrors({});
    setSubmitError(null);
    setSheetOpen(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(): boolean {
    const errors: Partial<FormData> = {};
    if (!form.name.trim()) {
      errors.name = "Name is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        zip_code: form.zip_code.trim() || null,
      };
      const newCustomer = await api.post<Customer>(
        "/api/v1/customers",
        payload,
      );
      setCustomers((prev) => [newCustomer, ...prev]);
      setSheetOpen(false);
    } catch {
      setSubmitError("Failed to create customer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    "Name",
    "Email",
    "Phone",
    "Address",
    "City / State",
    "Created",
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customers</CardTitle>
          <Button size="sm" onClick={handleOpenSheet}>
            <IconPlus />
            Add Customer
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                )}

                {!loading && error && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-destructive"
                    >
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && customers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <IconUsers className="size-10 opacity-40" />
                        <p className="font-medium">No customers yet</p>
                        <p className="text-xs">
                          Customers you add will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b last:border-0 transition-colors hover:bg-muted/40"
                    >
                      <td className="px-4 py-3 font-medium">{customer.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {customer.email ?? (
                          <span className="italic text-muted-foreground/50">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {customer.phone ?? (
                          <span className="italic text-muted-foreground/50">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {customer.address ?? (
                          <span className="italic text-muted-foreground/50">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {customer.city && customer.state
                          ? `${customer.city}, ${customer.state}`
                          : (customer.city ??
                            customer.state ?? (
                              <span className="italic text-muted-foreground/50">
                                —
                              </span>
                            ))}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {formatDate(customer.created_at)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Customer</SheetTitle>
            <SheetDescription>
              Fill in the details below to create a new customer.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup className="px-4 py-2">
              <Field>
                <FieldLabel htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={handleChange}
                  aria-invalid={!!formErrors.name}
                  autoFocus
                />
                <FieldError>{formErrors.name}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main St"
                  value={form.address}
                  onChange={handleChange}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="city">City</FieldLabel>
                  <Input
                    id="city"
                    name="city"
                    placeholder="New York"
                    value={form.city}
                    onChange={handleChange}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="state">State</FieldLabel>
                  <Input
                    id="state"
                    name="state"
                    placeholder="NY"
                    value={form.state}
                    onChange={handleChange}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="zip_code">ZIP Code</FieldLabel>
                <Input
                  id="zip_code"
                  name="zip_code"
                  placeholder="10001"
                  value={form.zip_code}
                  onChange={handleChange}
                />
              </Field>

              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}
            </FieldGroup>

            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSheetOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <IconLoader2 className="animate-spin" />}
                {submitting ? "Saving…" : "Save Customer"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
