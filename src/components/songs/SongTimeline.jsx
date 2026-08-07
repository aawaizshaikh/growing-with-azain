import { useEffect, useState } from "react";

import SongCard from "./SongCard";

import { getFavoriteSongs } from "../../services/favoriteSongService";
import mapFavoriteSong from "../../utils/mapFavoriteSong";

export default function SongTimeline() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSongs();
  }, []);

  async function loadSongs() {
    try {
      const data = await getFavoriteSongs();

      setSongs(data.map(mapFavoriteSong));
    } catch (err) {
      console.error(err);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="mt-12 text-center py-20">
        <h2
          className="text-4xl text-[#5F534A]"
          style={{ fontFamily: "Baloo 2" }}
        >
          Loading...
        </h2>
      </section>
    );
  }

  if (!songs.length) {
    return (
      <section className="mt-12 text-center py-20">

        <h2
          className="text-5xl text-[#5F534A]"
          style={{ fontFamily: "Baloo 2" }}
        >
          No Favourite Songs Yet
        </h2>

        <p className="mt-5 text-gray-500 text-lg">
          Songs added from the Admin Panel will appear here.
        </p>

      </section>
    );
  }

  return (
    <section className="mt-12">

      <div className="space-y-14">

        {songs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
          />
        ))}

      </div>

    </section>
  );
}