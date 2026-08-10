import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaHeart,
  FaPlay,
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Lightbox from "../components/memory/Lightbox";

import {
  getFavoriteSongBySlug,
} from "../services/favoriteSongService";

import mapFavoriteSong from "../utils/mapFavoriteSong";

export default function FavoriteSongMemory() {
  console.log("🔥 FAVORITE SONG MEMORY PAGE LOADED");
  const navigate = useNavigate();
  const { slug } = useParams();

  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadSong();
  }, [slug]);

  async function loadSong() {
    try {
      const data = await getFavoriteSongBySlug(slug);

      if (data) {
        setSong(mapFavoriteSong(data));
      } else {
        setSong(null);
      }
    } catch (err) {
      console.error(err);
      setSong(null);
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

  if (!song) {
    return (
      <>
        <Navbar />

        <section className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">

          <div className="text-center">

            <h1
              className="text-5xl text-[#5F534A]"
              style={{ fontFamily: "Baloo 2" }}
            >
              Song Not Found
            </h1>

            <button
              onClick={() => navigate("/favorite-songs")}
              className="mt-8 px-8 py-3 rounded-full bg-[#8FAE7A] text-white"
            >
              Back to Favourite Songs
            </button>

          </div>

        </section>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="bg-[#FAF8F5] min-h-screen py-14">

        <div className="max-w-7xl mx-auto px-6">

          <button
            onClick={() => navigate("/favorite-songs")}
            className="flex items-center gap-3 text-[#7D7267] hover:text-[#5A5047] mb-10"
          >
            <FaArrowLeft />
            Back to Favourite Songs
          </button>

          <div className="bg-white rounded-[40px] shadow-xl overflow-hidden">

            <div className="relative h-[500px] overflow-hidden">

              <img
                src={song.cover}
                alt={song.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            </div>

            <div className="p-12">

              <span className="inline-block px-5 py-2 rounded-full bg-[#F3EAD6] text-[#8B6A35] font-semibold">
                {song.artist}
              </span>

              <h1
                className="mt-6 text-6xl text-[#49413A]"
                style={{ fontFamily: "Baloo 2" }}
              >
                {song.title}
              </h1>

              <div className="flex gap-6 mt-6 text-[#7A7068]">

                <div className="flex items-center gap-2">
                  <FaCalendarAlt />
                  {song.month}
                </div>

                <div>{song.age}</div>

              </div>

            </div>

          </div>

          {song.videoUrl && (
            <div className="mt-14 bg-white rounded-[36px] shadow-lg p-10">

              <h2
                className="text-4xl mb-8"
                style={{ fontFamily: "Baloo 2" }}
              >
                Watch Memory
              </h2>

              <div className="aspect-video rounded-3xl overflow-hidden">

                {song.videoUrl.includes("youtube") ||
                song.videoUrl.includes("youtu.be") ? (
                  <iframe
                    src={song.videoUrl.replace(
                      "watch?v=",
                      "embed/"
                    )}
                    title={song.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    className="w-full h-full"
                  >
                    <source
                      src={song.videoUrl}
                    />
                  </video>
                )}

              </div>

            </div>
          )}

          <div className="mt-14 bg-white rounded-[36px] shadow-lg p-10">

            <h2
              className="text-4xl mb-8"
              style={{ fontFamily: "Baloo 2" }}
            >
              Story
            </h2>

            <p className="text-lg leading-9 text-gray-600">
              {song.story}
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

              {(song.gallery || []).map((photo, index) => (

                <div
                  key={index}
                  className="overflow-hidden rounded-[28px] shadow-lg"
                >

                  <img
                    src={photo}
                    alt=""
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsOpen(true);
                    }}
                    className="w-full h-[300px] object-cover cursor-pointer hover:scale-105 transition"
                  />

                </div>

              ))}

            </div>

          </div>

          <div className="mt-16 bg-white rounded-[36px] shadow-lg p-10">

            <h2
              className="text-4xl mb-8 flex items-center gap-3"
              style={{ fontFamily: "Baloo 2" }}
            >
              <FaPlay className="text-[#8FAE7A]" />
              Favourite Moments
            </h2>

            <div className="space-y-5">

              {(song.highlights || []).map((item, index) => (

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
        images={song.gallery || []}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      <Footer />
    </>
  );
}