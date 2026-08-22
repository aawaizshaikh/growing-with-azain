import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "https://azain-api-worker.aaawaizshaikh.workers.dev/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data?.error ||
            "Invalid email or password."
        );
        return;
      }

      if (!data?.token) {
        alert("Login failed. No authentication token received.");
        return;
      }

      localStorage.setItem(
        "azain_admin_token",
        data.token
      );

      navigate("/admin");
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      alert(
        "Unable to connect to the authentication server."
      );
    } finally {
      setLoading(false);
    }
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