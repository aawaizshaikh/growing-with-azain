import { useEffect, useState } from "react";

import SongVinyl from "./SongVinyl";

import { getFavoriteSongs } from "../../services/favoriteSongService";
import mapFavoriteSong from "../../utils/mapFavoriteSong";

/*
These are FIXED positions belonging to the 1672 × 941
master scene.

The bookshelf always contains all of these vinyl positions,
regardless of how many songs currently exist in Admin.
*/

const VINYL_SLOTS = [
  // =========================
  // ROW 1
  // =========================

  {
    left: "5.6%",
    top: "16.3%",
    width: "9.8%",
  },
  {
    left: "17.5%",
    top: "16.8%",
    width: "9.6%",
  },
  {
    left: "29.4%",
    top: "17.6%",
    width: "9.2%",
  },
  {
    left: "39.9%",
    top: "18.4%",
    width: "8.8%",
  },
  {
    left: "49.5%",
    top: "19.3%",
    width: "8.4%",
  },

  // =========================
  // ROW 2
  // =========================

  {
    left: "5.6%",
    top: "34.3%",
    width: "9.8%",
  },
  {
    left: "17.5%",
    top: "34.8%",
    width: "9.6%",
  },
  {
    left: "29.4%",
    top: "35%",
    width: "9.2%",
  },
  {
    left: "39.9%",
    top: "35.4%",
    width: "8.8%",
  },
  {
    left: "49.5%",
    top: "35.8%",
    width: "8.4%",
  },

  // =========================
  // ROW 3
  // =========================

  {
    left: "5.6%",
    top: "52.8%",
    width: "9.8%",
  },
  {
    left: "17.5%",
    top: "52.8%",
    width: "9.6%",
  },
  {
    left: "29.4%",
    top: "52.2%",
    width: "9.6%",
  },
  {
    left: "39.7%",
    top: "52.4%",
    width: "9.4%",
  },
  {
    left: "49.5%",
    top: "52.8%",
    width: "8.6%",
  },
];

export default function SongTimeline() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    loadSongs();
  }, []);

  async function loadSongs() {
    try {
      console.log("=================================");
      console.log("🎵 LOADING FAVOURITE SONGS...");
      console.log("=================================");

      const data = await getFavoriteSongs();

      console.log("🎵 RAW SUPABASE DATA:", data);
      console.log("🎵 SONG COUNT:", data?.length);

      const mappedSongs = (data || []).map(mapFavoriteSong);

      console.log("🎵 MAPPED SONGS:", mappedSongs);

      console.log(
        "🎵 SONG SLUGS:",
        mappedSongs.map((song) => ({
          title: song?.title,
          slug: song?.slug,
          id: song?.id,
        }))
      );

      setSongs(mappedSongs);
    } catch (err) {
      console.error("❌ FAILED TO LOAD FAVOURITE SONGS:", err);

      setSongs([]);
    }
  }

  return (
    <>
      {VINYL_SLOTS.map((position, index) => {
        const song = songs[index] || null;

        return (
          <SongVinyl
            key={`vinyl-slot-${index}`}
            song={song}
            position={position}
          />
        );
      })}
    </>
  );
}