import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";

import {
  getAllFamilyMemories,
} from "../../services/familyMemoryService";

import {
  getCardImageUrl,
} from "../../utils/supabaseImageUrl";

import familyMembers from "../../data/familyMembers";

export default function FamilyMemoryManager() {
  const navigate = useNavigate();

  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /*
  ============================================================================
  LOAD FAMILY MEMORIES
  ============================================================================
  */

  useEffect(() => {
    loadMemories();
  }, []);

  async function loadMemories() {
    try {
      setLoading(true);

      const data =
        await getAllFamilyMemories({
          includeUnpublished: true,
        });

      setMemories(data || []);
    } catch (err) {
      console.error(err);

      alert(
        "Unable to load family memories."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  ============================================================================
  GET MEMBER NAME
  ============================================================================
  */

  function getMemberName(memberKey) {
    const member =
      familyMembers.find(
        (item) =>
          item.key === memberKey
      );

    return (
      member?.name ||
      memberKey ||
      "Unknown"
    );
  }

  /*
  ============================================================================
  SEARCH
  ============================================================================
  */

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return memories;
      }

      return memories.filter(
        (memory) => {
          const memberName =
            getMemberName(
              memory.member_key
            );

          return (
            memberName
              .toLowerCase()
              .includes(query) ||

            memory.member_key
              ?.toLowerCase()
              .includes(query) ||

            memory.caption
              ?.toLowerCase()
              .includes(query) ||

            memory.media_type
              ?.toLowerCase()
              .includes(query)
          );
        }
      );
    }, [
      memories,
      search,
    ]);

  /*
  ============================================================================
  GROUP MEMORIES BY FAMILY MEMBER
  ============================================================================
  */

  const groupedMembers =
    useMemo(() => {
      const groups = {};

      filtered.forEach(
        (memory) => {
          const key =
            memory.member_key;

          if (!groups[key]) {
            groups[key] = [];
          }

          groups[key].push(memory);
        }
      );

      return Object.entries(groups)
        .map(
          ([
            memberKey,
            memberMemories,
          ]) => ({
            memberKey,
            memberName:
              getMemberName(
                memberKey
              ),
            memories:
              memberMemories,
          })
        )
        .sort(
          (a, b) =>
            a.memberName.localeCompare(
              b.memberName
            )
        );
    }, [
      filtered,
    ]);

  /*
  ============================================================================
  OPEN FAMILY MEMBER EDITOR

  The database currently stores each memory as its own row.

  Therefore the existing edit route still requires an ID.

  We open the editor using the first memory belonging to this family member.
  The next file we change will make that edit page load ALL memories for
  this family member rather than only this one row.
  ============================================================================
  */

  function handleEditFamilyMember(
    memberMemories
  ) {
    if (
      !memberMemories ||
      memberMemories.length === 0
    ) {
      return;
    }

    const firstMemory =
      memberMemories[0];

    navigate(
      `/admin/family-memories/edit/${firstMemory.id}`
    );
  }

  /*
  ============================================================================
  RENDER MEDIA PREVIEW
  ============================================================================
  */

  function renderMedia(memory) {
    const isVideo =
      memory.media_type ===
      "video";

    return (
      <div
        key={memory.id}
        className="
          relative
          aspect-square
          overflow-hidden
          rounded-2xl
          bg-[#F3EEE6]
          border-4
          border-[#E5D4B8]
          shadow-sm
        "
      >
        {isVideo ? (
          <>
            <video
              src={memory.media_url}
              muted
              preload="metadata"
              className="
                block
                w-full
                h-full
                object-cover
              "
            />

            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                bg-black/10
              "
            >
              <div
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-white/90
                  flex
                  items-center
                  justify-center
                  shadow-lg
                  text-xl
                "
              >
                ▶
              </div>
            </div>

            <div
              className="
                absolute
                left-3
                bottom-3
                rounded-full
                bg-[#5A5148]
                text-white
                px-3
                py-1
                text-xs
                font-semibold
              "
            >
              Video
            </div>
          </>
        ) : (
          <img
            src={getCardImageUrl(memory.media_url)}
            alt={
              memory.caption ||
              "Family memory"
            }
            className="
              block
              w-full
              h-full
              object-cover
            "
          />
        )}

        {!memory.published && (
          <div
            className="
              absolute
              top-3
              right-3
              rounded-full
              bg-white/95
              text-[#9A5050]
              px-3
              py-1
              text-xs
              font-semibold
              shadow-sm
            "
          >
            Draft
          </div>
        )}
      </div>
    );
  }

  /*
  ============================================================================
  RENDER
  ============================================================================
  */

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">

        {/* ================================================================
            HEADER
            ================================================================ */}

        <div
          className="
            flex
            justify-between
            items-center
            mb-10
            gap-6
          "
        >

          <div>

            <h1
              className="text-6xl"
              style={{
                fontFamily:
                  "Baloo 2",

                color:
                  "#5A5148",
              }}
            >
              Family Memories
            </h1>

            <p className="text-gray-500 mt-2">
              {memories.length}{" "}
              {memories.length === 1
                ? "Memory"
                : "Memories"}{" "}
              across{" "}
              {groupedMembers.length}{" "}
              {groupedMembers.length === 1
                ? "family member"
                : "family members"}
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/family-memories/new"
              )
            }
            className="
              bg-[#8FAE7A]
              text-white
              rounded-full
              px-8
              py-4
              font-semibold
              hover:bg-[#789961]
              transition
              whitespace-nowrap
            "
          >
            + Add Family Memory
          </button>

        </div>

        {/* ================================================================
            SEARCH
            ================================================================ */}

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search by family member, caption, or media type..."
          className="
            w-full
            rounded-2xl
            border
            px-5
            py-4
            mb-10
            outline-none
            focus:ring-2
            focus:ring-[#8FAE7A]
          "
        />

        {/* ================================================================
            CONTENT
            ================================================================ */}

        {loading ? (

          <div className="text-center py-24">
            Loading family memories...
          </div>

        ) : groupedMembers.length === 0 ? (

          <div
            className="
              bg-white
              rounded-3xl
              shadow-xl
              p-16
              text-center
            "
          >

            <div
              className="
                text-5xl
                mb-5
              "
            >
              📸
            </div>

            <h2
              className="text-3xl mb-2"
              style={{
                fontFamily:
                  "Baloo 2",

                color:
                  "#5A5148",
              }}
            >
              No family memories yet
            </h2>

            <p className="text-gray-500 mb-7">
              Add the first family memory
              from the admin panel.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/family-memories/new"
                )
              }
              className="
                bg-[#8FAE7A]
                text-white
                rounded-full
                px-7
                py-3
                font-semibold
                hover:bg-[#789961]
                transition
              "
            >
              + Add Family Memory
            </button>

          </div>

        ) : (

          <div
            className="
              grid
              lg:grid-cols-2
              gap-8
            "
          >

            {groupedMembers.map(
              (group) => {

                const photoCount =
                  group.memories.filter(
                    (memory) =>
                      memory.media_type !==
                      "video"
                  ).length;

                const videoCount =
                  group.memories.filter(
                    (memory) =>
                      memory.media_type ===
                      "video"
                  ).length;

                return (
                  <div
                    key={
                      group.memberKey
                    }
                    className="
                      bg-white
                      rounded-3xl
                      shadow-xl
                      overflow-hidden
                    "
                  >

                    {/* ==================================================
                        FAMILY MEMBER HEADER
                        ================================================== */}

                    <div
                      className="
                        p-7
                        pb-5
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                        "
                      >

                        <div>

                          <p
                            className="
                              text-sm
                              font-semibold
                              uppercase
                              tracking-wide
                            "
                            style={{
                              color:
                                "#8FAE7A",
                            }}
                          >
                            Family Member
                          </p>

                          <h2
                            className="text-4xl"
                            style={{
                              fontFamily:
                                "Baloo 2",

                              color:
                                "#5A5148",
                            }}
                          >
                            {group.memberName}
                          </h2>

                        </div>

                        <div
                          className="
                            text-right
                          "
                        >

                          <p
                            className="
                              text-2xl
                              font-bold
                            "
                            style={{
                              color:
                                "#5A5148",
                            }}
                          >
                            {
                              group.memories.length
                            }
                          </p>

                          <p
                            className="
                              text-xs
                              text-gray-400
                            "
                          >
                            {group.memories.length ===
                            1
                              ? "Memory"
                              : "Memories"}
                          </p>

                        </div>

                      </div>

                      {/* MEDIA SUMMARY */}

                      <div
                        className="
                          flex
                          gap-3
                          mt-4
                          flex-wrap
                        "
                      >

                        <span
                          className="
                            rounded-full
                            bg-[#EEF7E8]
                            text-[#527044]
                            px-4
                            py-2
                            text-sm
                            font-semibold
                          "
                        >
                          📷 {photoCount}{" "}
                          {photoCount === 1
                            ? "Photo"
                            : "Photos"}
                        </span>

                        {videoCount > 0 && (
                          <span
                            className="
                              rounded-full
                              bg-[#F0ECE7]
                              text-[#5A5148]
                              px-4
                              py-2
                              text-sm
                              font-semibold
                            "
                          >
                            🎥 {videoCount}{" "}
                            {videoCount === 1
                              ? "Video"
                              : "Videos"}
                          </span>
                        )}

                      </div>

                    </div>

                    {/* ==================================================
                        ALL MEDIA FOR THIS FAMILY MEMBER
                        ================================================== */}

                    <div
                      className="
                        px-7
                        pb-7
                      "
                    >

                      <div
                        className="
                          grid
                          grid-cols-3
                          sm:grid-cols-4
                          gap-3
                        "
                      >

                        {group.memories.map(
                          (
                            memory
                          ) =>
                            renderMedia(
                              memory
                            )
                        )}

                      </div>

                    </div>

                    {/* ==================================================
                        EDIT FAMILY MEMBER
                        ================================================== */}

                    <div
                      className="
                        px-7
                        pb-7
                      "
                    >

                      <button
                        type="button"
                        onClick={() =>
                          handleEditFamilyMember(
                            group.memories
                          )
                        }
                        className="
                          w-full
                          rounded-2xl
                          bg-[#EEF7E8]
                          text-[#5A5148]
                          py-4
                          font-semibold
                          hover:bg-[#E0EFD8]
                          transition
                        "
                      >
                        Edit{" "}
                        {group.memberName}{" "}
                        Memories
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>
    </AdminLayout>
  );
}