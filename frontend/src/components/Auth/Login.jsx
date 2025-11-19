import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { User, Moon, Sun, ArrowLeft, Mail, Lock, Loader2 } from "lucide-react";

const Login = () => {
  const { signInWithGoogle, signInWithEmail, demoLogin, isAuthenticated } =
    useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithGoogle();
      // Don't set loading to false - user will be redirected to Google
      // The page will reload after OAuth completes
    } catch (error) {
      console.error("Google login failed:", error);
      setError("Failed to sign in with Google. Please try again.");
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await signInWithEmail(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Email login failed:", error);
      setError(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    demoLogin();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-theme-bg transition-colors duration-200 flex flex-col">
      {/* Header */}
      <div className="border-b border-theme-border bg-theme-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 text-theme-text hover:text-teal-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Home</span>
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

      {/* Login Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-theme-bg-alt rounded-lg border border-theme-border p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 rounded-lg mb-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-teal-500/5 blur-xl group-hover:bg-teal-500/10 transition-all duration-500"></div>
                <img
                  src="/src/assets/architecture.png"
                  alt="AI Architect Logo"
                  className="w-10 h-10 object-contain relative z-10 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h1 className="text-3xl font-bold text-theme-text mb-2">
                Welcome Back
              </h1>
              <p className="text-theme-text-muted">
                Sign in to continue designing with AI
              </p>
            </div>

            {/* Auth Options */}
            <div className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <p className="text-sm text-red-400 text-center">{error}</p>
                </div>
              )}

              {!showEmailLogin ? (
                <>
                  {/* Google Login */}
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white hover:bg-gray-50 dark:bg-theme-bg-dark dark:hover:bg-theme-border border border-theme-border rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/5 transition-all duration-500"></div>
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 text-theme-text animate-spin relative z-10" />
                        <span className="text-theme-text font-medium relative z-10">
                          Redirecting to Google...
                        </span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 relative z-10"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span className="text-theme-text font-medium relative z-10">
                          Continue with Google
                        </span>
                      </>
                    )}
                  </button>

                  {/* Email Login Toggle */}
                  <button
                    onClick={() => setShowEmailLogin(true)}
                    className="w-full px-4 py-3 bg-theme-bg-dark hover:bg-theme-border border border-theme-border rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/5 transition-all duration-500"></div>
                    <Mail className="w-5 h-5 text-teal-500 relative z-10" />
                    <span className="text-theme-text font-medium relative z-10">
                      Sign in with Email
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-theme-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-theme-bg-alt text-theme-text-muted">
                        or
                      </span>
                    </div>
                  </div>

                  {/* Demo Login */}
                  <button
                    onClick={handleDemoLogin}
                    className="w-full px-4 py-3 bg-theme-bg-dark hover:bg-theme-border border border-theme-border rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/5 transition-all duration-500"></div>
                    <User className="w-5 h-5 text-teal-500 relative z-10 group-hover:scale-110 transition-transform" />
                    <span className="text-theme-text font-medium relative z-10">
                      Continue as Guest User
                    </span>
                  </button>

                  <p className="text-center text-xs text-theme-text-muted">
                    Try the app without signing in
                  </p>
                </>
              ) : (
                <>
                  {/* Email Login Form */}
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-text mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="your@email.com"
                          className="w-full pl-10 pr-4 py-3 bg-theme-bg-dark border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-teal-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-text mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-3 bg-theme-bg-dark border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-teal-500 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-4 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <span>Sign In</span>
                      )}
                    </button>
                  </form>

                  <button
                    onClick={() => {
                      setShowEmailLogin(false);
                      setError("");
                    }}
                    className="w-full text-sm text-theme-text-muted hover:text-theme-text transition-colors"
                  >
                    ← Back to other options
                  </button>
                </>
              )}
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-theme-text-muted">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="text-teal-500 hover:text-teal-400 font-medium transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </div>

            {/* Features */}
            <div className="mt-8 pt-6 border-t border-theme-border">
              <h3 className="text-sm font-semibold text-theme-text mb-3">
                What you'll get:
              </h3>
              <ul className="space-y-2 text-sm text-theme-text-muted">
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">•</span>
                  <span>AI-powered architecture design</span>
                </li>
                <li className="flex items-start">
                  <span className="text-vscode-green mr-2">•</span>
                  <span>Interactive UML diagrams</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-400 mr-2">•</span>
                  <span>Context-aware Q&A assistant</span>
                </li>
                <li className="flex items-start">
                  <span className="text-vscode-purple mr-2">•</span>
                  <span>Smart prompt enhancement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
