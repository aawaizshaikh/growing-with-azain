import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";
import FileUploader from "../../components/admin/FileUploader";

import familyMembers from "../../data/familyMembers";

import {
  getFamilyMemoryById,
  updateFamilyMemory,
  createFamilyMemory,
} from "../../services/familyMemoryService";

import {
  uploadMultiple,
} from "../../services/storageService";

/*
===============================================================================
EDIT FAMILY MEMORY
===============================================================================

Admin route:

    /admin/family-memories/edit/:id

IMPORTANT BEHAVIOUR
-------------------

This page edits ONE existing family-memory record.

The existing memory is NEVER replaced just because the admin selects new
files.

Instead:

    Existing memory
          +
    Additional selected files
          ↓
    Existing memory remains
          +
    Each new file becomes a NEW family_memories row

Example:

    Existing Dada photo
    Select 5 additional photos

Result:

    Existing Dada photo      → remains
    New photo 1              → new memory
    New photo 2              → new memory
    New photo 3              → new memory
    New photo 4              → new memory
    New photo 5              → new memory

This is intentional because the database stores each family memory as its
own row.

The existing family member identities remain hardcoded in:

    src/data/familyMembers.js

Actual memories remain in:

    family_memories

===============================================================================
*/

export default function EditFamilyMemory() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [memory, setMemory] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

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
  ADDITIONAL MEDIA
  ============================================================================

  This is deliberately an ARRAY.

  The existing media is not put into this state.

  Only NEW files selected by the admin are stored here.
  ============================================================================
  */

  const [additionalFiles, setAdditionalFiles] =
    useState([]);

  /*
  ============================================================================
  LOAD EXISTING MEMORY
  ============================================================================
  */

  useEffect(() => {
    let mounted = true;

    async function loadMemory() {
      if (!id) {
        alert("Family memory ID is missing.");
        navigate("/admin/family-memories");
        return;
      }

      try {
        setLoading(true);

        const data =
          await getFamilyMemoryById(id);

        if (!mounted) {
          return;
        }

        if (!data) {
          alert("Family memory not found.");
          navigate("/admin/family-memories");
          return;
        }

        setMemory(data);

        setMemberKey(
          data.member_key || ""
        );

        setCaption(
          data.caption || ""
        );

        setDisplayOrder(
          Number(data.display_order) || 1
        );

        setPublished(
          data.published ?? true
        );
      } catch (err) {
        console.error(
          "Unable to load family memory:",
          err
        );

        if (mounted) {
          alert(
            err?.message ||
              "Unable to load family memory."
          );

          navigate(
            "/admin/family-memories"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMemory();

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  /*
  ============================================================================
  SAVE / UPDATE
  ============================================================================
  */

  async function handleSave(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (!memory) {
      alert(
        "Family memory is not loaded yet."
      );
      return;
    }

    if (!memberKey) {
      alert(
        "Please select a family member."
      );
      return;
    }

    try {
      setSaving(true);

      /*
      ------------------------------------------------------------------------
      UPDATE EXISTING MEMORY
      ------------------------------------------------------------------------

      The original media_url is intentionally preserved.

      Selecting additional files does NOT replace it.
      ------------------------------------------------------------------------
      */

      const updatedMemory =
        await updateFamilyMemory(
          memory.id,
          {
            member_key:
              memberKey,

            media_type:
              memory.media_type ||
              "photo",

            media_url:
              memory.media_url,

            caption:
              caption.trim(),

            display_order:
              Number(displayOrder) || 1,

            published,
          }
        );

      /*
      ------------------------------------------------------------------------
      ADDITIONAL MEDIA
      ------------------------------------------------------------------------

      Every selected file becomes a NEW family memory.

      The first new memory starts after the existing memory's display order.
      ------------------------------------------------------------------------
      */

      if (
        Array.isArray(additionalFiles) &&
        additionalFiles.length > 0
      ) {
        const folderName =
          `family-memories/${memberKey}`;

        const mediaUrls =
          await uploadMultiple(
            additionalFiles,
            folderName
          );

        const startingOrder =
          (Number(displayOrder) || 1) + 1;

        for (
          let index = 0;
          index < mediaUrls.length;
          index += 1
        ) {
          const mediaUrl =
            mediaUrls[index];

          const file =
            additionalFiles[index];

          if (!mediaUrl || !file) {
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
      }

      /*
      ------------------------------------------------------------------------
      SUCCESS
      ------------------------------------------------------------------------
      */

      const addedCount =
        Array.isArray(additionalFiles)
          ? additionalFiles.length
          : 0;

      if (addedCount > 0) {
        alert(
          `Memory updated and ${addedCount} additional ${
            addedCount === 1
              ? "memory was"
              : "memories were"
          } added successfully!`
        );
      } else {
        alert(
          "Family memory updated successfully!"
        );
      }

      navigate(
        "/admin/family-memories"
      );
    } catch (err) {
      console.error(
        "Unable to update family memory:",
        err
      );

      alert(
        err?.message ||
          "Unable to update family memory."
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
  MEMBER NAME
  ============================================================================
  */

  const memberName =
    familyMembers.find(
      (member) =>
        member.key === memberKey
    )?.name ||
    memberKey ||
    "Family Member";

  /*
  ============================================================================
  LOADING
  ============================================================================
  */

  if (loading) {
    return (
      <AdminLayout>

        <div
          className="
            max-w-5xl
            mx-auto
            py-10
          "
        >
          <div
            className="
              bg-white
              rounded-3xl
              shadow-xl
              p-10
              text-center
              text-gray-500
            "
          >
            Loading family memory...
          </div>
        </div>

      </AdminLayout>
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
          Edit Family Memory
        </h1>

        <p
          className="
            text-gray-500
            mb-10
          "
        >
          Update this memory or add more
          photos and videos without replacing
          the existing memory.
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
            Saving changes
            {additionalFiles.length > 0
              ? ` and uploading ${additionalFiles.length} additional ${
                  additionalFiles.length === 1
                    ? "memory"
                    : "memories"
                }`
              : ""}
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
              This memory currently belongs
              to {memberName}.
            </p>

          </div>

          {/* ============================================================
              CURRENT MEDIA
              ============================================================ */}

          <div className="mt-8">

            <label
              className="
                block
                mb-3
                text-lg
                font-semibold
              "
            >
              Current Media
            </label>

            <div
              className="
                rounded-2xl
                overflow-hidden
                border
                border-[#E5DED1]
                bg-[#F3EEE6]
              "
            >

              {memory?.media_type ===
              "video" ? (
                <video
                  src={
                    memory.media_url
                  }
                  controls
                  playsInline
                  preload="metadata"
                  className="
                    block
                    w-full
                    max-h-[520px]
                    object-contain
                    bg-[#24180F]
                  "
                />
              ) : (
                <img
                  src={
                    memory?.media_url
                  }
                  alt={
                    memory?.caption ||
                    `${memberName} memory`
                  }
                  className="
                    block
                    w-full
                    max-h-[520px]
                    object-contain
                  "
                />
              )}

            </div>

            <p
              className="
                mt-3
                text-sm
                text-gray-400
              "
            >
              This existing media will remain
              unchanged unless you explicitly
              edit this memory's record.
            </p>

          </div>

          {/* ============================================================
              ADD MORE MEDIA
              ============================================================ */}

          <div className="mt-8">

            <FileUploader
              label="Add More Photos or Videos"
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
              onChange={
                setAdditionalFiles
              }
            />

            <div
              className="
                mt-3
                rounded-xl
                bg-[#F7F5EF]
                p-4
                text-sm
                text-gray-500
              "
            >
              <strong>
                Important:
              </strong>{" "}
              Selecting files here will
              <strong>
                {" "}add new memories
              </strong>
              . It will not replace the
              current photo/video above.
            </div>

          </div>

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
              placeholder="Add a caption for this memory..."
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
              If you add new files, this
              caption will also be applied to
              those new memory records.
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
              Display Order
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
              Additional files automatically
              start after this memory's order.
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
              the admin but are not shown on
              the public Family Memories page.
            </p>

          </div>

          {/* ============================================================
              SUBMIT
              ============================================================ */}

          <button
            type="submit"
            disabled={saving}
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
              ? "Saving..."
              : additionalFiles.length > 0
                ? `Save Changes + Add ${additionalFiles.length} ${
                    additionalFiles.length === 1
                      ? "Memory"
                      : "Memories"
                  }`
                : "Save Changes"}
          </button>

        </form>

      </div>

    </AdminLayout>
  );
}