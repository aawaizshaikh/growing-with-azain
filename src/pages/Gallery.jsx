import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import GalleryGrid from "../components/gallery/GalleryGrid";

import { getTimelineMemories } from "../services/timelineService";
import { getMilestones } from "../services/milestoneService";
import { getFavoriteSongs } from "../services/favoriteSongService";

import { buildGallery } from "../utils/galleryHelpers";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    try {
      setLoading(true);

      const [
        timeline,
        milestones,
        songs,
      ] = await Promise.all([
        getTimelineMemories(),
        getMilestones(),
        getFavoriteSongs(),
      ]);

      const gallery = buildGallery(
        (timeline || []).filter((item) => item.published),
        (milestones || []).filter((item) => item.published),
        (songs || []).filter((item) => item.published)
      );

      setItems(gallery);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-[#FAF8F2] min-h-screen p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden">

        <Navbar />

        <section className="px-4 sm:px-8 lg:px-16 py-10 lg:py-16">

          <div className="text-center">

            <h1
              className="text-5xl sm:text-6xl lg:text-[72px]"
              style={{
                fontFamily: "Baloo 2",
                color: "#8FAE7A",
              }}
            >
              Gallery
            </h1>

            <p
              className="text-lg lg:text-xl text-gray-600 mt-3 mb-14"
              style={{
                fontFamily: "Nunito",
              }}
            >
              Every smile, every milestone, every song... all in one place.
            </p>

          </div>

          {loading ? (

            <div className="py-24 text-center text-2xl text-gray-500">
              Loading Gallery...
            </div>

          ) : (

            <GalleryGrid items={items} />

          )}

        </section>

        <Footer />

      </div>
    </main>
  );
}