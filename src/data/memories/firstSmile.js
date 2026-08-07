import { loadGallery } from "../../utils/loadGallery";

const gallery = loadGallery("first-smile");

const firstSmile = {
  slug: "first-smile",

  title: "First Smile",

  description:
    "The sweetest little smile that melted our hearts.",

  story:
    "One tiny smile was enough to brighten our entire world. It was the beginning of countless happy moments together.",

  coverImage: gallery[17],

  gallery,

  highlights: [
    "First Smile",
    "Family Happiness",
    "A Precious Memory",
  ],

  date: "20 September 2024",

  age: "1 Week",

  category: "Milestone",

  favorite: true,

  circleColor: "#EAF6E7",
};

export default firstSmile;