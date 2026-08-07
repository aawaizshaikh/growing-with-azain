import mapTimelineMemory from "./mapTimelineMemory";
import mapMilestone from "./mapMilestone";
import mapFavoriteSong from "./mapFavoriteSong";

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
   Merge Everything
========================================================== */

export function buildGallery(
  timeline = [],
  milestones = [],
  songs = []
) {
  return [
    ...timelineToGallery(timeline),
    ...milestonesToGallery(milestones),
    ...songsToGallery(songs),
  ].sort((a, b) => {
    return new Date(b.sortDate) - new Date(a.sortDate);
  });
}