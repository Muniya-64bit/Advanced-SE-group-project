import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Mail,
  Lock,
  User as UserIcon,
  Moon,
  Sun,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const SignUp = () => {
  const { signUpWithEmail, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await signUpWithEmail(formData.email, formData.password, {
        name: formData.name,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Sign up failed:", error);
      setError(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg transition-colors duration-200 flex flex-col">
      {/* Header */}
      <div className="border-b border-theme-border bg-theme-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center space-x-2 text-theme-text hover:text-teal-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Login</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-theme-bg-dark rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-theme-text" />
              ) : (
                <Moon className="w-5 h-5 text-theme-text" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sign Up Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-theme-bg-alt rounded-lg border border-theme-border p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 rounded-lg mb-4">
                <img
                  src="/src/assets/architecture.png"
                  alt="AI Architect Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-theme-text mb-2">
                Create Account
              </h1>
              <p className="text-theme-text-muted">
                Start designing with AI today
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <p className="text-sm text-red-400 text-center">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                  <p className="text-sm text-green-400 text-center">
                    Account created! Redirecting...
                  </p>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 bg-theme-bg-dark border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-theme-bg-dark border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-theme-bg-dark border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-theme-bg-dark border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-theme-text-muted">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-teal-500 hover:text-teal-400 font-medium transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
