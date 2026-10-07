import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clientOf } from "@/hooks/useDentalLab";
import { useClientSummaries, money, sameClient } from "./dlabMoney";

export default function DlabStatementsPage() {
  const { data, cases, payments, credits, isLoading } = useClientSummaries();
  const [client, setClient] = useState<string>("");
  const current = client || data[0]?.name || "";

  const lines = useMemo(() => {
    const rows = [
      ...cases.filter((c) => sameClient(clientOf(c), current)).map((c) => ({ date: c.created_at.slice(0, 10), text: `${c.case_number} · ${c.work_type}`, debit: Number(c.lab_fee || 0) - Number(c.discount || 0), credit: 0 })),
      ...payments.filter((p) => sameClient(p.title, current) && p.status !== "bounced").map((p) => ({ date: p.record_date || p.created_at.slice(0, 10), text: `Payment${p.data?.reference ? ` · ${p.data.reference}` : ""}`, debit: 0, credit: Number(p.amount || 0) })),
      ...credits.filter((p) => sameClient(p.title, current) && p.status !== "void").map((p) => ({ date: p.record_date || p.created_at.slice(0, 10), text: `Credit note${p.data?.invoice ? ` · ${p.data.invoice}` : ""}`, debit: 0, credit: Number(p.amount || 0) })),
    ].sort((a, b) => a.date.localeCompare(b.date));
    let bal = 0;
    return rows.map((r) => ({ ...r, balance: (bal += r.debit - r.credit) }));
  }, [cases, payments, credits, current]);
  const balance = lines.at(-1)?.balance || 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Statements" description="Running account per client clinic: work billed, payments and credits.">
        <Button variant="outline" onClick={() => window.print()} disabled={!current}><Printer className="mr-1 h-4 w-4" />Print</Button>
      </PageHeader>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Select value={current} onValueChange={setClient}>
          <SelectTrigger className="max-w-sm"><SelectValue placeholder="Choose a clinic" /></SelectTrigger>
          <SelectContent>{data.map((c) => <SelectItem key={c.name} value={c.name}>{c.name} · {money(c.balance)}</SelectItem>)}</SelectContent>
        </Select>
        {current && <p className="text-sm">Balance owing: <span className={`text-lg font-bold ${balance > 0 ? "text-destructive" : ""}`}>{money(balance)}</span></p>}
      </div>
      <Card><CardContent className="overflow-x-auto p-0">
        {isLoading ? <p className="p-6 text-sm text-muted-foreground">Loading…</p> : !lines.length ? (
          <p className="p-6 text-center text-sm text-muted-foreground">No activity for this client yet.</p>
        ) : (
          <table className="w-full min-w-[520px] text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
              <tr><th className="p-3">Date</th><th className="p-3">Details</th><th className="p-3 text-right">Billed</th><th className="p-3 text-right">Paid / credit</th><th className="p-3 text-right">Balance</th></tr>
            </thead>
            <tbody className="divide-y">
              {lines.map((l, i) => (
                <tr key={i}>
                  <td className="whitespace-nowrap p-3">{format(new Date(l.date), "d MMM yyyy")}</td>
                  <td className="p-3">{l.text}</td>
                  <td className="p-3 text-right">{l.debit ? money(l.debit) : ""}</td>
                  <td className="p-3 text-right">{l.credit ? money(l.credit) : ""}</td>
                  <td className="p-3 text-right font-medium">{money(l.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent></Card>
    </div>
  );
}
