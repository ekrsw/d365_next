"use client";

import { CalendarDays, Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardHeaderProps {
  selectedDate: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onToday: () => void;
}

export function DashboardHeader({
  selectedDate,
  onDateChange,
  onSearch,
  onToday,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                D365 Dashboard
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                完了案件モニター
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border bg-card p-1">
              <Input
                type="date"
                value={selectedDate}
                onChange={onDateChange}
                className="h-8 w-[160px] border-0 bg-transparent text-sm"
              />
              <Button size="sm" onClick={onSearch} className="h-8 gap-1.5">
                <Search className="size-3.5" />
                <span className="hidden sm:inline">検索</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onToday}
                className="h-8 gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">本日</span>
              </Button>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
