import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";
import FileUploader from "../../components/admin/FileUploader";

import familyMembers from "../../data/familyMembers";

import {
  createFamilyMemory,
} from "../../services/familyMemoryService";

import {
  uploadMultiple,
} from "../../services/storageService";

/*
===============================================================================
NEW FAMILY MEMORY
===============================================================================

Admin route:

    /admin/family-memories/new

The family members themselves are hardcoded.

The admin ONLY creates memories belonging to one of those members.

IMPORTANT:
This page now supports MULTIPLE media files in one upload.

Each selected file is:
    1. uploaded separately to Storage
    2. saved as its own family_memories database row
    3. assigned a sequential display_order

Example:

    Select Dada
    Select 5 photos

Result:

    Dada / Photo 1 / order 1
    Dada / Photo 2 / order 2
    Dada / Photo 3 / order 3
    Dada / Photo 4 / order 4
    Dada / Photo 5 / order 5

Database:

    family_memories

Fields:

    member_key
    media_type
    media_url
    caption
    display_order
    published

===============================================================================
*/

export default function NewFamilyMemory() {
  const navigate = useNavigate();

  const [saving, setSaving] =
    useState(false);

  const [memberKey, setMemberKey] =
    useState("");

  const [caption, setCaption] =
    useState("");

  const [displayOrder, setDisplayOrder] =
    useState(1);

  const [published, setPublished] =
    useState(true);

  /*
  ============================================================================
  MULTIPLE MEDIA FILES
  ============================================================================

  FileUploader with multiple={true} returns:

      File[]

  instead of a single File.
  ============================================================================
  */

  const [mediaFiles, setMediaFiles] =
    useState([]);

  /*
  ============================================================================
  SAVE
  ============================================================================
  */

  async function handleSave(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    /*
    --------------------------------------------------------------------------
    VALIDATION
    --------------------------------------------------------------------------
    */

    if (!memberKey) {
      alert(
        "Please select a family member."
      );

      return;
    }

    if (
      !Array.isArray(mediaFiles) ||
      mediaFiles.length === 0
    ) {
      alert(
        "Please upload at least one photo or video."
      );

      return;
    }

    try {
      setSaving(true);

      /*
      ------------------------------------------------------------------------
      STORAGE FOLDER
      ------------------------------------------------------------------------

      Keep the family member separated in Storage.

      Multiple uploads are placed under:

          family-memories/dada/gallery
          family-memories/dadi/gallery
          family-memories/mumma/gallery

      ------------------------------------------------------------------------
      */

      const folderName =
        `family-memories/${memberKey}`;

      /*
      ------------------------------------------------------------------------
      UPLOAD ALL FILES
      ------------------------------------------------------------------------

      uploadMultiple() uploads every selected file and returns an array
      containing the corresponding public URLs in the same order.
      ------------------------------------------------------------------------
      */

      const mediaUrls =
        await uploadMultiple(
          mediaFiles,
          folderName
        );

      /*
      ------------------------------------------------------------------------
      DATABASE
      ------------------------------------------------------------------------

      Each uploaded file becomes its OWN family memory row.

      The order starts from the value entered by the admin and increments
      automatically for every selected file.

      Example:

          Display Order = 5
          4 selected photos

          photo 1 -> 5
          photo 2 -> 6
          photo 3 -> 7
          photo 4 -> 8
      ------------------------------------------------------------------------
      */

      const startingOrder =
        Number(displayOrder) || 1;

      for (
        let index = 0;
        index < mediaUrls.length;
        index += 1
      ) {
        const file =
          mediaFiles[index];

        const mediaUrl =
          mediaUrls[index];

        if (!mediaUrl) {
          continue;
        }

        const mediaType =
          file.type?.startsWith(
            "video/"
          )
            ? "video"
            : "photo";

        await createFamilyMemory({
          member_key:
            memberKey,

          media_type:
            mediaType,

          media_url:
            mediaUrl,

          caption:
            caption.trim(),

          display_order:
            startingOrder + index,

          published,
        });
      }

      /*
      ------------------------------------------------------------------------
      SUCCESS
      ------------------------------------------------------------------------
      */

      alert(
        `${mediaUrls.length} family ${
          mediaUrls.length === 1
            ? "memory"
            : "memories"
        } created successfully!`
      );

      navigate(
        "/admin/family-memories"
      );
    } catch (err) {
      console.error(
        "Unable to create family memories:",
        err
      );

      alert(
        err?.message ||
          "Unable to create family memories."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  ============================================================================
  BACK
  ============================================================================
  */

  function handleBack() {
    if (saving) {
      return;
    }

    navigate(
      "/admin/family-memories"
    );
  }

  /*
  ============================================================================
  RENDER
  ============================================================================
  */

  return (
    <AdminLayout>

      <div
        className="
          max-w-5xl
          mx-auto
          py-10
        "
      >

        {/* ================================================================
            BACK
            ================================================================ */}

        <button
          type="button"
          onClick={handleBack}
          disabled={saving}
          className="
            mb-8
            text-[#8FAE7A]
            font-semibold
            hover:underline
            disabled:opacity-50
          "
        >
          ← Back to Family Memories
        </button>

        {/* ================================================================
            TITLE
            ================================================================ */}

        <h1
          className="
            text-6xl
            mb-2
          "
          style={{
            fontFamily:
              "Baloo 2",

            color:
              "#5A5148",
          }}
        >
          Add Family Memories
        </h1>

        <p className="text-gray-500 mb-10">
          Select multiple photos or videos
          and add them to a family member's
          memory collection at once.
        </p>

        {/* ================================================================
            SAVING MESSAGE
            ================================================================ */}

        {saving && (
          <div
            className="
              mb-6
              rounded-xl
              bg-[#EEF7E8]
              p-4
              text-[#5A5148]
              font-semibold
            "
          >
            Uploading and saving{" "}
            {mediaFiles.length}{" "}
            {mediaFiles.length === 1
              ? "memory"
              : "memories"}
            ...
          </div>
        )}

        {/* ================================================================
            FORM
            ================================================================ */}

        <form
          onSubmit={handleSave}
          className="
            bg-white
            rounded-3xl
            shadow-xl
            p-10
          "
        >

          <h2
            className="
              text-3xl
              mb-8
            "
            style={{
              fontFamily:
                "Baloo 2",
            }}
          >
            Memory Details
          </h2>

          {/* ============================================================
              FAMILY MEMBER
              ============================================================ */}

          <div>

            <label
              htmlFor="family-member"
              className="
                block
                mb-2
                font-semibold
              "
            >
              Family Member
            </label>

            <select
              id="family-member"
              value={memberKey}
              onChange={(event) =>
                setMemberKey(
                  event.target.value
                )
              }
              disabled={saving}
              required
              className="
                w-full
                border
                rounded-xl
                px-4
                py-3
                bg-white
              "
            >
              <option value="">
                Select family member
              </option>

              {familyMembers.map(
                (member) => (
                  <option
                    key={member.key}
                    value={member.key}
                  >
                    {member.name}
                  </option>
                )
              )}
            </select>

            <p
              className="
                mt-2
                text-sm
                text-gray-400
              "
            >
              Family members are fixed.
              This selection determines
              whose memories all selected
              media belongs to.
            </p>

          </div>

          {/* ============================================================
              MULTIPLE MEDIA
              ============================================================ */}

          <FileUploader
            label="Memory Photos or Videos"
            multiple={true}
            accept="
              image/*,
              video/*,
              .mp4,
              .mov,
              .m4v,
              .webm,
              .ogg
            "
            onChange={setMediaFiles}
          />

          <p
            className="
              mt-3
              text-sm
              text-gray-400
            "
          >
            You can select multiple files at
            once. You can also click the upload
            area again to add more files.
          </p>

          {/* ============================================================
              CAPTION
              ============================================================ */}

          <div className="mt-8">

            <label
              htmlFor="memory-caption"
              className="
                block
                mb-2
                font-semibold
              "
            >
              Caption
            </label>

            <textarea
              id="memory-caption"
              value={caption}
              onChange={(event) =>
                setCaption(
                  event.target.value
                )
              }
              disabled={saving}
              rows={4}
              placeholder="Write a small caption for these memories..."
              className="
                w-full
                border
                rounded-xl
                px-4
                py-3
                resize-y
              "
            />

            <p
              className="
                mt-2
                text-sm
                text-gray-400
              "
            >
              This caption will be applied to
              every selected memory.
            </p>

          </div>

          {/* ============================================================
              DISPLAY ORDER
              ============================================================ */}

          <div className="mt-8">

            <label
              htmlFor="display-order"
              className="
                block
                mb-2
                font-semibold
              "
            >
              Starting Display Order
            </label>

            <input
              id="display-order"
              type="number"
              min="1"
              step="1"
              value={displayOrder}
              onChange={(event) =>
                setDisplayOrder(
                  event.target.value
                )
              }
              disabled={saving}
              className="
                w-full
                border
                rounded-xl
                px-4
                py-3
              "
            />

            <p
              className="
                mt-2
                text-sm
                text-gray-400
              "
            >
              The first selected file gets
              this order number. The remaining
              files automatically continue in
              sequence.
            </p>

          </div>

          {/* ============================================================
              PUBLISHED
              ============================================================ */}

          <div className="mt-8">

            <label
              className="
                flex
                items-center
                gap-3
                cursor-pointer
              "
            >

              <input
                type="checkbox"
                checked={published}
                onChange={(event) =>
                  setPublished(
                    event.target.checked
                  )
                }
                disabled={saving}
                className="
                  w-4
                  h-4
                "
              />

              <span
                className="
                  font-semibold
                "
              >
                Published
              </span>

            </label>

            <p
              className="
                mt-2
                ml-7
                text-sm
                text-gray-400
              "
            >
              Unpublished memories remain in
              the admin but will not appear on
              the public Family Memories page.
            </p>

          </div>

          {/* ============================================================
              SUBMIT
              ============================================================ */}

          <button
            type="submit"
            disabled={
              saving ||
              !memberKey ||
              mediaFiles.length === 0
            }
            className="
              mt-10
              w-full
              bg-[#8FAE7A]
              hover:bg-[#789961]
              disabled:bg-gray-300
              disabled:cursor-not-allowed
              text-white
              py-4
              rounded-xl
              text-lg
              font-semibold
              transition
            "
          >
            {saving
              ? "Uploading..."
              : `Create ${
                  mediaFiles.length || ""
                } ${
                  mediaFiles.length === 1
                    ? "Family Memory"
                    : "Family Memories"
                }`}
          </button>

        </form>

      </div>

    </AdminLayout>
  );
}