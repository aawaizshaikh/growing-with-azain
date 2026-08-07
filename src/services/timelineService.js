import { supabase } from "../lib/supabase";

/* ===========================================================================
   GET ALL MEMORIES
=========================================================================== */

export async function getTimelineMemories() {
  const { data, error } = await supabase
    .from("timeline")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;

  return data || [];
}

/* ===========================================================================
   GET SINGLE MEMORY
=========================================================================== */

export async function getTimelineMemory(id) {
  const { data, error } = await supabase
    .from("timeline")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

/* ===========================================================================
   GET MEMORY BY SLUG
=========================================================================== */

export async function getTimelineMemoryBySlug(slug) {
  const { data, error } = await supabase
    .from("timeline")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;

  return data;
}

/* ===========================================================================
   CREATE MEMORY
=========================================================================== */

export async function createTimelineMemory(memory) {
  const { data, error } = await supabase
    .from("timeline")
    .insert(memory)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/* ===========================================================================
   UPDATE MEMORY
=========================================================================== */

export async function updateTimelineMemory(id, memory) {
  const { data, error } = await supabase
    .from("timeline")
    .update(memory)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/* ===========================================================================
   DELETE MEMORY
=========================================================================== */

export async function deleteTimelineMemory(id) {
  const { error } = await supabase
    .from("timeline")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}