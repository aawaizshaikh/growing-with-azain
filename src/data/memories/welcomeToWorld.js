import { loadGallery } from "../../utils/loadGallery";

const gallery = loadGallery("welcome-to-the-world");

const welcomeToWorld = {
  slug: "welcome-to-the-world",

  title: "Welcome to the World",

  description:
    "The day our beautiful little miracle arrived.",

  story:
    "Your story begins here.",

  // Timeline Card Cover Photo
  coverImage: gallery[4],

  // All Photos
  gallery,

  highlights: [
    "First Cry",
    "Tiny Fingers",
    "First Family Photo",
  ],

  date: "14 September 2024",

  age: "Day 1",

  category: "Birth",

  favorite: true,

  circleColor: "#FCEBC8",
};

export default welcomeToWorld;