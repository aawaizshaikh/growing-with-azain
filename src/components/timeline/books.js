import newbornBook from "../../assets/illustrations/timeline-book-newborn-trim.webp";
import infantBook from "../../assets/illustrations/timeline-book-infant-trim.webp";
import toddlerBook from "../../assets/illustrations/timeline-book-toddler-trim.webp";
import preschoolBook from "../../assets/illustrations/timeline-book-preschool-trim.webp";
import schoolBook from "../../assets/illustrations/timeline-book-school-trim.webp";
import teenBook from "../../assets/illustrations/timeline-book-teen-trim.webp";

const books = [
  {
    slug: "newborn",
    title: "Newborn",
    age: "0–3 Months",
    image: newbornBook,
  },

  {
    slug: "infant",
    title: "Infant",
    age: "4–12 Months",
    image: infantBook,
  },

  {
    slug: "toddler",
    title: "Toddler",
    age: "1–3 Years",
    image: toddlerBook,
  },

  {
    slug: "preschool",
    title: "Preschool",
    age: "3–5 Years",
    image: preschoolBook,
  },

  {
    slug: "school",
    title: "School Years",
    age: "5–12 Years",
    image: schoolBook,
  },

  {
    slug: "teen",
    title: "Teen Years",
    age: "13+ Years",
    image: teenBook,
  },
];

export default books;