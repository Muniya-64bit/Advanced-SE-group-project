import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Wait for auth state to be loaded
    if (!loading) {
      if (user) {
        // Successful authentication - redirect to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        // No user found - redirect back to login
        navigate("/login", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 rounded-lg mb-4">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-theme-text mb-2">
          Completing sign in...
        </h2>
        <p className="text-theme-text-muted">Please wait a moment</p>
      </div>
    </div>
  );
};

export default AuthCallback;
