// ==============================
// SCRAPBOOK ILLUSTRATIONS
// ==============================

import blob1 from "../assets/illustrations/blob-1.png";
import blob2 from "../assets/illustrations/blob-2.png";
import blob3 from "../assets/illustrations/blob-3.png";
import hotAirBalloon from "../assets/illustrations/hot-air-baloon.png";
import headphones from "../assets/illustrations/headphones.png";
import heart from "../assets/illustrations/heart.png";
import polaroidShadow from "../assets/illustrations/polaroid-shadow.png";

import paintSplash from "../assets/illustrations/paint-splash.png";

import butterfly from "../assets/illustrations/butterfly.png";
import floatingLeaves from "../assets/illustrations/floating-leaves.png";
import sparkles from "../assets/illustrations/sparkles.png";

import headerDecoration from "../assets/illustrations/timeline-header-decoration.png";

import cloud from "../assets/illustrations/floating-cloud.png";

import leafDivider from "../assets/illustrations/leaf-divider.png";

import storyPaper from "../assets/illustrations/timeline-story-paper.png";

import goldClip from "../assets/illustrations/paperclip-gold.png";
import silverClip from "../assets/illustrations/paperclip-silver.png";

import washiCream from "../assets/illustrations/washi-tape-cream.png";
import washiFloral from "../assets/illustrations/washi-tape-floral.png";

