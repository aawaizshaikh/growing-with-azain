import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import SongHeader from "../components/songs/SongHeader";
import SongTimeline from "../components/songs/SongTimeline";

export default function FavoriteSongs() {
  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-[#FAF8F5] pt-36 pb-14">
        <div className="max-w-7xl mx-auto px-6">

          <SongHeader />

          <SongTimeline />

        </div>
      </section>

      <Footer />
    </>
  );
}