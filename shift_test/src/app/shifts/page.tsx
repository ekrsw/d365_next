"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useQueryState } from "nuqs";
import { Calendar } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ShiftCalendarControls } from "@/components/shifts/shift-calendar-controls";
import { ShiftCalendarGrid } from "@/components/shifts/shift-calendar-grid";

interface ShiftCalendarData {
  year: number;
  month: number;
  daysInMonth: number;
  groups: {
    id: number;
    name: string;
    employees: {
      id: number;
      name: string;
      shifts: {
        id: number;
        date: string;
        shiftCode: string | null;
        startTime: string | null;
        endTime: string | null;
        isHoliday: boolean;
        isPaidLeave: boolean;
        isRemote: boolean;
      }[];
    }[];
  }[];
}

function ShiftsContent() {
  const now = new Date();
  const [yearParam, setYearParam] = useQueryState("year", {
    defaultValue: String(now.getFullYear()),
  });
  const [monthParam, setMonthParam] = useQueryState("month", {
    defaultValue: String(now.getMonth() + 1),
  });
  const [group, setGroup] = useQueryState("group", { defaultValue: "all" });

  const year = parseInt(yearParam);
  const month = parseInt(monthParam);

  const [calendarData, setCalendarData] = useState<ShiftCalendarData | null>(null);
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      year: String(year),
      month: String(month),
    });
    if (group !== "all") params.set("group", group);

    const res = await fetch(`/api/shifts?${params}`);
    const data = await res.json();
    setCalendarData(data);
    setLoading(false);
  }, [year, month, group]);

  useEffect(() => {
    fetch("/api/groups").then((r) => r.json()).then(setGroups);
  }, []);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setYearParam(String(year - 1));
      setMonthParam("12");
    } else {
      setMonthParam(String(month - 1));
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYearParam(String(year + 1));
      setMonthParam("1");
    } else {
      setMonthParam(String(month + 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setYearParam(String(today.getFullYear()));
    setMonthParam(String(today.getMonth() + 1));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="シフトカレンダー"
        icon={<Calendar className="h-6 w-6" />}
      />

      <ShiftCalendarControls
        year={year}
        month={month}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        group={group}
        onGroupChange={setGroup}
        groups={groups}
      />

      {loading ? (
        <div className="flex justify-center py-12 text-muted-foreground">
          読み込み中...
        </div>
      ) : calendarData ? (
        <ShiftCalendarGrid
          year={calendarData.year}
          month={calendarData.month}
          daysInMonth={calendarData.daysInMonth}
          groups={calendarData.groups}
          onUpdate={fetchCalendar}
        />
      ) : null}
    </div>
  );
}

export default function ShiftsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12 text-muted-foreground">読み込み中...</div>}>
      <ShiftsContent />
    </Suspense>
  );
}
