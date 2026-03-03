"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Customer } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { IconUsers } from "@tabler/icons-react";

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
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function CustomerTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const columns = ["Name", "Email", "Phone", "City / State", "Created"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
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
                    colSpan={5}
                    className="px-4 py-12 text-center text-destructive"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
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
  );
}
