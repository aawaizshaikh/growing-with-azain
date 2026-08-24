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
import ScrollToTop from "./components/ScrollToTop";

import FavoriteSongs from "./pages/FavoriteSongs";
import FavoriteSongMemory from "./pages/FavoriteSongMemory";


// ================= FAMILY MEMORIES =================

import FamilyMemories from "./pages/FamilyMemories";
import FamilyMemberMemories from "./pages/FamilyMemberMemories";


// ================= LETTERS =================

import Letters from "./pages/Letters";
import LetterMemory from "./pages/LetterMemory";


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


// ================= LETTERS ADMIN =================

import LetterManager from "./pages/admin/LetterManager";
import NewLetter from "./pages/admin/NewLetter";
import EditLetter from "./pages/admin/EditLetter";

import FamilyMemoryManager from "./pages/admin/FamilyMemoryManager";
import NewFamilyMemory from "./pages/admin/NewFamilyMemory";
import EditFamilyMemory from "./pages/admin/EditFamilyMemory";


// ================= AUTH =================

import ProtectedRoute from "./components/admin/ProtectedRoute";


// ============================================================================
// APP
// ============================================================================

export default function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />

      <Routes>


        {/* ==================================================================
            PUBLIC WEBSITE
            ================================================================== */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* ==================================================================
            TIMELINE
            ================================================================== */}

        <Route
          path="/timeline"
          element={<Timeline />}
        />

        <Route
          path="/memory/:slug"
          element={<Memory />}
        />

        <Route
          path="/timeline/memory/:slug"
          element={<MemoryDetails />}
        />


        {/* ==================================================================
            MILESTONES
            ================================================================== */}

        <Route
          path="/milestones"
          element={<Milestones />}
        />

        <Route
          path="/milestone/:slug"
          element={<MilestoneMemory />}
        />


        {/* ==================================================================
            FAVOURITE SONGS
            ================================================================== */}

        <Route
          path="/favorite-songs"
          element={<FavoriteSongs />}
        />

        <Route
          path="/favorite-songs/:slug"
          element={<FavoriteSongMemory />}
        />


        {/* ==================================================================
            GALLERY
            ================================================================== */}

        <Route
          path="/gallery"
          element={<Gallery />}
        />


        {/* ==================================================================
            ABOUT AZAIN
            ================================================================== */}

        <Route
          path="/about"
          element={<AboutAzain />}
        />


        {/* ==================================================================
            FAMILY MEMORIES
            ==================================================================

            Main Family Suitcase:

                /family

            Individual family member:

                /family/dada
                /family/dadi
                /family/nana
                /family/nani
                /family/mumma
                /family/papa
                /family/chachu
                /family/mamu
                /family/yaaya
                /family/ansha

            Family members are hardcoded.
            Memories are loaded from Supabase.

            ================================================================== */}

        <Route
          path="/family"
          element={<FamilyMemories />}
        />

        <Route
          path="/family/:memberKey"
          element={<FamilyMemberMemories />}
        />


        {/* ==================================================================
            LETTERS
            ==================================================================

            Main illustrated Letters world:

                /letters

            Individual letter:

                /letters/:slug

            ================================================================== */}

        <Route
          path="/letters"
          element={<Letters />}
        />

        <Route
          path="/letters/:slug"
          element={<LetterMemory />}
        />


        {/* ==================================================================
            ADMIN LOGIN
            ================================================================== */}

        <Route
          path="/admin/login"
          element={<Login />}
        />


        {/* ==================================================================
            ADMIN DASHBOARD
            ================================================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* ==================================================================
            TIMELINE CMS
            ================================================================== */}

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


        {/* ==================================================================
            MILESTONE CMS
            ================================================================== */}

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


        {/* ==================================================================
            FAVOURITE SONGS CMS
            ================================================================== */}

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


        {/* ==================================================================
            GALLERY CMS
            ================================================================== */}

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


        {/* ==================================================================
            LETTERS CMS
            ==================================================================

            Letter Manager:

                /admin/letters

            Create Letter:

                /admin/letters/new

            Edit Letter:

                /admin/letters/edit/:id

            All Letters Admin pages remain protected by the existing
            authentication system.

            The Admin controls LETTER CONTENT only.

            Visual positioning of stones, background artwork and the
            illustrated world remains hardcoded in the public pages.

            ================================================================== */}

        {/* ==================================================================
            FAMILY MEMORIES CMS
            ================================================================== */}

        <Route
          path="/admin/family-memories"
          element={
            <ProtectedRoute>
              <FamilyMemoryManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/family-memories/new"
          element={
            <ProtectedRoute>
              <NewFamilyMemory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/family-memories/edit/:id"
          element={
            <ProtectedRoute>
              <EditFamilyMemory />
            </ProtectedRoute>
          }
        />


        {/* ==================================================================
            LETTERS CMS
            ================================================================== */}

        <Route
          path="/admin/letters"
          element={
            <ProtectedRoute>
              <LetterManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/letters/new"
          element={
            <ProtectedRoute>
              <NewLetter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/letters/edit/:id"
          element={
            <ProtectedRoute>
              <EditLetter />
            </ProtectedRoute>
          }
        />


      </Routes>

    </BrowserRouter>
  );
}