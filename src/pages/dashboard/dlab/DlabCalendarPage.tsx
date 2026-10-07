import { useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLabCases } from "@/hooks/useLabCases";
import { clientOf, isRush } from "@/hooks/useDentalLab";
import { stageLabel } from "@/config/dentalLab";

export default function DlabCalendarPage() {
  const { data: cases = [] } = useLabCases();
  const [month, setMonth] = useState(new Date());
  const [picked, setPicked] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const byDay = useMemo(() => {
    const m: Record<string, typeof cases> = {};
    cases.forEach((c) => { if (c.due_date) (m[c.due_date] ||= []).push(c); });
    return m;
  }, [cases]);
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) });
  const list = byDay[picked] || [];

  return (
    <div className="space-y-5">
      <PageHeader title="Calendar" description="Cases by due date. Tap a day to see what must go out." />
      <Card><CardContent className="p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <Button size="icon" variant="ghost" onClick={() => setMonth(addMonths(month, -1))} aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></Button>
          <p className="font-semibold">{format(month, "MMMM yyyy")}</p>
          <Button size="icon" variant="ghost" onClick={() => setMonth(addMonths(month, 1))} aria-label="Next month"><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((d) => {
            const key = format(d, "yyyy-MM-dd");
            const n = byDay[key]?.length || 0;
            const sel = key === picked;
            return (
              <button key={key} onClick={() => setPicked(key)}
                className={`flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors ${sel ? "bg-primary text-primary-foreground" : isToday(d) ? "bg-primary/10" : "hover:bg-muted"} ${isSameMonth(d, month) ? "" : "opacity-40"}`}>
                {format(d, "d")}
                {n > 0 && <span className={`mt-0.5 rounded-full px-1.5 text-[10px] font-semibold ${sel ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"}`}>{n}</span>}
              </button>
            );
          })}
        </div>
      </CardContent></Card>
      <Card><CardContent className="divide-y p-4">
        <p className="pb-2 font-semibold">{format(new Date(picked), "EEEE d MMMM")}</p>
        {list.length === 0 && <p className="py-3 text-sm text-muted-foreground">No cases due.</p>}
        {list.map((c) => (
          <div key={c.id} className="flex justify-between gap-2 py-2 text-sm">
            <div className="min-w-0"><p className="truncate font-medium">{c.case_number} · {c.work_type}{isRush(c) ? " · Rush" : ""}</p><p className="truncate text-xs text-muted-foreground">{clientOf(c)}</p></div>
            <span className="shrink-0 text-xs text-muted-foreground">{stageLabel(c.status)}</span>
          </div>
        ))}
      </CardContent></Card>
    </div>
  );
}
