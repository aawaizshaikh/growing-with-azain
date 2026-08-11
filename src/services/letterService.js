import { supabase } from "../lib/supabase";


// ============================================================================
// GET PUBLISHED LETTERS
//
// Used by the public /letters page.
//
// Only published letters are returned.
// ============================================================================

export async function getPublishedLetters() {

  const {
    data,
    error,
  } = await supabase
    .from("letters")
    .select("*")
    .eq("published", true)
    .order("display_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });


  if (error) {

    console.error(
      "getPublishedLetters error:",
      error
    );

    throw error;
  }


  return data || [];
}


// ============================================================================
// GET ALL LETTERS
//
// Used by the Admin Letters Manager.
//
// Unlike getPublishedLetters(), this returns drafts as well.
// ============================================================================

export async function getLetters() {

  const {
    data,
    error,
  } = await supabase
    .from("letters")
    .select("*")
    .order("display_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });


  if (error) {

    console.error(
      "getLetters error:",
      error
    );

    throw error;
  }


  return data || [];
}


// ============================================================================
// GET LETTER BY ID
//
// Used by:
// /admin/letters/edit/:id
// ============================================================================

export async function getLetterById(id) {

  if (!id) {
    throw new Error(
      "Letter ID is required."
    );
  }


  const {
    data,
    error,
  } = await supabase
    .from("letters")
    .select("*")
    .eq("id", id)
    .maybeSingle();


  if (error) {

    console.error(
      "getLetterById error:",
      error
    );

    throw error;
  }


  if (!data) {

    throw new Error(
      "Letter not found."
    );
  }


  return data;
}


// ============================================================================
// GET LETTER BY SLUG
//
// Used by the public:
// /letters/:slug
//
// Only published letters are accessible publicly.
// ============================================================================

export async function getLetterBySlug(slug) {

  if (!slug) {
    throw new Error(
      "Letter slug is required."
    );
  }


  const {
    data,
    error,
  } = await supabase
    .from("letters")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();


  if (error) {

    console.error(
      "getLetterBySlug error:",
      error
    );

    throw error;
  }


  if (!data) {

    throw new Error(
      "Published letter not found."
    );
  }


  return data;
}


// ============================================================================
// CREATE LETTER
//
// Used by:
// /admin/letters/new
// ============================================================================

export async function createLetter(letter) {

  if (!letter) {
    throw new Error(
      "Letter data is required."
    );
  }


  const payload = {
    slot_key:
      letter.slot_key,

    title:
      letter.title,

    slug:
      letter.slug,

    letter_content:
      letter.letter_content || "",

    date:
      letter.date || null,

    age:
      letter.age || null,

    signature:
      letter.signature || null,

    published:
      Boolean(
        letter.published
      ),

    display_order:
      Number(
        letter.display_order
      ) || 0,
  };


  const {
    data,
    error,
  } = await supabase
    .from("letters")
    .insert(payload)
    .select()
    .single();


  if (error) {

    console.error(
      "createLetter error:",
      error
    );

    throw error;
  }


  return data;
}


// ============================================================================
// UPDATE LETTER
//
// Used by:
// /admin/letters/edit/:id
// ============================================================================

export async function updateLetter(
  id,
  letter
) {

  if (!id) {
    throw new Error(
      "Letter ID is required."
    );
  }


  if (!letter) {
    throw new Error(
      "Letter data is required."
    );
  }


  const payload = {
    slot_key:
      letter.slot_key,

    title:
      letter.title,

    slug:
      letter.slug,

    letter_content:
      letter.letter_content || "",

    date:
      letter.date || null,

    age:
      letter.age || null,

    signature:
      letter.signature || null,

    published:
      Boolean(
        letter.published
      ),

    display_order:
      Number(
        letter.display_order
      ) || 0,

    updated_at:
      new Date().toISOString(),
  };


  const {
    data,
    error,
  } = await supabase
    .from("letters")
    .update(payload)
    .eq("id", id)
    .select()
    .single();


  if (error) {

    console.error(
      "updateLetter error:",
      error
    );

    throw error;
  }


  return data;
}


// ============================================================================
// DELETE LETTER
//
// Used by:
// Admin Letters Manager
// Admin Edit Letter
// ============================================================================

export async function deleteLetter(id) {

  if (!id) {
    throw new Error(
      "Letter ID is required."
    );
  }


  const {
    error,
  } = await supabase
    .from("letters")
    .delete()
    .eq("id", id);


  if (error) {

    console.error(
      "deleteLetter error:",
      error
    );

    throw error;
  }


  return true;
}


// ============================================================================
// TOGGLE PUBLISHED
//
// Used by the Letters Manager.
// ============================================================================

export async function toggleLetterPublished(
  id,
  published
) {

  if (!id) {
    throw new Error(
      "Letter ID is required."
    );
  }


  const {
    data,
    error,
  } = await supabase
    .from("letters")
    .update({
      published:
        Boolean(published),

      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();


  if (error) {

    console.error(
      "toggleLetterPublished error:",
      error
    );

    throw error;
  }


  return data;
}