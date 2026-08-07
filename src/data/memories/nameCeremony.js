import { loadGallery } from "../../utils/loadGallery";

const gallery = loadGallery("name-ceremony");

const nameCeremony = {
  slug: "name-ceremony",

  title: "Name Ceremony",

  description:
    "A beautiful day filled with love, blessings and family.",

  story:
    "Surrounded by our loved ones, we celebrated one of the most meaningful moments of your life—receiving your beautiful name, Azain.",

  coverImage: gallery[9],

  gallery,

  highlights: [
    "Family Gathering",
    "Blessings",
    "Traditional Ceremony",
  ],

  date: "October 2024",

  age: "1 Month",

  category: "Family",

  favorite: true,

  circleColor: "#FDECF3",
};

export default nameCeremony;