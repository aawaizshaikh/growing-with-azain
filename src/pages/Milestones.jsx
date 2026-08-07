import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { getMilestones } from "../services/milestoneService";
import mapMilestone from "../utils/mapMilestone";

export default function Milestones() {
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    loadMilestones();
  }, []);

  async function loadMilestones() {
    try {
      const data = await getMilestones();

      const published = (data || [])
        .filter((item) => item.published)
        .map(mapMilestone);

      setMilestones(published);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="bg-[#FAF8F2] min-h-screen p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden">

        <Navbar />

        <section className="px-16 py-16">

          <h1
            className="text-[72px] text-center"
            style={{
              fontFamily: "Baloo 2",
              color: "#8FAE7A",
            }}
          >
            Milestones
          </h1>

          <p
            className="text-center text-xl text-gray-600 mt-3 mb-16"
            style={{
              fontFamily: "Nunito",
            }}
          >
            Every beautiful achievement deserves to be remembered forever.
          </p>

          <div className="grid lg:grid-cols-3 gap-8">

            {milestones.map((item) => (

              <Link
                key={item.id}
                to={`/milestone/${item.slug}`}
                className="block"
              >

                <motion.div
                  whileHover={{
                    y: -10,
                    scale: 1.03,
                  }}
                  transition={{
                    duration: .25,
                  }}
                  className="rounded-[32px] p-8 shadow-xl cursor-pointer"
                  style={{
                    background: item.circleColor,
                  }}
                >

                  <div className="text-6xl mb-6">
                    {item.icon}
                  </div>

                  <h2
                    className="text-4xl"
                    style={{
                      fontFamily: "Baloo 2",
                      color: "#333",
                    }}
                  >
                    {item.title}
                  </h2>

                  <p
                    className="mt-3 text-lg text-gray-600"
                    style={{
                      fontFamily: "Nunito",
                    }}
                  >
                    {item.date}
                  </p>

                </motion.div>

              </Link>

            ))}

          </div>

        </section>

        <Footer />

      </div>
    </main>
  );
}