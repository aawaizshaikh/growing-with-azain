import { NavLink } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AdminNavbar() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-full transition-all duration-300 font-medium ${
      isActive
        ? "bg-[#8FAE7A] text-white"
        : "text-[#6E655E] hover:bg-[#EEF7E8]"
    }`;

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <header className="bg-white shadow-sm border-b border-[#ECE7DF]">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">

        {/* Logo */}
        <h1
          className="text-3xl"
          style={{
            fontFamily: "Baloo 2",
            color: "#8FAE7A",
          }}
        >
          Growing With Azain CMS
        </h1>

        {/* Navigation */}
        <nav className="flex items-center gap-3">

          <NavLink to="/admin" end className={linkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/admin/timeline" className={linkClass}>
            Timeline
          </NavLink>

          <NavLink to="/admin/milestones" className={linkClass}>
            Milestones
          </NavLink>

          <NavLink to="/admin/songs" className={linkClass}>
            Songs
          </NavLink>

          <NavLink to="/admin/gallery" className={linkClass}>
            Gallery
          </NavLink>

          <NavLink to="/admin/letters" className={linkClass}>
            Letters
          </NavLink>

          <NavLink
            to="/admin/family-memories"
            className={linkClass}
          >
            Family Memories
          </NavLink>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="ml-4 px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition"
          >
            Logout
          </button>

        </nav>

      </div>
    </header>
  );
}