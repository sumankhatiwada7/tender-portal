import { useEffect, useMemo, useState } from "react";
import { fetchAdminPayments } from "../../features/admin/admin.api";
import type { AdminPayment, AdminPaymentStatus } from "../../features/admin/admin.types";
import {
  AdminCard,
  EmptyPanel,
  FilterSelect,
  SearchInput,
  SectionHeader,
  StatusPill,
  TableSkeleton,
} from "../../features/admin/components/AdminUi";
import { PaginationControls, TableActionButton } from "../../features/dashboard/components/DashboardUi";
import { matchesSearch } from "../../features/dashboard/dashboard.utils";

type SortMode = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function downloadInvoice(payment: AdminPayment) {
  const lines = [
    "TenderNepal Payment Invoice",
    `Company: ${payment.companyName}`,
    `Package: ${payment.creditPackage}`,
    `Amount: ${formatCurrency(payment.amount)}`,
    `Method: ${payment.paymentMethod}`,
    `Transaction ID: ${payment.transactionId}`,
    `Date: ${formatDate(payment.purchaseDate)}`,
    `Status: ${payment.status}`,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `invoice-${payment.transactionId}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function AdminPaymentHistoryPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminPaymentStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "bid" | "tender">("all");
  const [sortMode, setSortMode] = useState<SortMode>("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  async function loadPayments() {
    setLoading(true);
    setError(null);

    try {
      setPayments(await fetchAdminPayments());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load payment history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPayments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, sortMode]);

  const filteredPayments = useMemo(() => {
    const filtered = payments.filter((payment) => {
      const searchMatch =
        searchQuery.trim().length === 0 ||
        matchesSearch(payment.companyName, searchQuery) ||
        matchesSearch(payment.transactionId, searchQuery) ||
        matchesSearch(payment.creditPackage, searchQuery);
      const statusMatch = statusFilter === "all" || payment.status === statusFilter;
      const typeMatch = typeFilter === "all" || payment.type === typeFilter;

      return searchMatch && statusMatch && typeMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "amount-asc") return a.amount - b.amount;
      if (sortMode === "amount-desc") return b.amount - a.amount;
      const aDate = new Date(a.purchaseDate).getTime();
      const bDate = new Date(b.purchaseDate).getTime();
      return sortMode === "date-asc" ? aDate - bDate : bDate - aDate;
    });
  }, [payments, searchQuery, sortMode, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return <TableSkeleton columns={7} rows={8} />;
  }

  if (error) {
    return <EmptyPanel title="Payment history unavailable" description={error} />;
  }

  return (
    <div className="space-y-6">
      <AdminCard className="p-5">
        <SectionHeader
          eyebrow="Payments"
          title="Payment History"
          description="Track credit purchases, transaction status, and invoice downloads."
        />

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search company, package, transaction" />
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "All statuses", value: "all" },
              { label: "Paid", value: "paid" },
              { label: "Pending", value: "pending" },
              { label: "Failed", value: "failed" },
            ]}
          />
          <FilterSelect
            label="Package"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: "All packages", value: "all" },
              { label: "Bid credits", value: "bid" },
              { label: "Tender credits", value: "tender" },
            ]}
          />
          <FilterSelect
            label="Sort"
            value={sortMode}
            onChange={setSortMode}
            options={[
              { label: "Newest first", value: "date-desc" },
              { label: "Oldest first", value: "date-asc" },
              { label: "Amount high to low", value: "amount-desc" },
              { label: "Amount low to high", value: "amount-asc" },
            ]}
          />
        </div>
      </AdminCard>

      <AdminCard className="overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-5">
            <EmptyPanel title="No payments found" description="Try changing the search or filter values." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-5 py-3">Company</th>
                    <th className="px-5 py-3">Credit package</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Method</th>
                  
                    <th className="px-5 py-3">Purchase date</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPayments.map((payment) => (
                    <tr className="transition hover:bg-slate-50" key={payment.id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">{payment.companyName}</p>
                        <p className="mt-1 text-xs text-slate-500">{payment.companyEmail}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{payment.creditPackage}</td>
                      <td className="px-5 py-4 font-semibold text-slate-950">{formatCurrency(payment.amount)}</td>
                      <td className="px-5 py-4 text-slate-600">{payment.paymentMethod}</td>
                     
                      <td className="px-5 py-4 text-slate-600">{formatDate(payment.purchaseDate)}</td>
                      <td className="px-5 py-4">
                        <StatusPill status={payment.status} />
                      </td>
                      <td className="px-5 py-4">
                        <TableActionButton
                          icon="upload"
                          label="Download"
                          tone="sky"
                          onClick={() => downloadInvoice(payment)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-5">
              <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </AdminCard>
    </div>
  );
}

export default AdminPaymentHistoryPage;
