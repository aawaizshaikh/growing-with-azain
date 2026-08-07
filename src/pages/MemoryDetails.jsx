import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getTimelineMemoryBySlug,
  getTimelineMemories,
} from "../services/timelineService";

export default function MemoryDetails() {
  const navigate = useNavigate();

  const { slug } = useParams();

  const [loading, setLoading] =
    useState(true);

  const [memory, setMemory] =
    useState(null);

  const [allMemories, setAllMemories] =
    useState([]);

  /*
  =====================================
  LOAD MEMORY
  =====================================
  */

  useEffect(() => {
    async function load() {
      try {
        const [current, all] =
          await Promise.all([
            getTimelineMemoryBySlug(slug),
            getTimelineMemories(),
          ]);

        setMemory(current);
        setAllMemories(all);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  /*
  =====================================
  PREVIOUS / NEXT
  =====================================
  */

  const currentIndex =
    allMemories.findIndex(
      (m) => m.slug === slug
    );

  const previousMemory =
    currentIndex > 0
      ? allMemories[currentIndex - 1]
      : null;

  const nextMemory =
    currentIndex <
    allMemories.length - 1
      ? allMemories[currentIndex + 1]
      : null;

  /*
  =====================================
  DATE
  =====================================
  */

  const formattedDate =
    memory?.date
      ? new Date(memory.date)
          .toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
      : "";

  /*
  =====================================
  GALLERY
  =====================================
  */

  let gallery = [];

  if (memory?.gallery) {
    if (Array.isArray(memory.gallery)) {
      gallery = memory.gallery;
    } else {
      try {
        gallery = JSON.parse(memory.gallery);
      } catch {
        gallery = [];
      }
    }
  }

  if (
    memory?.cover_image &&
    !gallery.includes(memory.cover_image)
  ) {
    gallery.unshift(memory.cover_image);
  }

  /*
  =====================================
  LOADING
  =====================================
  */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#7B6F63]">
        Loading memory...
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memory not found.
      </div>
    );
  }
    return (
    <main className="min-h-screen bg-[#FAF8F2]">

      {/* ======================================
          BACK BUTTON
      ====================================== */}

      <button
        onClick={() => navigate(-1)}
        className="
          fixed
          top-6
          left-6
          z-50
          w-12
          h-12
          rounded-full
          bg-white
          shadow-lg
          flex
          items-center
          justify-center
          hover:scale-105
          transition
        "
      >
        ←
      </button>

      <section className="max-w-6xl mx-auto px-6 py-20">

        {/* ======================================
            HERO IMAGE
        ====================================== */}

        <div className="overflow-hidden rounded-[34px] shadow-lg">

          <img
            src={memory.cover_image}
            alt={memory.title}
            className="
              w-full
              h-[520px]
              object-cover
            "
          />

        </div>

        {/* ======================================
            TITLE
        ====================================== */}

        <div className="mt-12 text-center">

          {memory.category && (

            <span
              className="
                inline-block
                px-4
                py-2
                rounded-full
                bg-[#EFE6D8]
                text-[#A67F4C]
                text-sm
                font-semibold
              "
            >
              {memory.category}
            </span>

          )}

          <h1
            className="
              mt-5
              text-6xl
              font-bold
              text-[#5A4332]
            "
            style={{
              fontFamily:
                "Cormorant Garamond, serif",
            }}
          >
            {memory.title}
          </h1>

          <p className="mt-4 text-[#8B7B69] text-lg">
            {formattedDate}
          </p>

        </div>

        {/* ======================================
            STORY
        ====================================== */}

        <div
          className="
            mt-16
            bg-[#FFFDF9]
            border
            border-[#EEE4D7]
            rounded-[30px]
            p-12
          "
        >

          <h2
            className="
              text-4xl
              font-bold
              text-[#5A4332]
            "
            style={{
              fontFamily:
                "Cormorant Garamond, serif",
            }}
          >
            Story
          </h2>

          <p
            className="
              mt-8
              leading-9
              text-lg
              text-[#74675B]
              whitespace-pre-wrap
            "
          >
            {memory.description}
          </p>

        </div>

        {/* ======================================
            PHOTO GALLERY
        ====================================== */}

        {gallery.length > 1 && (

          <div className="mt-20">

            <h2
              className="
                text-4xl
                font-bold
                text-[#5A4332]
                mb-10
              "
              style={{
                fontFamily:
                  "Cormorant Garamond, serif",
              }}
            >
              Gallery
            </h2>

            <div
              className="
                grid
                grid-cols-2
                md:grid-cols-3
                gap-6
              "
            >

              {gallery.map((image, index) => (

                <img
                  key={index}
                  src={image}
                  alt=""
                  className="
                    w-full
                    h-72
                    object-cover
                    rounded-3xl
                    shadow-md
                  "
                />

              ))}

            </div>

          </div>

        )}

        {/* ======================================
            PREVIOUS / NEXT
        ====================================== */}

        <div
          className="
            mt-20
            flex
            justify-between
            items-center
          "
        >

          {previousMemory ? (

            <button
              onClick={() =>
                navigate(
                  `/timeline/memory/${previousMemory.slug}`
                )
              }
              className="
                px-6
                py-3
                rounded-full
                bg-white
                border
                border-[#E8DDCF]
              "
            >
              ← Previous
            </button>

          ) : (
            <div />
          )}

          {nextMemory ? (

            <button
              onClick={() =>
                navigate(
                  `/timeline/memory/${nextMemory.slug}`
                )
              }
              className="
                px-6
                py-3
                rounded-full
                bg-[#B58A5A]
                text-white
              "
            >
              Next →
            </button>

          ) : (
            <div />
          )}

        </div>

      </section>

    </main>
  );
}