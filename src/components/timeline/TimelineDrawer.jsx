import React from "react";
import { Link } from "react-router-dom";

export default function TimelineDrawer({
  open,
  onClose,
}) {
  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        className={`
          fixed
          inset-0
          z-40
          bg-black/30
          backdrop-blur-sm
          transition-all
          duration-300
          ${
            open
              ? "opacity-100 visible"
              : "opacity-0 invisible"
          }
        `}
      />

      {/* Drawer */}

      <aside
        className={`
          fixed
          top-0
          left-0
          h-screen
          w-[320px]
          bg-[#FFFDF8]
          z-50
          shadow-2xl
          transition-transform
          duration-300
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div className="px-8 py-10">

          <h2
            className="text-4xl font-bold text-[#5A4332]"
            style={{
              fontFamily:
                "Cormorant Garamond, serif",
            }}
          >
            Growing With Azain
          </h2>

          <p className="mt-2 text-[#7B6F63]">
            Navigate through memories
          </p>

          <nav className="mt-12 flex flex-col gap-5">

            <DrawerItem
              to="/"
              title="Home"
              onClose={onClose}
            />
            <DrawerItem
  to="/family"
  title="My People"
  onClose={onClose}
/>

            <DrawerItem
              to="/about"
              title="About Azain"
              onClose={onClose}
            />

            <DrawerItem
              to="/timeline"
              title="Journey"
              onClose={onClose}
            />

            <DrawerItem
              to="/milestones"
              title="Milestones"
              onClose={onClose}
            />

            <DrawerItem
              to="/favorite-songs"
              title="Favourite Songs"
              onClose={onClose}
            />

            <DrawerItem
              to="/gallery"
              title="Gallery"
              onClose={onClose}
            />

            <DrawerItem
              to="/letters"
              title="Letters"
              onClose={onClose}
            />

          </nav>

        </div>
      </aside>
    </>
  );
}

function DrawerItem({
  to,
  title,
  onClose,
}) {
  return (
    <Link
      to={to}
      onClick={onClose}
      className="
        text-xl
        text-[#5A4332]
        hover:text-[#B58A5A]
        transition
        font-semibold
      "
    >
      {title}
    </Link>
  );
}