"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useQueryState } from "nuqs";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { ShiftHistoryFilters } from "@/components/shifts/shift-history-filters";
import { ShiftHistoryTable } from "@/components/shifts/shift-history-table";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function ShiftHistoryContent() {
  const [search, setSearch] = useQueryState("q", { defaultValue: "" });
  const [dateFrom, setDateFrom] = useQueryState("from", { defaultValue: "" });
  const [dateTo, setDateTo] = useQueryState("to", { defaultValue: "" });
  const [changeType, setChangeType] = useQueryState("type", {
    defaultValue: "all",
  });
  const [page, setPage] = useQueryState("page", { defaultValue: "1" });

  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    if (changeType !== "all") params.set("type", changeType);
    params.set("page", page);

    const res = await fetch(`/api/shifts/history?${params}`);
    const data = await res.json();
    setEntries(data.data);
    setPagination(data.pagination);
    setLoading(false);
  }, [search, dateFrom, dateTo, changeType, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="シフト変更履歴"
        description={`${pagination.total}件の変更履歴`}
        icon={<History className="h-6 w-6" />}
      />

      <ShiftHistoryFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage("1");
        }}
        dateFrom={dateFrom}
        onDateFromChange={(v) => {
          setDateFrom(v);
          setPage("1");
        }}
        dateTo={dateTo}
        onDateToChange={(v) => {
          setDateTo(v);
          setPage("1");
        }}
        changeType={changeType}
        onChangeTypeChange={(v) => {
          setChangeType(v);
          setPage("1");
        }}
      />

      {loading ? (
        <div className="flex justify-center py-12 text-muted-foreground">
          読み込み中...
        </div>
      ) : (
        <ShiftHistoryTable entries={entries} onRestore={fetchHistory} />
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPage(String(pagination.page - 1))}
          >
            前へ
          </Button>
          <span className="text-sm text-muted-foreground">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage(String(pagination.page + 1))}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ShiftHistoryPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12 text-muted-foreground">読み込み中...</div>}>
      <ShiftHistoryContent />
    </Suspense>
  );
}
