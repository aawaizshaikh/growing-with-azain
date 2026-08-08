export default function mapMilestone(item) {
  const gallery =
    Array.isArray(item.gallery) && item.gallery.length
      ? item.gallery
      : Array.isArray(item.gallery_images) && item.gallery_images.length
        ? item.gallery_images
        : [];

  const coverImage =
    item.cover_image ||
    "https://placehold.co/1200x800?text=No+Image";

  return {
    id: item.id,
    slug: item.slug,

    title: item.title,
    description: item.description,
    story: item.story,

    coverImage,

    gallery: gallery.length ? gallery : [coverImage],

    highlights: item.highlights || [],

    date: item.date,
    age: item.age,

    category: item.category || "Milestone",

    favorite: item.favorite || false,
    published: item.published ?? true,
    memoryType: item.memory_type || "milestone",

    circleColor: "#FCEBC8",
    icon: "🌱",
  };
}
