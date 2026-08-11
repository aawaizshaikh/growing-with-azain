import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";


export default function Dashboard() {
  const cardClass =
    "bg-white rounded-[28px] p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer";


  return (
    <AdminLayout>

      {/* ================================================================
          PAGE TITLE
          ================================================================ */}

      <h1
        className="text-6xl mb-10"
        style={{
          fontFamily: "Baloo 2",
          color: "#5A5148",
        }}
      >
        Dashboard
      </h1>


      {/* ================================================================
          CMS CARDS
          ================================================================ */}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">


        {/* ==============================================================
            TIMELINE
            ============================================================== */}

        <Link
          to="/admin/timeline"
          className={cardClass}
        >
          <h2 className="text-2xl font-bold text-[#8FAE7A]">
            Timeline
          </h2>

          <p className="mt-3 text-gray-500">
            Manage all timeline memories.
          </p>
        </Link>


        {/* ==============================================================
            MILESTONES
            ============================================================== */}

        <Link
          to="/admin/milestones"
          className={cardClass}
        >
          <h2 className="text-2xl font-bold text-[#8FAE7A]">
            Milestones
          </h2>

          <p className="mt-3 text-gray-500">
            Manage milestones.
          </p>
        </Link>


        {/* ==============================================================
            FAVOURITE SONGS
            ============================================================== */}

        <Link
          to="/admin/songs"
          className={cardClass}
        >
          <h2 className="text-2xl font-bold text-[#8FAE7A]">
            Favourite Songs
          </h2>

          <p className="mt-3 text-gray-500">
            Manage songs.
          </p>
        </Link>


        {/* ==============================================================
            GALLERY
            ============================================================== */}

        <Link
          to="/admin/gallery"
          className={cardClass}
        >
          <h2 className="text-2xl font-bold text-[#8FAE7A]">
            Gallery
          </h2>

          <p className="mt-3 text-gray-500">
            Manage photos and videos.
          </p>
        </Link>


        {/* ==============================================================
            LETTERS
            ============================================================== */}

        <Link
          to="/admin/letters"
          className={cardClass}
        >
          <h2 className="text-2xl font-bold text-[#8FAE7A]">
            Letters
          </h2>

          <p className="mt-3 text-gray-500">
            Write, edit and manage letters.
          </p>
        </Link>


      </div>

    </AdminLayout>
  );
}