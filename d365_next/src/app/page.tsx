"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardHeader } from "@/components/dashboard-header";
import { SummaryCards } from "@/components/summary-cards";
import { OwnerTable } from "@/components/owner-table";
import { IncidentTable } from "@/components/incident-table";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

interface OwnerCount {
  owner: string;
  count: number;
}

interface Incident {
  callNumber: number;
  completedOn: string;
  completedOnJST: string;
  owner: string | null;
  title: string | null;
  incidentId: string;
}

interface ApiResponse {
  success: boolean;
  date: string;
  totalCount: number;
  ownerCounts: OwnerCount[];
  incidents: Incident[];
  error?: string;
}

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const fetchData = async (date: string = "today") => {
    setLoading(true);
    setError(null);

    try {
      const params = date && date !== "today" ? `?date=${date}` : "";
      const response = await fetch(`/api/incidents${params}`);
      const result: ApiResponse = await response.json();

      if (result.success) {
        setData(result);
      } else {
        setError(result.error || "データの取得に失敗しました");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleSearch = () => {
    fetchData(selectedDate || "today");
  };

  const handleToday = () => {
    setSelectedDate("");
    fetchData("today");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onSearch={handleSearch}
        onToday={handleToday}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && !data && <DashboardSkeleton />}

        {loading && data && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-6 shadow-lg border">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">データ取得中...</p>
            </div>
          </div>
        )}

        {data && (
          <>
            <SummaryCards
              date={data.date}
              totalCount={data.totalCount}
              ownerCount={data.ownerCounts.length}
            />
            <OwnerTable
              ownerCounts={data.ownerCounts}
              totalCount={data.totalCount}
            />
            <IncidentTable incidents={data.incidents} />
          </>
        )}
      </main>
    </div>
  );
}