import photoCorner from "../assets/illustrations/photo-corner.png";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

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

  // NEW
  const [lightboxIndex, setLightboxIndex] =
    useState(null);

  /*
  ======================================
  LOAD MEMORY
  ======================================
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
        setAllMemories(all || []);

      } catch (err) {
        console.error(err);

      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  /*
  ======================================
  GALLERY
  ======================================
  */

  const gallery = useMemo(() => {
    if (!memory) return [];

    let images = [];

    if (
      Array.isArray(memory.gallery_images)
    ) {
      images = [...memory.gallery_images];

    } else if (
      typeof memory.gallery_images ===
      "string"
    ) {
      try {
        images = JSON.parse(
          memory.gallery_images
        );
      } catch {
        images = [];
      }
    }

    if (
      memory.cover_image &&
      !images.includes(memory.cover_image)
    ) {
      images.unshift(memory.cover_image);
    }

    return images;

  }, [memory]);

  /*
  ======================================
  HIGHLIGHTS
  ======================================
  */

  const highlights = useMemo(() => {
    if (!memory?.highlights)
      return [];

    if (
      Array.isArray(memory.highlights)
    ) {
      return memory.highlights;
    }

    try {
      return JSON.parse(
        memory.highlights
      );
    } catch {
      return [];
    }

  }, [memory]);

  /*
  ======================================
  KEYBOARD CONTROLS
  ======================================
  */

  useEffect(() => {
    function handleKey(e) {

      if (lightboxIndex === null)
        return;

      if (e.key === "Escape") {
        setLightboxIndex(null);
      }

      if (
        e.key === "ArrowRight" &&
        lightboxIndex <
          gallery.length - 1
      ) {
        setLightboxIndex(
          lightboxIndex + 1
        );
      }

      if (
        e.key === "ArrowLeft" &&
        lightboxIndex > 0
      ) {
        setLightboxIndex(
          lightboxIndex - 1
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );

  }, [lightboxIndex, gallery]);

  /*
  ======================================
  PREVIOUS / NEXT
  ======================================
  */
 const currentIndex = allMemories.findIndex(
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

const formattedDate = memory?.date
  ? new Date(memory.date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    )
  : "";
  // ==============================
// SCRAPBOOK HELPERS
// ==============================

const blobs = [blob1, blob2, blob3];

const tapes = [
  washiCream,
  washiFloral,
];

const clips = [
  goldClip,
  silverClip,
];

const rotations = [
  "-rotate-2",
  "rotate-1",
  "-rotate-1",
  "rotate-2",
  "-rotate-3",
  "rotate-3",
];

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center text-xl">
      Loading memory...
    </div>
  );
}

if (!memory) {
  return (
    <div className="min-h-screen flex items-center justify-center text-xl">
      Memory not found.
    </div>
  );
}

return (


<main
  className="
    relative
    min-h-0
    overflow-x-hidden
    bg-[#FAF7F2]
  "
>

  {/* ======================================
      SCRAPBOOK BACKGROUND
  ====================================== */}

  <img
    src={blob1}
    alt=""
    className="
      pointer-events-none
      absolute
      top-0
      left-0
      w-[340px]
      opacity-70
      select-none
      -z-10
    "
  />

  <img
    src={blob2}
    alt=""
    className="
      pointer-events-none
      absolute
      top-[550px]
      right-0
      w-[360px]
      opacity-70
      select-none
      -z-10
    "
  />

  <img
    src={blob3}
    alt=""
    className="
      pointer-events-none
      absolute
      bottom-0
      left-0
      w-[450px]
      opacity-60
      select-none
      -z-10
    "
  />

  <img
    src={paintSplash}
    alt=""
    className="
      pointer-events-none
      absolute
      top-24
      right-10
      w-600
      opacity-25
      select-none
    "
  />

  <img
    src={paintSplash}
    alt=""
    className="
      pointer-events-none
      absolute
      bottom-44
      left-12
      w-56
      opacity-20
      rotate-180
      select-none
    "
  />

  <img
    src={sparkles}
    alt=""
    className="
      pointer-events-none
      absolute
      top-40
      left-20
      w-100
      opacity-70
      animate-pulse
      select-none
    "
  />

  <img
    src={sparkles}
    alt=""
    className="
      pointer-events-none
      absolute
      right-24
      top-[900px]
      w-100
      opacity-60
      animate-pulse
      select-none
    "
  />  

  {/* ============================
      BACK BUTTON
  ============================ */}

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
      shadow-xl
      flex
      items-center
      justify-center
      hover:scale-105
      transition
    "
  >
    ←
  </button>



   {/* ======================================
    SCRAPBOOK HERO PHOTO
====================================== */}

<div className="relative max-w-4xl mx-auto px-6">

  <div className="relative">

    {/* Watercolor Blob */}

    <img
      src={blob2}
      alt=""
      className="
        absolute
        -left-16
        -top-14
        w-72
        opacity-40
        pointer-events-none
      "
    />
    <img
  src={hotAirBalloon}
  alt=""
  className="
    absolute
    right-[80px]
    top-[420px]
    w-[120px]
    rotate-[-5deg]
    pointer-events-none
    z-20
    float-soft
  "
/>

    {/* Butterfly */}

    <img
  src={butterfly}
  alt=""
  className="
    absolute
    left-[120px]
    top-[420px]
    w-[190px]
    rotate-[-15deg]
    pointer-events-none
    z-30
    float-soft
  "
/>

    {/* Floating Leaves */}

    

    {/* Photo */}

    <div
      className="
        relative
        rounded-[40px]
        overflow-hidden
        bg-white
        p-3
        shadow-[0_18px_50px_rgba(0,0,0,0.12)]
      "
    >

      {/* Photo Corners */}

      <img
        src={photoCorner}
        alt=""
        className="
          absolute
          top-3
          left-3
          w-10
          z-20
        "
      />

      <img
        src={photoCorner}
        alt=""
        className="
          absolute
          top-3
          right-3
          w-10
          rotate-90
          z-20
        "
      />

      <img
        src={photoCorner}
        alt=""
        className="
          absolute
          bottom-3
          left-3
          w-10
          -rotate-90
          z-20
        "
      />

      <img
        src={photoCorner}
        alt=""
        className="
          absolute
          bottom-3
          right-3
          w-10
          rotate-180
          z-20
        "
      />

      <img
        src={memory.cover_image}
        alt={memory.title}
        className="
          w-full
          h-[420px]
          object-cover
          rounded-[28px]
          object-[center_30%]
        "
      />

    </div>

  </div>

</div>
      {/* ======================================
      SCRAPBOOK HEADER
  ====================================== */}

  <section className="max-w-4xl mx-auto px-6 -mt-24">

    <img
      src={cloud}
      alt=""
      className="
        absolute
        left-10
        top-60
        w-600
        opacity-80
        pointer-events-none
        float-soft
      "
    />

    
    <img
      src={butterfly}
      alt=""
      className="
        absolute
        right-[18%]
        top-28
        w-50
        rotate-12
        pointer-events-none
        float-soft
      "
    />

    <div className="max-w-5xl mx-auto px-6 text-center">

      <img
        src={headerDecoration}
        alt=""
        className="
          w-[140px]
          mx-auto
          mb-2
        "
      />

      <span
        className="
          inline-flex
          items-center
          rounded-full
          bg-[#F4E7D2]
          px-6
          py-2
          text-[#9A7146]
          font-semibold
          tracking-wide
          shadow-sm
        "
      >
        {memory.category}
      </span>

      <h1
        className="
          mt-0
          mb-0
          text-2xl
          md:text-3xl
          font-bold
          text-[#5B4333]
          leading-none
        "
        style={{
          fontFamily:
            "Cormorant Garamond, serif",
        }}
      >
        {memory.title}
      </h1>

      <img
        src={leafDivider}
        alt=""
        className="
          w-32
          mx-auto
          mt-0
          mb-0
        "
      />

      <p
        className="
          text-[#8B7867]
          text-xs
          tracking-wide
        "
      >
        {formattedDate}
      </p>

      {memory.age && (

        <div className="mt-1">

          <span
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[#EEF6E9]
              px-6
              py-3
              text-[#6B8C59]
              font-semibold
              shadow-md
            "
          >
            🍼 {memory.age}
          </span>

        </div>

      )}

    </div>

  </section>

    

{/* ======================================
    SCRAPBOOK STORY
====================================== */}

<div className="relative mt-2">

  {/* Watercolor Background */}

  <img
    src={blob3}
    alt=""
    className="
      absolute
      -left-20
      top-10
      w-[500px]
      opacity-40
      pointer-events-none
    "
  />

  {/* Story Paper */}

  <div className="relative max-w-5xl mx-auto">

    {/* Washi Tape */}

    <img
      src={washiCream}
      alt=""
      className="
        absolute
        top-2
        left-14
        w-36
        -rotate-12
        z-30
      "
    />

    {/* Paper Clip */}

    <img
      src={goldClip}
      alt=""
      className="
        absolute
        top-4
        right-14
        w-14
        rotate-12
        z-30
      "
    />

    {/* Decorative Leaf */}

    

    {/* Paper */}

    <div className="relative">

      <img
        src={storyPaper}
        alt=""
        className="
          w-[1020px]
          h-[200px]
          select-none
          pointer-events-none
        "
      />

      {/* Content */}

      <div
        className="
          absolute
          inset-0
          px-10
          py-4
          md:px-16
          md:py-6
          flex
          flex-col
        "
      >

        <h2
          className="
            text-3xl
            text-[#5A4332]
            font-bold
          "
          style={{
            fontFamily:
              "Cormorant Garamond, serif",
          }}
        >
          Our Story
        </h2>

        <img
          src={leafDivider}
          alt=""
          className="
            w-40
            mt-2
            mb-3
          "
        />

        <div
          className="
            text-[#695A4E]
            text-sm
            leading-6
            whitespace-pre-wrap
            overflow-y-auto
            pr-2
            flex-1
          "
        >
          {memory.story || memory.description}
        </div>

      </div>

    </div>

  </div>

</div>
    {/* ======================================
    SCRAPBOOK HIGHLIGHTS
====================================== */}

{highlights.length > 0 && (

<div className="relative mt-4">

    {/* Background Decoration */}

    <img
        src={blob1}
        alt=""
        className="
            absolute
            -right-24
            top-0
            w-600
            opacity-30
            pointer-events-none
        "
    />

    <div className="text-center mb-12">

        <h2
            className="
                text-5xl
                font-bold
                text-[#5A4332]
            "
            style={{
                fontFamily:
                    "Cormorant Garamond, serif",
            }}
        >
            Little Highlights
        </h2>

        <img
            src={leafDivider}
            alt=""
            className="
                w-40
                mx-auto
                mt-4
            "
        />

    </div>

    <div className="grid md:grid-cols-2 gap-10">

        {highlights.map((highlight, index) => (

            <div
                key={index}
                className={`
                    relative
                    rounded-[30px]
                    p-8
                    shadow-xl
                    transition-all
                    duration-300
                    hover:-translate-y-2
                    hover:shadow-2xl
                    ${
                        index % 2 === 0
                            ? "bg-[#FFF8EF]"
                            : "bg-[#F8F4EC]"
                    }
                `}
            >

                {/* Tape */}

                <img
                    src={tapes[index % tapes.length]}
                    alt=""
                    className="
                        absolute
                        -top-4
                        left-8
                        w-28
                        rotate-[-8deg]
                        pointer-events-none
                    "
                />

                {/* Clip */}

                <img
                    src={clips[index % clips.length]}
                    alt=""
                    className="
                        absolute
                        top-5
                        right-6
                        w-10
                        rotate-12
                        pointer-events-none
                    "
                />

                {/* Sparkles */}

                <img
                    src={sparkles}
                    alt=""
                    className="
                        absolute
                        bottom-4
                        right-5
                        w-100
                        opacity-60
                        pointer-events-none
                    "
                />

                {/* Leaf */}

                

                <div className="flex items-start gap-4">

                    <div
                        className="
                            w-12
                            h-12
                            rounded-full
                            bg-[#F7E3B5]
                            flex
                            items-center
                            justify-center
                            text-xl
                            shrink-0
                        "
                    >
                        ✨
                    </div>

                    <p
                        className="
                            text-[#6A5A4C]
                            leading-8
                            text-lg
                        "
                    >
                        {highlight}
                    </p>

                </div>

            </div>

        ))}

    </div>

</div>

)}

    {/* ======================================
    SCRAPBOOK PHOTO GALLERY
====================================== */}

{gallery.length > 0 && (

<div className="relative mt-6">


    {/* Background decoration */}

    <img
        src={blob2}
        alt=""
        className="
            absolute
            -left-32
            top-20
            w-96
            opacity-30
            pointer-events-none
        "
    />

    


    <div className="text-center mb-0">


        <h2
            className="
                text-2xl
                font-bold
                text-[#5A4332]
            "
            style={{
                fontFamily:
                    "Cormorant Garamond, serif",
            }}
        >
            Precious Memories
        </h2>


        <img
            src={leafDivider}
            alt=""
            className="
                w-32
                mx-auto
                mt-1
            "
        />


    </div>



    {/* Clothes Line */}

    <div
        className="
            relative
            max-w-6xl
            mx-auto
            px-6
            mt-2
        "
    >

        <div
            className="
                absolute
                top-12
                left-6
                right-6
                h-[5px]
                bg-[#D8C2A5]
                rounded-full
                z-0
            "
        />


        <div
            className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                gap-x-10
                gap-y-4
                relative
                z-10
            "
        >


        {gallery.map((image,index)=>(


            <div
                key={index}
                className={`
                    relative
                    ${rotations[index % rotations.length]}
                    transition-all
                    duration-500
                    hover:scale-105
                    hover:-translate-y-3
                    hover:z-20
                `}
            >


                {/* Wooden Clip */}

                <img
                    src={
                        clips[
                            index % clips.length
                        ]
                    }
                    alt=""
                    className="
                        absolute
                        -top-3
                        left-1/2
                        -translate-x-1/2
                        w-10
                        z-30
                        rotate-6
                    "
                />



                {/* Washi Tape */}

                {index % 2 === 0 && (

                    <img
                        src={
                            tapes[
                                index %
                                tapes.length
                            ]
                        }
                        alt=""
                        className="
                            absolute
                            -top-5
                            left-8
                            w-20
                            rotate-[-12deg]
                            z-20
                        "
                    />

                )}



                {/* Photo Card */}


                <div
                    className="
                        relative
                        bg-white
                        p-5
                        rounded-xl
                        shadow-xl
                    "
                >


                    {/* Photo Corners */}

                    <img
                        src={photoCorner}
                        alt=""
                        className="
                            absolute
                            top-3
                            left-3
                            w-8
                            z-10
                        "
                    />


                    <img
                        src={photoCorner}
                        alt=""
                        className="
                            absolute
                            bottom-3
                            right-3
                            w-8
                            rotate-180
                            z-10
                        "
                    />


                    <img
                        src={polaroidShadow}
                        alt=""
                        className="
                            absolute
                            inset-0
                            w-full
                            h-full
                            opacity-30
                            pointer-events-none
                        "
                    />


                    <img
                        src={image}
                        loading="lazy"
                        alt={`Memory ${index+1}`}
                        onClick={() =>
                            setLightboxIndex(index)
                        }
                        className="
                            relative
                            w-full
                            aspect-square
                            object-cover
                            rounded-lg
                            cursor-pointer
                        "
                    />


                </div>



            </div>


        ))}


        </div>


    </div>


</div>


)}
        {/* ======================================
    SCRAPBOOK LIGHTBOX
====================================== */}

{lightboxIndex !== null && (

<div
    className="
        fixed
        inset-0
        z-[9999]
        bg-[#3B3028]/90
        backdrop-blur-md
        flex
        items-center
        justify-center
        p-6
    "
    onClick={() =>
        setLightboxIndex(null)
    }
>


    {/* Close */}

    <button
        onClick={() =>
            setLightboxIndex(null)
        }
        className="
            absolute
            top-8
            right-10
            text-white
            text-5xl
            hover:scale-110
            transition
        "
    >
        ×
    </button>



    {/* Previous */}

    {lightboxIndex > 0 && (

        <button
            onClick={(e)=>{

                e.stopPropagation();

                setLightboxIndex(
                    lightboxIndex - 1
                );

            }}
            className="
                absolute
                left-8
                text-white
                text-7xl
                hover:scale-110
                transition
            "
        >
            ‹
        </button>

    )}




    {/* Image */}

    <div
        className="
            relative
            bg-white
            p-2
            rounded-[30px]
            shadow-2xl
        "
        onClick={(e)=>
            e.stopPropagation()
        }
    >

        <img
            src={
                gallery[
                    lightboxIndex
                ]
            }
            alt=""
            className="
                max-w-[85vw]
                max-h-[80vh]
                object-contain
                rounded-2xl
            "
        />


        <img
            src={sparkles}
            alt=""
            className="
                absolute
                -top-10
                right-0
                w-600
            "
        />

    </div>





    {/* Next */}

    {lightboxIndex <
        gallery.length - 1 && (

        <button
            onClick={(e)=>{

                e.stopPropagation();

                setLightboxIndex(
                    lightboxIndex + 1
                );

            }}
            className="
                absolute
                right-8
                text-white
                text-7xl
                hover:scale-110
                transition
            "
        >
            ›
        </button>

    )}



    {/* Counter */}

    <div
        className="
            absolute
            bottom-8
            bg-white/20
            text-white
            px-6
            py-3
            rounded-full
            font-semibold
        "
    >

        {lightboxIndex + 1}
        {" / "}
        {gallery.length}

    </div>


</div>

)}

    {/* ======================================
    SCRAPBOOK NAVIGATION
====================================== */}

<div
  className="
    relative
    mt-2
    pt-2
    border-t
    border-[#E7D8C5]
  "
>

  

  <div
    className="
      flex
      justify-between
      items-center
      gap-6
    "
  >

    {previousMemory ? (

      <button
        onClick={() =>
          navigate(
            `/memory/${previousMemory.slug}`
          )
        }
        className="
          bg-white
          px-6
          py-3
          rounded-full
          shadow-lg
          border
          border-[#E9DED0]
          text-[#5A4332]
          font-semibold
          hover:-translate-y-1
          transition
        "
      >
        ← Previous Memory
      </button>

    ) : (

      <div />

    )}


    {nextMemory && (

      <button
        onClick={() =>
          navigate(
            `/memory/${nextMemory.slug}`
          )
        }
        className="
          bg-[#B58A5A]
          text-white
          px-8
          py-4
          rounded-full
          shadow-lg
          font-semibold
          hover:-translate-y-1
          transition
        "
      >
        Next Memory →
      </button>

    )}

  </div>

</div>


{/* ======================================
    FINAL FLOATING SCRAPBOOK DECOR
====================================== */}


<img
  src={headphones}
  alt=""
  className="
    absolute
    left-[120px]
    top-[520px]
    w-[90px]
    rotate-[-12deg]
    pointer-events-none
    z-20
    float-soft
  "
/>
<img
  src={heart}
  alt=""
  className="
    absolute
    right-[260px]
    top-[600px]
    w-[100px]
    rotate-[12deg]
    opacity-90
    pointer-events-none
    z-20
    float-soft
  "
/>


<img
  src={butterfly}
  alt=""
  className="
    fixed
    bottom-20
    right-10
    w-50
    opacity-80
    pointer-events-none
  "
/>



</main>

);
}