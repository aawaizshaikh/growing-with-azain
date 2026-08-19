import dadaPhoto from "../assets/illustrations/people/dada.webp";
import dadiPhoto from "../assets/illustrations/people/dadi.webp";
import nanaPhoto from "../assets/illustrations/people/nana.webp";
import naniPhoto from "../assets/illustrations/people/nani.webp";
import mummaPhoto from "../assets/illustrations/people/mumma.webp";
import papaPhoto from "../assets/illustrations/people/papa.webp";
import chachuPhoto from "../assets/illustrations/people/chachu.webp";
import mamuPhoto from "../assets/illustrations/people/mamu.webp";
import yaayaPhoto from "../assets/illustrations/people/yaya.webp";
import anshaPhoto from "../assets/illustrations/people/ansha.webp";

/**
 * ============================================================================
 * FAMILY MEMBERS
 * ============================================================================
 *
 * These family members are intentionally hardcoded.
 *
 * Their:
 * - names
 * - member keys
 * - profile photographs
 *
 * do NOT come from Supabase.
 *
 * Supabase is used ONLY for the memories belonging to each member.
 *
 * The `key` value must exactly match `member_key` in:
 *
 *     family_memories
 *
 * ============================================================================
 */

export const familyMembers = [
  {
    key: "dada",
    name: "Dada",
    photo: dadaPhoto,
  },

  {
    key: "dadi",
    name: "Dadi",
    photo: dadiPhoto,
  },

  {
    key: "nana",
    name: "Nana",
    photo: nanaPhoto,
  },

  {
    key: "nani",
    name: "Nani",
    photo: naniPhoto,
  },

  {
    key: "mumma",
    name: "Mumma",
    photo: mummaPhoto,
  },

  {
    key: "papa",
    name: "Papa",
    photo: papaPhoto,
  },

  {
    key: "chachu",
    name: "Chachu",
    photo: chachuPhoto,
  },

  {
    key: "mamu",
    name: "Mamu",
    photo: mamuPhoto,
  },

  {
    key: "yaaya",
    name: "Yaaya",
    photo: yaayaPhoto,
  },

  {
    key: "ansha",
    name: "Ansha",
    photo: anshaPhoto,
  },
];

/**
 * ============================================================================
 * GET FAMILY MEMBER
 * ============================================================================
 *
 * Example:
 *
 *     getFamilyMember("dada")
 *
 * Returns:
 *
 *     {
 *       key: "dada",
 *       name: "Dada",
 *       photo: ...
 *     }
 *
 * Returns null if the key is invalid.
 * ============================================================================
 */

export const getFamilyMember = (memberKey) => {
  if (!memberKey) {
    return null;
  }

  const normalizedKey = String(memberKey)
    .trim()
    .toLowerCase();

  return (
    familyMembers.find(
      (member) => member.key === normalizedKey
    ) || null
  );
};

/**
 * ============================================================================
 * VALID FAMILY MEMBER CHECK
 * ============================================================================
 */

export const isValidFamilyMember = (memberKey) => {
  return Boolean(
    getFamilyMember(memberKey)
  );
};

/**
 * ============================================================================
 * FAMILY MEMBER KEYS
 * ============================================================================
 *
 * Useful for:
 *
 * - validation
 * - admin dropdowns
 * - Supabase member_key validation
 *
 * ============================================================================
 */

export const familyMemberKeys =
  familyMembers.map(
    (member) => member.key
  );

export default familyMembers;