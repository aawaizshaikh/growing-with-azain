import DetailCard from "./DetailCard";

import sun from "../../assets/illustrations/sun.png";
import heart from "../../assets/illustrations/heart-new.png";
import balloon from "../../assets/illustrations/hot-air-baloon.png";
import cloud from "../../assets/illustrations/cloud.png";
import teddy from "../../assets/illustrations/teddy.png";
import rainbow from "../../assets/illustrations/rainbow.png";
import star from "../../assets/illustrations/star.png";
import leaf from "../../assets/illustrations/leaf.png";

const details = [
  {
    icon: sun,
    title: "Full Name",
    value: "Azain Shaikh",
    color: "#FFF8E8",
  },
  {
    icon: heart,
    title: "Nickname",
    value: "Azu ❤️",
    color: "#FFF0EC",
  },
  {
    icon: balloon,
    title: "Birthday",
    value: "14 September 2024",
    color: "#EEF8EE",
  },
  {
    icon: cloud,
    title: "Birth Time",
    value: "3:30 PM",
    color: "#EEF7FF",
    clock: true,
  },
  {
    icon: teddy,
    title: "Birth Weight",
    value: "2.8 kg",
    color: "#FFF5EA",
  },
  {
    icon: rainbow,
    title: "Birth Height",
    value: "50 cm",
    color: "#F7F3FF",
  },
  {
    icon: star,
    title: "Eye Colour",
    value: "Brown",
    color: "#FFFBE8",
  },
  {
    icon: leaf,
    title: "Hair Colour",
    value: "Black",
    color: "#F3FAEF",
  },
];

export default function LittleDetails() {
  return (
    <section className="py-16">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">

        {details.map((item) => (
          <DetailCard
            key={item.title}
            {...item}
          />
        ))}

      </div>

    </section>
  );
}