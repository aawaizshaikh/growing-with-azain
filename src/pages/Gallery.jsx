import React, {
  useEffect,
  useState,
} from "react";

import { getTimelineMemories } from "../services/timelineService";
import { getMilestones } from "../services/milestoneService";
import { getFavoriteSongs } from "../services/favoriteSongService";
import { getAllFamilyMemories } from "../services/familyMemoryService";

import { buildGallery } from "../utils/galleryHelpers";

import MemoryGalaxy from "../components/gallery/MemoryGalaxy";
import Navbar from "../components/Navbar";
import Lightbox from "../components/memory/Lightbox";

/*
=====================================================
AZAIN MEMORY GALAXY
=====================================================

The Gallery uses the same architecture as Timeline.

REFERENCE SCENE
---------------

    1920 × 1080

The complete Space experience lives inside ONE fixed
coordinate system.

The browser viewport only controls the SCALE of the
complete scene.

Therefore:

    space background
    planets
    moon
    stars
    rocket
    astronaut
    AZAIN
    photos
    videos

all belong to the same 1920 × 1080 scene.

This keeps all visual relationships stable at every
screen size.

=====================================================
*/

const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;


export default function Gallery() {

  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /*
  ===================================================
  LIGHTBOX
  ===================================================

  Uses the existing project Lightbox component.

  The complete Gallery `items` array is passed to
  Lightbox, so photos and videos can be navigated
  together.
  ===================================================
  */

  const [
    lightboxOpen,
    setLightboxOpen,
  ] = useState(false);

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  function openMedia(item) {

    const index =
      items.findIndex(
        (media) =>
          media.id === item.id
      );

    if (index < 0) {
      return;
    }

    setCurrentIndex(index);
    setLightboxOpen(true);
  }

  /*
  ===================================================
  VIEWPORT
  ===================================================
  */

  const [viewport, setViewport] =
    useState({
      width:
        typeof window !== "undefined"
          ? window.innerWidth
          : SCENE_WIDTH,

      height:
        typeof window !== "undefined"
          ? window.innerHeight
          : SCENE_HEIGHT,
    });


  /*
  ===================================================
  RESPONSIVE VIEWPORT TRACKING

  Same concept as Timeline.

  We don't resize individual objects.

  We scale the COMPLETE scene.
  ===================================================
  */

  useEffect(() => {

    function updateViewport() {

      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });

    }

    updateViewport();

    window.addEventListener(
      "resize",
      updateViewport
    );

    return () => {

      window.removeEventListener(
        "resize",
        updateViewport
      );

    };

  }, []);


  /*
  ===================================================
  SCENE SCALE

  The scene is designed at:

      1920 × 1080

  The complete scene scales uniformly to fit the
  browser viewport.

  We use Math.max rather than Math.min because the
  Space artwork should fill the entire viewport.
  ===================================================
  */

  const sceneScale =
    Math.max(
      viewport.width /
        SCENE_WIDTH,

      viewport.height /
        SCENE_HEIGHT
    );


  /*
  ===================================================
  PREVENT PAGE SCROLLING

  Gallery is now a full-screen visual experience.

  There should be no normal webpage scrolling.

  The photos and videos live inside the Space scene.
  ===================================================
  */

  useEffect(() => {

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {

      document.body.style.overflow =
        previousOverflow;

    };

  }, []);


  /*
  ===================================================
  LOAD ALL GALLERY MEDIA
  ===================================================

  We keep the existing Gallery data architecture.

  This means the Gallery continues to collect memories
  from:

      Timeline
      Milestones
      Favourite Songs
      Family Memories

  New memories added through Admin will therefore
  automatically become part of the Space Gallery once
  the page reloads.
  ===================================================
  */

  useEffect(() => {

    async function loadGallery() {

      try {

        setLoading(true);

        const [
          timeline,
          milestones,
          songs,
          familyMemories,
        ] = await Promise.all([

          getTimelineMemories(),

          getMilestones(),

          getFavoriteSongs(),

          /*
           * Only published Family Memories are displayed.
           */
          getAllFamilyMemories({
            includeUnpublished: false,
          }),

        ]);


        /*
        ==============================================
        BUILD COMPLETE MEDIA POOL
        ==============================================
        */

        const gallery =
          buildGallery(

            (timeline || []).filter(
              (item) =>
                item.published
            ),

            (milestones || []).filter(
              (item) =>
                item.published
            ),

            (songs || []).filter(
              (item) =>
                item.published
            ),

            familyMemories || []

          );


        /*
        ==============================================
        STORE COMPLETE MEDIA COLLECTION
        ==============================================

        IMPORTANT:

        We intentionally do NOT reduce the collection
        here.

        The Space Gallery needs the maximum available
        memory pool.
        ==============================================
        */

        setItems(
          gallery
        );

      } catch (err) {

        console.error(
          "Gallery loading error:",
          err
        );

      } finally {

        setLoading(false);

      }

    }


    loadGallery();

  }, []);


  /*
  ===================================================
  FULL SCREEN SPACE GALLERY
  ===================================================

  IMPORTANT:

  There is intentionally NO:

      Gallery heading
      Gallery subtitle
      white card
      GalleryGrid
      Footer
      normal photo grid

  The Space scene IS the Gallery.
  ===================================================
  */

  return (

    <main
      className="
        relative
        w-screen
        h-screen
        overflow-hidden
      "
      style={{
        backgroundColor:
          "#071A35",
      }}
    >

      <Navbar />

      {/*
      =================================================
      COMPLETE 1920 × 1080 SPACE SCENE
      =================================================

      Everything inside this container belongs to the
      same coordinate system.

      This is the same architecture used by Timeline.
      =================================================
      */}

      <div
        style={{
          position:
            "absolute",

          width:
            `${SCENE_WIDTH}px`,

          height:
            `${SCENE_HEIGHT}px`,

          left:
            "50%",

          top:
            "50%",

          transform:
            `translate(-50%, -50%) scale(${sceneScale})`,

          transformOrigin:
            "center center",

          overflow:
            "visible",
        }}
      >

        {/*
        ==============================================
        MEMORY GALAXY

        The complete Space experience lives here.

        The background is an actual PNG <img>
        element, NOT a CSS background.

        All planets, decorations and memories are
        positioned relative to this same scene.
        ==============================================
        */}

        <MemoryGalaxy
          items={items}
          loading={loading}
          sceneWidth={SCENE_WIDTH}
          sceneHeight={SCENE_HEIGHT}
          onOpen={openMedia}
        />

      </div>

      {/* =================================================
          EXISTING LIGHTBOX

          Uses the project's existing Lightbox component.

          The complete `items` array is passed so the
          Lightbox can navigate through both photos and
          videos in the same order as the Gallery.
      ================================================= */}

      <Lightbox
        items={items}
        images={items
          .filter(
            (item) =>
              item.mediaType ===
              "image"
          )
          .map(
            (item) =>
              item.image
          )}
        currentIndex={
          currentIndex
        }
        setCurrentIndex={
          setCurrentIndex
        }
        isOpen={
          lightboxOpen
        }
        onClose={() =>
          setLightboxOpen(
            false
          )
        }
      />

    </main>

  );

}