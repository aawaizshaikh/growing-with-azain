import { FaBaby, FaStar, FaHeart } from "react-icons/fa";

import welcomeToWorld from "./memories/welcomeToWorld";
import firstSmile from "./memories/firstSmile";
import nameCeremony from "./memories/nameCeremony";

const timelineData = [
  {
    id: 1,
    icon: <FaBaby />,
    ...welcomeToWorld,
  },

  {
    id: 2,
    icon: <FaStar />,
    ...firstSmile,
  },

  {
    id: 3,
    icon: <FaHeart />,
    ...nameCeremony,
  },
];

export default timelineData;