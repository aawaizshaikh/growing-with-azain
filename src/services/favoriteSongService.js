import { supabase } from "../lib/supabase";

/* ============================================================================
   GET ALL SONGS
============================================================================ */

export async function getFavoriteSongs() {
  const { data, error } = await supabase
    .from("favorite_songs")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;

  return data || [];
}

/* ============================================================================
   GET SINGLE SONG
============================================================================ */

export async function getFavoriteSong(id) {
  const { data, error } = await supabase
    .from("favorite_songs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

/* ============================================================================
   GET SONG BY SLUG
============================================================================ */

export async function getFavoriteSongBySlug(slug) {
  const { data, error } = await supabase
    .from("favorite_songs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;

  return data;
}

/* ============================================================================
   CREATE SONG
============================================================================ */

export async function createFavoriteSong(song) {
  const { data, error } = await supabase
    .from("favorite_songs")
    .insert(song)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/* ============================================================================
   UPDATE SONG
============================================================================ */

export async function updateFavoriteSong(id, song) {
  const { data, error } = await supabase
    .from("favorite_songs")
    .update(song)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/* ============================================================================
   DELETE SONG
============================================================================ */

export async function deleteFavoriteSong(id) {
  const { error } = await supabase
    .from("favorite_songs")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}