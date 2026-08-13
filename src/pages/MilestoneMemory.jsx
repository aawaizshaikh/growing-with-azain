import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaHeart } from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Lightbox from "../components/memory/Lightbox";

import { getMilestones } from "../services/milestoneService";
import mapMilestone from "../utils/mapMilestone";
import { isVideoMedia } from "../utils/mediaHelpers";

export default function MilestoneMemory() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadMemory();
  }, [slug]);

  async function loadMemory() {
    try {
      const data = await getMilestones();

      const item = data.find((m) => m.slug === slug);

      if (item) {
        setMemory(mapMilestone(item));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <section className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <h1
            className="text-5xl"
            style={{ fontFamily: "Baloo 2" }}
          >
            Loading...
          </h1>
        </section>

        <Footer />
      </>
    );
  }

  if (!memory) {
    return (
      <>
        <Navbar />

        <section className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">

          <div className="text-center">

            <h1
              className="text-5xl text-[#5F534A]"
              style={{ fontFamily: "Baloo 2" }}
            >
              Milestone Not Found
            </h1>

            <button
              onClick={() => navigate("/milestones")}
              className="mt-8 px-8 py-3 rounded-full bg-[#8FAE7A] text-white"
            >
              Back to Milestones
            </button>

          </div>

        </section>

        <Footer />
      </>
    );
  }

  const galleryImages = (memory.gallery || []).filter(
    (item) => !isVideoMedia(item)
  );

  return (
    <>
      <Navbar />

      <section className="bg-[#FAF8F5] min-h-screen py-14">

        <div className="max-w-7xl mx-auto px-6">

          <button
            onClick={() => navigate("/milestones")}
            className="flex items-center gap-3 text-[#7D7267] hover:text-[#5A5047] mb-10"
          >
            <FaArrowLeft />
            Back to Milestones
          </button>

          <div className="bg-white rounded-[40px] shadow-xl overflow-hidden">

            <div className="relative h-[500px] overflow-hidden">

              <img
                src={memory.coverImage}
                alt={memory.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            </div>

            <div className="p-12">

              <span className="inline-block px-5 py-2 rounded-full bg-[#F3EAD6] text-[#8B6A35] font-semibold">
                {memory.category}
              </span>

              <h1
                className="mt-6 text-6xl text-[#49413A]"
                style={{ fontFamily: "Baloo 2" }}
              >
                {memory.title}
              </h1>

              <div className="flex gap-6 mt-6 text-[#7A7068]">

                <div className="flex items-center gap-2">
                  <FaCalendarAlt />
                  {memory.date}
                </div>

                <div>{memory.age}</div>

              </div>

            </div>

          </div>

          <div className="mt-14 bg-white rounded-[36px] shadow-lg p-10">

            <h2
              className="text-4xl mb-8"
              style={{ fontFamily: "Baloo 2" }}
            >
              Our Story
            </h2>

            <p className="text-lg leading-9 text-gray-600">
              {memory.story}
            </p>

          </div>

          <div className="mt-14">

            <h2
              className="text-4xl mb-8"
              style={{ fontFamily: "Baloo 2" }}
            >
              Gallery
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {(memory.gallery || []).map((photo, index) => {

                const video = isVideoMedia(photo);
                const imageIndex = galleryImages.indexOf(photo);

                return (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[28px] shadow-lg"
                  >

                    {video ? (
                      <video
                        src={photo}
                        controls
                        playsInline
                        className="w-full h-[300px] object-cover"
                      />
                    ) : (
                      <img
                        src={photo}
                        alt=""
                        onClick={() => {
                          setCurrentIndex(imageIndex);
                          setIsOpen(true);
                        }}
                        className="w-full h-[300px] object-cover cursor-pointer hover:scale-105 transition"
                      />
                    )}

                  </div>
                );
              })}

            </div>

          </div>

          <div className="mt-16 bg-white rounded-[36px] shadow-lg p-10">

            <h2
              className="text-4xl mb-8"
              style={{ fontFamily: "Baloo 2" }}
            >
              Favourite Moments
            </h2>

            <div className="space-y-5">

              {(memory.highlights || []).map((item, index) => (

                <div
                  key={index}
                  className="flex items-center gap-4 text-lg"
                >
                  <FaHeart className="text-pink-500" />
                  {item}
                </div>

              ))}

            </div>

          </div>

        </div>

      </section>

      <Lightbox
        images={galleryImages}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      <Footer />
    </>
  );
}