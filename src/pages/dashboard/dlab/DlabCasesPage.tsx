import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus, Search, ChevronRight, ChevronLeft, AlertTriangle, Zap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LAB_STAGES, WORK_TYPES, normalizeStage, stageLabel } from "@/config/dentalLab";
import { useLabCases, type LabCaseRow } from "@/hooks/useLabCases";
import { useMoveCase, useCreateDentalLabCase, clientOf, patientOf, isRush, isOverdue } from "@/hooks/useDentalLab";
import { CaseFiles } from "@/components/dlab/CaseFiles";

const money = (n: number) => `₦${Number(n || 0).toLocaleString()}`;

export default function DlabCasesPage() {
  const { data: cases = [], isLoading } = useLabCases();
  const move = useMoveCase();
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const visible = useMemo(() => cases.filter((c) =>
    !q || [c.case_number, clientOf(c), patientOf(c), c.work_type].join(" ").toLowerCase().includes(q.toLowerCase())), [cases, q]);
  const open = cases.find((c) => c.id === openId) || null;

  const step = (c: LabCaseRow, dir: 1 | -1) => {
    const i = LAB_STAGES.findIndex((s) => s.key === normalizeStage(c.status));
    const next = LAB_STAGES[i + dir];
    if (next) move.mutate({ id: c.id, status: next.key });
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Case Board" description="Every case from received to delivered. Tap a case to see scans and files.">
        <Button onClick={() => setCreating(true)}><Plus className="mr-1 h-4 w-4" />New case</Button>
      </PageHeader>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search case, clinic, patient…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading cases…</p> : (
        <div className="flex gap-3 overflow-x-auto pb-3 snap-x">
          {LAB_STAGES.map((stage) => {
            const list = visible.filter((c) => normalizeStage(c.status) === stage.key);
            return (
              <div key={stage.key} className="w-[260px] shrink-0 snap-start rounded-xl bg-muted/40 p-2">
                <div className="mb-2 flex items-center justify-between px-1">
                  <div><p className="text-sm font-semibold">{stage.label}</p><p className="text-[11px] text-muted-foreground">{stage.hint}</p></div>
                  <Badge variant="secondary">{list.length}</Badge>
                </div>
                <div className="space-y-2">
                  {list.map((c) => (
                    <Card key={c.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setOpenId(c.id)}>
                      <CardContent className="space-y-1.5 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{c.case_number}</span>
                          <div className="flex gap-1">
                            {isRush(c) && <Badge variant="destructive" className="px-1.5 text-[10px]"><Zap className="mr-0.5 h-3 w-3" />Rush</Badge>}
                            {isOverdue(c) && <Badge variant="outline" className="border-destructive px-1.5 text-[10px] text-destructive"><AlertTriangle className="mr-0.5 h-3 w-3" />Late</Badge>}
                          </div>
                        </div>
                        <p className="text-sm font-medium leading-tight">{c.work_type}</p>
                        <p className="text-xs text-muted-foreground">{clientOf(c)} · {patientOf(c)}</p>
                        {c.due_date && <p className="text-[11px] text-muted-foreground">Due {format(new Date(c.due_date), "d MMM")}</p>}
                        <div className="flex justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-7 w-7" disabled={stage.key === "pending"} onClick={() => step(c, -1)} aria-label="Move back"><ChevronLeft className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={stage.key === "delivered"} onClick={() => step(c, 1)}>Next stage<ChevronRight className="ml-0.5 h-3.5 w-3.5" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {!list.length && <p className="py-4 text-center text-xs text-muted-foreground">No cases</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open && (
            <>
              <SheetHeader><SheetTitle>{open.case_number} · {open.work_type}</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Info label="Client clinic" value={clientOf(open)} />
                  <Info label="Doctor" value={open.clinic_doctor_name || "—"} />
                  <Info label="Patient" value={patientOf(open)} />
                  <Info label="Due" value={open.due_date ? format(new Date(open.due_date), "d MMM yyyy") : "—"} />
                  <Info label="Shade" value={open.shade || "—"} />
                  <Info label="Material" value={open.material || "—"} />
                  <Info label="Fee" value={money(open.lab_fee)} />
                  <Info label="Stage" value={stageLabel(open.status)} />
                </div>
                {open.instructions && <div><p className="text-xs text-muted-foreground">Instructions</p><p className="whitespace-pre-wrap">{open.instructions}</p></div>}
                <div>
                  <Label className="text-xs text-muted-foreground">Move to stage</Label>
                  <Select value={normalizeStage(open.status)} onValueChange={(v) => move.mutate({ id: open.id, status: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{LAB_STAGES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <CaseFiles caseId={open.id} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <NewCaseDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>;
}

export function NewCaseDialog({ open, onOpenChange, defaultClient = "" }: { open: boolean; onOpenChange: (o: boolean) => void; defaultClient?: string }) {
  const create = useCreateDentalLabCase();
  const blank = { client: defaultClient, doctor: "", patient: "", work_type: WORK_TYPES[0], teeth: "", shade: "", material: "", due_date: "", fee: "", instructions: "", rush: false };
  const [v, setV] = useState<Record<string, any>>(blank);
  const set = (k: string, val: any) => setV((p) => ({ ...p, [k]: val }));
  const submit = async () => {
    if (!v.client.trim()) return;
    await create.mutateAsync(v);
    setV(blank);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) setV({ ...blank, client: defaultClient }); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Receive a new case</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="Client clinic *"><Input value={v.client} onChange={(e) => set("client", e.target.value)} /></F>
          <F label="Doctor"><Input value={v.doctor} onChange={(e) => set("doctor", e.target.value)} /></F>
          <F label="Patient"><Input value={v.patient} onChange={(e) => set("patient", e.target.value)} /></F>
          <F label="Work type">
            <Select value={v.work_type} onValueChange={(x) => set("work_type", x)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{WORK_TYPES.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Teeth"><Input placeholder="e.g. 11, 21" value={v.teeth} onChange={(e) => set("teeth", e.target.value)} /></F>
          <F label="Shade"><Input placeholder="e.g. A2" value={v.shade} onChange={(e) => set("shade", e.target.value)} /></F>
          <F label="Material"><Input value={v.material} onChange={(e) => set("material", e.target.value)} /></F>
          <F label="Due date"><Input type="date" value={v.due_date} onChange={(e) => set("due_date", e.target.value)} /></F>
          <F label="Fee (₦)"><Input type="number" value={v.fee} onChange={(e) => set("fee", e.target.value)} /></F>
          <label className="flex items-center gap-2 self-end pb-2 text-sm"><Checkbox checked={v.rush} onCheckedChange={(c) => set("rush", !!c)} />Rush case</label>
          <div className="sm:col-span-2"><F label="Instructions"><Textarea rows={3} value={v.instructions} onChange={(e) => set("instructions", e.target.value)} /></F></div>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!v.client.trim() || create.isPending}>Save case</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label>{children}</div>;
}
