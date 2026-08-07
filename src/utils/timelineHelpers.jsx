import {
  FaBaby,
  FaStar,
  FaHeart,
  FaGift,
  FaCamera,
  FaPlane,
  FaHome,
} from "react-icons/fa";

export function getTimelineIcon(category) {
  switch (category) {
    case "Birth":
      return <FaBaby />;

    case "Milestone":
      return <FaStar />;

    case "Family":
      return <FaHeart />;

    case "Festival":
      return <FaGift />;

    case "Travel":
      return <FaPlane />;

    case "Photo":
      return <FaCamera />;

    case "Home":
      return <FaHome />;

    default:
      return <FaStar />;
  }
}

export function getTimelineColor(category) {
  switch (category) {
    case "Birth":
      return "#DDEEFE";

    case "Milestone":
      return "#FFF4D6";

    case "Family":
      return "#FFE7EF";

    case "Festival":
      return "#FFF1C7";

    case "Travel":
      return "#E8F7EA";

    case "Photo":
      return "#E8F1FD";

    case "Home":
      return "#E7F7F1";

    default:
      return "#F2F2F2";
  }
}