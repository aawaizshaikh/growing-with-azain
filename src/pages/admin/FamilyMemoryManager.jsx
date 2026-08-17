import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";

import {
  deleteFamilyMemory,
  getAllFamilyMemories,
} from "../../services/familyMemoryService";

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
  DELETE
  ============================================================================
  */

  async function handleDelete(memory) {
    const memberName =
      getMemberName(
        memory.member_key
      );

    const confirmed =
      window.confirm(
        `Delete this memory from ${memberName}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteFamilyMemory(
        memory.id
      );

      setMemories((prev) =>
        prev.filter(
          (item) =>
            item.id !== memory.id
        )
      );

      alert(
        "Family memory deleted."
      );
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Unable to delete family memory."
      );
    }
  }

  /*
  ============================================================================
  EDIT
  ============================================================================
  */

  function handleEdit(memory) {
    navigate(
      `/admin/family-memories/edit/${memory.id}`
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
              {filtered.length}{" "}
              {filtered.length === 1
                ? "Memory"
                : "Memories"}
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

        ) : filtered.length === 0 ? (

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

            {filtered.map(
              (memory) => {

                const memberName =
                  getMemberName(
                    memory.member_key
                  );

                const isVideo =
                  memory.media_type ===
                  "video";

                return (
                  <div
                    key={
                      memory.id
                    }
                    className="
                      bg-white
                      rounded-3xl
                      shadow-xl
                      overflow-hidden
                    "
                  >

                    {/* ==================================================
                        MEDIA PREVIEW
                        ================================================== */}

                    <div
                      className="
                        relative
                        h-72
                        bg-[#F3EEE6]
                      "
                    >

                      {isVideo ? (

                        <video
                          src={
                            memory.media_url
                          }
                          muted
                          controls
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
                            memory.media_url
                          }
                          alt={
                            memory.caption ||
                            `${memberName} memory`
                          }
                          className="
                            block
                            w-full
                            h-full
                            object-cover
                          "
                        />

                      )}

                      {/* MEDIA TYPE */}

                      <div
                        className="
                          absolute
                          top-4
                          left-4
                          rounded-full
                          px-4
                          py-2
                          text-xs
                          font-bold
                          uppercase
                          tracking-wide
                        "
                        style={{
                          background:
                            isVideo
                              ? "#5A5148"
                              : "#8FAE7A",

                          color:
                            "#FFFFFF",
                        }}
                      >
                        {isVideo
                          ? "Video"
                          : "Photo"}
                      </div>

                      {/* PUBLISHED */}

                      <div
                        className="
                          absolute
                          top-4
                          right-4
                          rounded-full
                          px-4
                          py-2
                          text-xs
                          font-semibold
                        "
                        style={{
                          background:
                            memory.published
                              ? "rgba(238,247,232,0.96)"
                              : "rgba(255,241,241,0.96)",

                          color:
                            memory.published
                              ? "#527044"
                              : "#9A5050",
                        }}
                      >
                        {memory.published
                          ? "Published"
                          : "Draft"}
                      </div>

                    </div>

                    {/* ==================================================
                        DETAILS
                        ================================================== */}

                    <div className="p-7">

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                          mb-4
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
                            className="text-3xl"
                            style={{
                              fontFamily:
                                "Baloo 2",

                              color:
                                "#5A5148",
                            }}
                          >
                            {memberName}
                          </h2>

                        </div>

                        <div
                          className="
                            text-right
                          "
                        >

                          <p className="text-xs text-gray-400">
                            Order
                          </p>

                          <p
                            className="
                              text-xl
                              font-bold
                            "
                            style={{
                              color:
                                "#5A5148",
                            }}
                          >
                            {memory.display_order ??
                              0}
                          </p>

                        </div>

                      </div>

                      {/* CAPTION */}

                      {memory.caption ? (

                        <p
                          className="
                            text-gray-600
                            leading-relaxed
                            mb-6
                          "
                        >
                          {memory.caption}
                        </p>

                      ) : (

                        <p
                          className="
                            text-gray-400
                            italic
                            mb-6
                          "
                        >
                          No caption
                        </p>

                      )}

                      {/* ACTIONS */}

                      <div
                        className="
                          flex
                          gap-3
                        "
                      >

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              memory
                            )
                          }
                          className="
                            flex-1
                            rounded-xl
                            bg-[#EEF7E8]
                            text-[#5A5148]
                            py-3
                            font-semibold
                            hover:bg-[#E0EFD8]
                            transition
                          "
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              memory
                            )
                          }
                          className="
                            flex-1
                            rounded-xl
                            bg-[#FFF0F0]
                            text-[#A24D4D]
                            py-3
                            font-semibold
                            hover:bg-[#FFE2E2]
                            transition
                          "
                        >
                          Delete
                        </button>

                      </div>

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