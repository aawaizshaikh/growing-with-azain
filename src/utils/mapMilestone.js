export default function mapMilestone(item) {
  return {
    id: item.id,
    slug: item.slug,

    title: item.title,
    description: item.description,
    story: item.story,

    coverImage:
      item.cover_image ||
      "https://placehold.co/1200x800?text=No+Image",

    gallery:
      item.gallery_images && item.gallery_images.length
        ? item.gallery_images
        : [
            item.cover_image ||
              "https://placehold.co/1200x800?text=No+Image",
          ],

    highlights: item.highlights || [],

    date: item.date,
    age: item.age,

    category: item.category || "Milestone",

    favorite: item.favorite || false,

    circleColor: "#FCEBC8",

    icon: "🌱",
  };
}