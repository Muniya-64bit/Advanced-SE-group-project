import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { authAPI } from "../../services/api";
import { Brain, User, Moon, Sun, ArrowLeft } from "lucide-react";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleDemoLogin = () => {
    const demoUser = {
      name: "Demo User",
      email: "demo@example.com",
      picture:
        "https://ui-avatars.com/api/?name=Demo+User&background=00d9c0&color=fff",
    };
    login(demoUser);
    navigate("/dashboard");
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await authAPI.googleLogin(credentialResponse.credential);
      login(result.user);
      localStorage.setItem("token", result.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      // Fallback for demo purposes
      const demoUser = {
        name: "Demo User",
        email: "demo@example.com",
        picture: "https://via.placeholder.com/150",
      };
      login(demoUser);
      navigate("/dashboard");
    }
  };

  const handleGoogleError = () => {
    console.error("Login Failed");
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
              {/* Google Login */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme={theme === "dark" ? "filled_black" : "outline"}
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                />
              </div>

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
                  Continue as Demo User
                </span>
              </button>

              <p className="text-center text-xs text-theme-text-muted">
                Try the app without signing in
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
