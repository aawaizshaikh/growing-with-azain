export default function mapFavoriteSong(song) {
  return {
    ...song,

    // Cover Image
    cover:
      song.cover_image ||
      "https://placehold.co/1200x800?text=No+Image",

    coverImage:
      song.cover_image ||
      "https://placehold.co/1200x800?text=No+Image",

    // Gallery
    gallery:
      song.gallery_images && song.gallery_images.length
        ? song.gallery_images
        : [
            song.cover_image ||
              "https://placehold.co/1200x800?text=No+Image",
          ],

    galleryImages:
      song.gallery_images && song.gallery_images.length
        ? song.gallery_images
        : [
            song.cover_image ||
              "https://placehold.co/1200x800?text=No+Image",
          ],

    // Video
    videoUrl: song.video_url || "",

    // Arrays
    highlights: song.highlights || [],

    // Safe values
    artist: song.artist || "",
    month: song.month || "",
    age: song.age || "",
    story: song.story || "",
    description: song.description || "",
    category: song.category || "Favourite Song",
    favorite: song.favorite || false,
    displayOrder: song.display_order || 0,
  };
}