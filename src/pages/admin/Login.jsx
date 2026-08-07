import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/admin/AdminLayout";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/admin");
  }

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto mt-20 bg-white rounded-[32px] shadow-xl p-10">

        <h1
          className="text-5xl text-center mb-10"
          style={{
            fontFamily: "Baloo 2",
            color: "#8FAE7A",
          }}
        >
          Admin Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border px-5 py-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border px-5 py-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full bg-[#8FAE7A] text-white rounded-xl py-4"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>
    </AdminLayout>
  );
}