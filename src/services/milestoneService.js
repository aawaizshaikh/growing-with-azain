import { supabase } from "../lib/supabase";

/* ---------------- GET ALL ---------------- */

export async function getMilestones() {
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;

  return data;
}

/* ---------------- GET ONE ---------------- */

export async function getMilestone(id) {
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

/* ---------------- CREATE ---------------- */

export async function createMilestone(milestone) {
  const { data, error } = await supabase
    .from("milestones")
    .insert([milestone])
    .select();

  if (error) throw error;

  return data?.[0];
}

/* ---------------- UPDATE ---------------- */

export async function updateMilestone(id, milestone) {
  const { data, error } = await supabase
    .from("milestones")
    .update(milestone)
    .eq("id", id)
    .select();

  if (error) throw error;

  return data?.[0];
}

/* ---------------- DELETE ---------------- */

export async function deleteMilestone(id) {
  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", id);

  if (error) throw error;
}