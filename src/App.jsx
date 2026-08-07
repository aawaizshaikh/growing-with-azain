import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= PUBLIC PAGES =================

import Home from "./pages/Home";
import Timeline from "./pages/Timeline";
import Memory from "./pages/Memory";
import MemoryDetails from "./pages/MemoryDetails";

import Milestones from "./pages/Milestones";
import MilestoneMemory from "./pages/MilestoneMemory";

import Gallery from "./pages/Gallery";
import AboutAzain from "./pages/AboutAzain";

import FavoriteSongs from "./pages/FavoriteSongs";
import FavoriteSongMemory from "./pages/FavoriteSongMemory";

// ================= ADMIN =================

import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";

import TimelineManager from "./pages/admin/TimelineManager";
import NewMemory from "./pages/admin/NewMemory";
import EditMemory from "./pages/admin/EditMemory";

import MilestoneManager from "./pages/admin/MilestoneManager";
import NewMilestone from "./pages/admin/NewMilestone";
import EditMilestone from "./pages/admin/EditMilestone";

import FavoriteSongManager from "./pages/admin/FavoriteSongManager";
import NewFavoriteSong from "./pages/admin/NewFavoriteSong";
import EditFavoriteSong from "./pages/admin/EditFavoriteSong";

import ProtectedRoute from "./components/admin/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC WEBSITE ================= */}

        <Route path="/" element={<Home />} />

        {/* Timeline */}

        <Route
          path="/timeline"
          element={<Timeline />}
        />

        <Route
          path="/memory/:slug"
          element={<Memory />}
        />

        {/* NEW MEMORY DETAILS PAGE */}

        <Route
          path="/timeline/memory/:slug"
          element={<MemoryDetails />}
        />

        {/* Milestones */}

        <Route
          path="/milestones"
          element={<Milestones />}
        />

        <Route
          path="/milestone/:slug"
          element={<MilestoneMemory />}
        />

        {/* Favourite Songs */}

        <Route
          path="/favorite-songs"
          element={<FavoriteSongs />}
        />

        <Route
          path="/favorite-songs/:slug"
          element={<FavoriteSongMemory />}
        />

        {/* Other Pages */}

        <Route
          path="/gallery"
          element={<Gallery />}
        />

        <Route
          path="/about"
          element={<AboutAzain />}
        />

        {/* ================= LOGIN ================= */}

        <Route
          path="/admin/login"
          element={<Login />}
        />

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= Timeline CMS ================= */}

        <Route
          path="/admin/timeline"
          element={
            <ProtectedRoute>
              <TimelineManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/timeline/new"
          element={
            <ProtectedRoute>
              <NewMemory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/timeline/edit/:id"
          element={
            <ProtectedRoute>
              <EditMemory />
            </ProtectedRoute>
          }
        />

        {/* ================= Milestone CMS ================= */}

        <Route
          path="/admin/milestones"
          element={
            <ProtectedRoute>
              <MilestoneManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/milestones/new"
          element={
            <ProtectedRoute>
              <NewMilestone />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/milestones/edit/:id"
          element={
            <ProtectedRoute>
              <EditMilestone />
            </ProtectedRoute>
          }
        />

        {/* ================= Favourite Songs CMS ================= */}

        <Route
          path="/admin/songs"
          element={
            <ProtectedRoute>
              <FavoriteSongManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/songs/new"
          element={
            <ProtectedRoute>
              <NewFavoriteSong />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/songs/edit/:id"
          element={
            <ProtectedRoute>
              <EditFavoriteSong />
            </ProtectedRoute>
          }
        />

        {/* ================= Coming Soon ================= */}

        <Route
          path="/admin/gallery"
          element={
            <ProtectedRoute>
              <div className="p-10 text-3xl font-semibold">
                🖼 Gallery CMS Coming Soon
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/letters"
          element={
            <ProtectedRoute>
              <div className="p-10 text-3xl font-semibold">
                💌 Letters CMS Coming Soon
              </div>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}