import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    function checkSession() {
      const token = localStorage.getItem(
        "azain_admin_token"
      );

      setSession(
        token
          ? { token }
          : null
      );

      setLoading(false);
    }

    checkSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return children;
}