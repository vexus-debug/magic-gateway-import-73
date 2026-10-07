import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useOrg } from "@/hooks/useOrg";
import type { LabCaseRow } from "@/hooks/useLabCases";

export const clientOf = (c: Partial<LabCaseRow>) => c.external_client_name || c.clinic_code || "Walk-in client";
export const patientOf = (c: Partial<LabCaseRow>) =>
  c.external_patient_name || (c.patients ? `${c.patients.first_name} ${c.patients.last_name}` : "—");
export const isRush = (c: Partial<LabCaseRow>) => !!(c.is_urgent || c.urgency === "urgent");
export const isOverdue = (c: Partial<LabCaseRow>) =>
  !!c.due_date && new Date(c.due_date) < new Date(new Date().toDateString()) && !["ready", "delivered"].includes(c.status || "");

export function useMoveCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const patch: any = { status };
      if (status === "design") patch.start_date = new Date().toISOString().slice(0, 10);
      if (status === "ready" || status === "delivered") patch.completed_date = new Date().toISOString().slice(0, 10);
      const { error } = await (supabase as any).from("lab_cases").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lab_cases"] }),
    onError: (e: any) => toast({ title: "Could not move case", description: e.message, variant: "destructive" }),
  });
}

export function useCreateDentalLabCase() {
  const qc = useQueryClient();
  const { currentOrg } = useOrg();
  return useMutation({
    mutationFn: async (v: Record<string, any>) => {
      const { data, error } = await (supabase as any).from("lab_cases").insert({
        org_id: currentOrg?.org_id, client_type: "external", status: "pending",
        external_client_name: v.client, clinic_doctor_name: v.doctor || "", external_patient_name: v.patient || "",
        work_type: v.work_type, shade: v.shade || "", material: v.material || "",
        instructions: [v.teeth ? `Teeth: ${v.teeth}` : "", v.instructions || ""].filter(Boolean).join("\n"),
        due_date: v.due_date || null, urgency: v.rush ? "urgent" : "normal", is_urgent: !!v.rush,
        lab_fee: Number(v.fee || 0),
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lab_cases"] }); toast({ title: "Case received" }); },
    onError: (e: any) => toast({ title: "Could not create case", description: e.message, variant: "destructive" }),
  });
}
