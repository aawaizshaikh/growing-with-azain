import {
  getTimelineIcon,
  getTimelineColor,
} from "./timelineHelpers.jsx";

export default function mapTimelineMemory(memory) {
  return {
    ...memory,

    // UI Helpers
    icon: getTimelineIcon(memory.category),
    circleColor: getTimelineColor(memory.category),

    // Images
    coverImage:
      memory.cover_image ||
      "https://placehold.co/1200x800?text=No+Image",

    gallery:
      memory.gallery_images && memory.gallery_images.length
        ? memory.gallery_images
        : [
            memory.cover_image ||
              "https://placehold.co/1200x800?text=No+Image",
          ],

    // Arrays
    highlights: memory.highlights || [],

    // Safe values
    age: memory.age || "",
    story: memory.story || "",
    description: memory.description || "",
    favorite: memory.favorite || false,
  };
}