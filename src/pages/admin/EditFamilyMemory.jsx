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
  deleteFile,
} from "../../services/storageService";

import { supabase } from "../../lib/supabase";

import {
  getCardImageUrl,
} from "../../utils/supabaseImageUrl";

/*
===============================================================================
EDIT FAMILY MEMORY
===============================================================================

Admin route:

    /admin/family-memories/edit/:id

IMPORTANT BEHAVIOUR
-------------------

This page edits an existing family-memory record while also allowing the
admin to manage ALL media belonging to the selected family member.

Existing media is shown together under the family member's name.

The admin can:
    - See all photos/videos for the family member
    - Keep any media
    - Mark any media for removal
    - Save all removals together
    - Add multiple new photos/videos at the same time

The database still stores each family memory as its own row.

The existing family member identities remain hardcoded in:

    src/data/familyMembers.js

Actual memories remain in:

    family_memories

===============================================================================
*/

export default function EditFamilyMemory() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [memory, setMemory] = useState(null);

  const [familyMedia, setFamilyMedia] = useState([]);
  const [removedMediaIds, setRemovedMediaIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [memberKey, setMemberKey] = useState("");

  const [caption, setCaption] = useState("");

  const [displayOrder, setDisplayOrder] = useState(1);

  const [published, setPublished] = useState(true);

  /*
  ============================================================================
  ADDITIONAL MEDIA
  ============================================================================

  This is deliberately an ARRAY.

  New files selected by the admin are uploaded as NEW family_memories rows.
  ============================================================================
  */

  const [additionalFiles, setAdditionalFiles] = useState([]);

  /*
  ============================================================================
  LOAD ALL MEDIA FOR FAMILY MEMBER
  ============================================================================
  */

  async function loadFamilyMedia(selectedMemberKey) {
    if (!selectedMemberKey) {
      setFamilyMedia([]);
      return;
    }

    try {
      setMediaLoading(true);

      const { data, error } = await supabase
        .from("family_memories")
        .select("*")
        .eq("member_key", selectedMemberKey)
        .order("display_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setFamilyMedia(data || []);
      setRemovedMediaIds([]);
    } catch (err) {
      console.error(
        "Unable to load family member media:",
        err
      );

      alert(
        err?.message ||
          "Unable to load all family member media."
      );

      setFamilyMedia([]);
    } finally {
      setMediaLoading(false);
    }
  }

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

        await loadFamilyMedia(
          data.member_key || ""
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
  MEMBER CHANGE
  ============================================================================

  If the admin changes the family member, refresh the media shown below so
  the page always shows the complete media collection for that member.
  ============================================================================
  */

  async function handleMemberChange(event) {
    const nextMemberKey = event.target.value;

    setMemberKey(nextMemberKey);
    setRemovedMediaIds([]);

    await loadFamilyMedia(nextMemberKey);
  }

  /*
  ============================================================================
  MARK / UNMARK MEDIA FOR REMOVAL
  ============================================================================
  */

  function toggleMediaRemoval(mediaId) {
    setRemovedMediaIds((current) => {
      if (current.includes(mediaId)) {
        return current.filter(
          (idValue) => idValue !== mediaId
        );
      }

      return [
        ...current,
        mediaId,
      ];
    });
  }

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
      UPDATE THE ORIGINAL MEMORY
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

      if (updatedMemory) {
        setMemory(updatedMemory);
      }

      /*
      ------------------------------------------------------------------------
      DELETE ALL MEDIA MARKED FOR REMOVAL
      ------------------------------------------------------------------------

      Each selected item is removed from storage and then from the
      family_memories table.

      This happens only when the admin clicks Save Changes.
      ------------------------------------------------------------------------
      */

      const mediaToRemove =
        familyMedia.filter((item) =>
          removedMediaIds.includes(item.id)
        );

      for (const media of mediaToRemove) {
        try {
          await deleteFile(
            media.media_url
          );
        } catch (storageError) {
          console.error(
            "Unable to delete media file:",
            storageError
          );
        }

        const {
          error: deleteError,
        } = await supabase
          .from("family_memories")
          .delete()
          .eq("id", media.id);

        if (deleteError) {
          throw deleteError;
        }
      }

      /*
      ------------------------------------------------------------------------
      ADDITIONAL MEDIA
      ------------------------------------------------------------------------

      Every selected file becomes a NEW family memory.

      This preserves the existing multi-file upload behaviour.
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

        const remainingOrders =
          familyMedia
            .filter(
              (item) =>
                !removedMediaIds.includes(
                  item.id
                )
            )
            .map(
              (item) =>
                Number(
                  item.display_order
                ) || 0
            );

        const highestExistingOrder =
          remainingOrders.length > 0
            ? Math.max(
                ...remainingOrders
              )
            : Number(displayOrder) || 1;

        const startingOrder =
          highestExistingOrder + 1;

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

      const removedCount =
        mediaToRemove.length;

      const addedCount =
        Array.isArray(additionalFiles)
          ? additionalFiles.length
          : 0;

      let successMessage =
        "Family memory changes saved successfully!";

      if (
        removedCount > 0 &&
        addedCount > 0
      ) {
        successMessage =
          `${removedCount} ${
            removedCount === 1
              ? "media item was"
              : "media items were"
          } removed and ${addedCount} ${
            addedCount === 1
              ? "new memory was"
              : "new memories were"
          } added successfully!`;
      } else if (removedCount > 0) {
        successMessage =
          `${removedCount} ${
            removedCount === 1
              ? "media item was"
              : "media items were"
          } removed successfully!`;
      } else if (addedCount > 0) {
        successMessage =
          `${addedCount} ${
            addedCount === 1
              ? "new memory was"
              : "new memories were"
          } added successfully!`;
      }

      alert(successMessage);

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
          Manage all photos and videos
          belonging to one family member.
          Choose what to keep, remove,
          or add new memories.
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
            {memberName}'s Memories
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
              onChange={handleMemberChange}
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
              Showing all photos and
              videos currently saved for{" "}
              <strong>
                {memberName}
              </strong>.
            </p>
          </div>

          {/* ============================================================
              ALL FAMILY MEDIA
              ============================================================ */}

          <div className="mt-8">

            <div className="
              flex
              items-center
              justify-between
              gap-4
              mb-4
            ">
              <label
                className="
                  block
                  text-lg
                  font-semibold
                "
              >
                All Photos & Videos
              </label>

              {familyMedia.length > 0 && (
                <span
                  className="
                    text-sm
                    text-gray-400
                  "
                >
                  {familyMedia.length}{" "}
                  {familyMedia.length === 1
                    ? "item"
                    : "items"}
                </span>
              )}
            </div>

            {mediaLoading ? (
              <div
                className="
                  rounded-2xl
                  border
                  border-[#E5DED1]
                  bg-[#F7F5EF]
                  p-10
                  text-center
                  text-gray-500
                "
              >
                Loading {memberName}'s
                photos and videos...
              </div>
            ) : familyMedia.length === 0 ? (
              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-[#D8D0C3]
                  bg-[#F7F5EF]
                  p-10
                  text-center
                  text-gray-500
                "
              >
                No photos or videos found
                for {memberName}.
              </div>
            ) : (
              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                  gap-5
                "
              >
                {familyMedia.map(
                  (media, index) => {
                    const isRemoved =
                      removedMediaIds.includes(
                        media.id
                      );

                    return (
                      <div
                        key={media.id}
                        className={`
                          rounded-2xl
                          overflow-hidden
                          border
                          ${
                            isRemoved
                              ? "border-red-400 bg-red-50"
                              : "border-[#E5DED1] bg-[#F7F5EF]"
                          }
                        `}
                      >

                        <div
                          className="
                            relative
                            aspect-[4/3]
                            bg-[#24180F]
                          "
                        >
                          {media.media_type ===
                          "video" ? (
                            <video
                              src={
                                media.media_url
                              }
                              controls
                              playsInline
                              preload="metadata"
                              className="
                                block
                                w-full
                                h-full
                                object-cover
                              "
                            />
                          ) : (
                            <img
                              src={
                                getCardImageUrl(
                                  media.media_url
                                )
                              }
                              alt={
                                media.caption ||
                                `${memberName} memory ${
                                  index + 1
                                }`
                              }
                              className="
                                block
                                w-full
                                h-full
                                object-cover
                              "
                            />
                          )}

                          {isRemoved && (
                            <div
                              className="
                                absolute
                                inset-0
                                bg-black/50
                                flex
                                items-center
                                justify-center
                              "
                            >
                              <span
                                className="
                                  bg-red-600
                                  text-white
                                  px-4
                                  py-2
                                  rounded-full
                                  font-semibold
                                "
                              >
                                Marked for removal
                              </span>
                            </div>
                          )}
                        </div>

                        <div
                          className="
                            p-4
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-3
                              mb-3
                            "
                          >
                            <span
                              className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wide
                                text-gray-400
                              "
                            >
                              {media.media_type ===
                              "video"
                                ? "Video"
                                : "Photo"}{" "}
                              #{index + 1}
                            </span>

                            <span
                              className="
                                text-xs
                                text-gray-400
                              "
                            >
                              Order{" "}
                              {Number(
                                media.display_order
                              ) || 1}
                            </span>
                          </div>

                          {media.caption && (
                            <p
                              className="
                                text-sm
                                text-[#5A5148]
                                mb-4
                                line-clamp-2
                              "
                            >
                              {media.caption}
                            </p>
                          )}

                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              toggleMediaRemoval(
                                media.id
                              )
                            }
                            className={`
                              w-full
                              py-2.5
                              rounded-xl
                              font-semibold
                              transition
                              ${
                                isRemoved
                                  ? "bg-[#8FAE7A] hover:bg-[#789961] text-white"
                                  : "bg-red-100 hover:bg-red-200 text-red-700"
                              }
                              disabled:opacity-50
                            `}
                          >
                            {isRemoved
                              ? "Keep This Media"
                              : "Remove This Media"}
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {removedMediaIds.length > 0 && (
              <div
                className="
                  mt-4
                  rounded-xl
                  bg-red-50
                  border
                  border-red-100
                  p-4
                  text-sm
                  text-red-700
                "
              >
                <strong>
                  {removedMediaIds.length}
                </strong>{" "}
                {removedMediaIds.length === 1
                  ? "item is"
                  : "items are"}{" "}
                marked for removal.
                They will be permanently
                removed when you click{" "}
                <strong>
                  Save Changes
                </strong>
                .
              </div>
            )}
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
              Selected files will be added
              as new memories for{" "}
              <strong>
                {memberName}
              </strong>
              . They will not replace the
              existing media.
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
              New files automatically
              continue after the highest
              existing display order.
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
              : removedMediaIds.length > 0 &&
                additionalFiles.length > 0
                ? `Save Changes — Remove ${removedMediaIds.length} + Add ${additionalFiles.length}`
                : removedMediaIds.length > 0
                  ? `Save Changes — Remove ${removedMediaIds.length}`
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