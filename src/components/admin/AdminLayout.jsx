import AdminNavbar from "./AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <main className="min-h-screen bg-[#FAF8F2]">

      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-8 py-10">
        {children}
      </div>

    </main>
  );
}