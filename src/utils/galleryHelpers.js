import mapTimelineMemory from "./mapTimelineMemory";
import mapMilestone from "./mapMilestone";
import mapFavoriteSong from "./mapFavoriteSong";

import { getFamilyMember } from "../data/familyMembers";

/* ==========================================================
   Timeline
========================================================== */

export function timelineToGallery(memories = []) {
  return memories.flatMap((memory) => {
    const item = mapTimelineMemory(memory);

    const images = [
      item.coverImage,
      ...(item.gallery || []),
    ].filter(Boolean);

    return images.map((image, index) => ({
      id: `timeline-${item.id}-${index}`,
      type: "timeline",
      mediaType: "image",
      image,
      title: item.title,
      category: item.category,
      date: item.date,
      sortDate: item.date,
      slug: item.slug,
      url: `/memory/${item.slug}`,
    }));
  });
}

/* ==========================================================
   Milestones
========================================================== */

export function milestonesToGallery(items = []) {
  return items.flatMap((memory) => {
    const item = mapMilestone(memory);

    const images = [
      item.coverImage,
      ...(item.gallery || []),
    ].filter(Boolean);

    return images.map((image, index) => ({
      id: `milestone-${item.id}-${index}`,
      type: "milestone",
      mediaType: "image",
      image,
      title: item.title,
      category: item.category,
      date: item.date,
      sortDate: item.date,
      slug: item.slug,
      url: `/milestone/${item.slug}`,
    }));
  });
}

/* ==========================================================
   Favourite Songs
========================================================== */

export function songsToGallery(items = []) {
  return items.flatMap((song) => {
    const item = mapFavoriteSong(song);
    const gallery = [];

    const images = [
      item.coverImage,
      ...(item.gallery || []),
    ].filter(Boolean);

    images.forEach((image, index) => {
      gallery.push({
        id: `song-image-${item.id}-${index}`,
        type: "song",
        mediaType: "image",
        image,
        title: item.title,
        category: "Favourite Song",
        date: item.month,
        sortDate: item.month,
        slug: item.slug,
        url: `/favorite-songs/${item.slug}`,
      });
    });

    if (item.videoUrl) {
      gallery.push({
        id: `song-video-${item.id}`,
        type: "song",
        mediaType: "video",
        image: item.coverImage,
        video: item.videoUrl,
        title: item.title,
        category: "Favourite Song",
        date: item.month,
        sortDate: item.month,
        slug: item.slug,
        url: `/favorite-songs/${item.slug}`,
      });
    }

    return gallery;
  });
}

/* ==========================================================
   Family Memories
========================================================== */

export function familyMemoriesToGallery(memories = []) {
  return memories.flatMap((memory) => {
    if (!memory || !memory.media_url) {
      return [];
    }

    const mediaType =
      memory.media_type === "video"
        ? "video"
        : "image";

    const member = getFamilyMember(
      memory.member_key
    );

    const memberName =
      member?.name ||
      memory.member_key ||
      "Family";

    const title =
      memory.caption?.trim()
        ? memory.caption.trim()
        : `${memberName}'s Memory`;

    return [
      {
        id: `family-${memory.id}`,
        type: "family",
        mediaType,
        image:
          mediaType === "image"
            ? memory.media_url
            : null,
        video:
          mediaType === "video"
            ? memory.media_url
            : null,
        title,
        category: `Family · ${memberName}`,
        date: memory.created_at || "",
        sortDate: memory.created_at || "",
        memberKey: memory.member_key,
        memberName,
        url: `/family/${memory.member_key}`,
      },
    ];
  });
}

/* ==========================================================
   Build complete Gallery

   IMPORTANT:
   No duplicate-image removal is performed here yet.
   We are intentionally keeping the maximum media pool for
   the memory mosaic.
========================================================== */

export function buildGallery(
  timeline = [],
  milestones = [],
  songs = [],
  familyMemories = []
) {
  return [
    ...timelineToGallery(timeline),
    ...milestonesToGallery(milestones),
    ...songsToGallery(songs),
    ...familyMemoriesToGallery(familyMemories),
  ].sort((a, b) => {
    return (
      new Date(b.sortDate || 0) -
      new Date(a.sortDate || 0)
    );
  });
}
