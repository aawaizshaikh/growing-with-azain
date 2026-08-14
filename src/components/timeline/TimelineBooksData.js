import newbornImg from "../../assets/illustrations/timeline-book-newborn-trim.webp";
import infantImg from "../../assets/illustrations/timeline-book-infant-trim.webp";
import toddlerImg from "../../assets/illustrations/timeline-book-toddler-trim.webp";
import preschoolImg from "../../assets/illustrations/timeline-book-preschool-trim.webp";
import schoolImg from "../../assets/illustrations/timeline-book-school-trim.webp";
import teenImg from "../../assets/illustrations/timeline-book-teen-trim.webp";

const TimelineBooksData = [
  {
    id: "newborn",
    title: "Newborn",
    subtitle: "0 - 3 Months",
    image: newbornImg,
    icon: "👶",
    memoriesCount: 0,

    subFilters: [
      "All",
      "Birth",
      "Hospital",
      "Parents",
      "Visitors",
      "Documents",
    ],
  },

  {
    id: "infant",
    title: "Infant",
    subtitle: "4 - 12 Months",
    image: infantImg,
    icon: "🍼",
    memoriesCount: 0,

    subFilters: [
      "All",
      "Milestones",
      "Food",
      "Vaccination",
      "Firsts",
      "Growth",
    ],
  },

  {
    id: "toddler",
    title: "Toddler",
    subtitle: "1 - 3 Years",
    image: toddlerImg,
    icon: "🚼",
    memoriesCount: 0,

    subFilters: [
      "All",
      "Walking",
      "Talking",
      "Birthday",
      "Play",
      "Family",
    ],
  },

  {
    id: "preschool",
    title: "Preschool",
    subtitle: "3 - 5 Years",
    image: preschoolImg,
    icon: "🎨",
    memoriesCount: 0,

    subFilters: [
      "All",
      "School",
      "Friends",
      "Drawing",
      "Events",
      "Awards",
    ],
  },

  {
    id: "school",
    title: "School",
    subtitle: "6 - 12 Years",
    image: schoolImg,
    icon: "🎒",
    memoriesCount: 0,

    subFilters: [
      "All",
      "Academics",
      "Sports",
      "Trips",
      "Certificates",
      "Friends",
    ],
  },

  {
    id: "teen",
    title: "Teen",
    subtitle: "13 - 18 Years",
    image: teenImg,
    icon: "🎓",
    memoriesCount: 0,

    subFilters: [
      "All",
      "School",
      "Achievements",
      "Travel",
      "Friends",
      "Memories",
    ],
  },
];

export default TimelineBooksData;