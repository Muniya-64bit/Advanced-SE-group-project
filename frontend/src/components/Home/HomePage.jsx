import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Brain,
  Sparkles,
  MessageSquare,
  Code2,
  Zap,
  Shield,
  ArrowRight,
  Moon,
  Sun,
  GitBranch,
} from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleGetStarted = () => {
    navigate("/login");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Architecture",
      description:
        "Generate comprehensive software architecture designs with intelligent recommendations and best practices.",
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
    },
    {
      icon: GitBranch,
      title: "Mermaid Diagrams",
      description:
        "Visualize your architecture with auto-generated UML and system diagrams using Mermaid syntax.",
      color: "text-vscode-green",
      bgColor: "bg-vscode-green/10",
    },
    {
      icon: MessageSquare,
      title: "Context-Aware Q&A",
      description:
        "Ask questions about your architecture and get intelligent answers with full project context.",
      color: "text-vscode-blue",
      bgColor: "bg-vscode-blue/10",
    },
    {
      icon: Sparkles,
      title: "Prompt Enhancement",
      description:
        "Transform simple ideas into detailed architectural requirements with AI prompt enhancement.",
      color: "text-vscode-purple",
      bgColor: "bg-vscode-purple/10",
    },
    {
      icon: Zap,
      title: "Fast & Efficient",
      description:
        "Built with modern technologies for lightning-fast performance and seamless user experience.",
      color: "text-teal-400",
      bgColor: "bg-teal-400/10",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Your data is stored securely with Google OAuth authentication and local storage encryption.",
      color: "text-vscode-red",
      bgColor: "bg-vscode-red/10",
    },
  ];

  return (
    <div className="min-h-screen bg-theme-bg transition-colors duration-200">
      {/* Navigation */}
      <nav className="border-b border-theme-border bg-theme-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/src/assets/architecture.png"
                  alt="AI Architect Logo"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <span className="text-xl font-semibold text-theme-text">
                AI Architect
              </span>
            </div>
            <div className="flex items-center space-x-3">
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
              {isAuthenticated ? (
                <button
                  onClick={handleDashboard}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={handleGetStarted}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="max-w-xl">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-teal-500/10 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-teal-500" />
                <span className="text-sm font-medium text-teal-500">
                  AI-Powered Design
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-theme-text mb-6 leading-tight">
                You are
                <br />
                <span className="text-teal-500">in good hands</span>
              </h1>
              <p className="text-lg text-theme-text-muted mb-8 leading-relaxed">
                Professional Architecture Services for Your Software and Company
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <button
                  onClick={() =>
                    document
                      .getElementById("features")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                  className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-full text-base font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  About Us
                </button>
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-full text-base font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started
                </button>
              </div>
              <div className="mt-8 flex items-center space-x-4 text-sm text-theme-text-muted">
                <span>Follow us:</span>
                <div className="flex space-x-3">
                  <a href="#" className="hover:text-teal-500 transition-colors">
                    Facebook
                  </a>
                  <span>•</span>
                  <a href="#" className="hover:text-teal-500 transition-colors">
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="relative lg:h-[500px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-vscode-blue/20 to-vscode-purple/20 rounded-[3rem] blur-3xl opacity-50"></div>
              <div className="relative w-full max-w-lg lg:max-w-none lg:w-[520px] h-[360px] lg:h-[480px] rounded-[2rem] overflow-hidden z-10">
                <img
                  src="/src/assets/azure-architect.png"
                  alt="Hero Illustration"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Content */}
            <div>
              <p className="text-sm text-teal-500 uppercase tracking-wider mb-4 font-medium">
                Services
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold text-theme-text mb-6 leading-tight">
                Architecture
                <br />
                Design
              </h2>
              <div className="flex space-x-2 mb-8">
                <button className="w-3 h-3 bg-teal-500 rounded-full"></button>
                <button className="w-3 h-3 bg-theme-border rounded-full hover:bg-teal-500 transition-colors"></button>
                <button className="w-3 h-3 bg-theme-border rounded-full hover:bg-teal-500 transition-colors"></button>
              </div>
              <button className="group px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-full text-base font-medium transition-all shadow-lg hover:shadow-xl flex items-center space-x-2">
                <span>Read More</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Grid */}
            <div className="grid grid-cols-2 gap-6">
              {features.slice(0, 4).map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-theme-bg-alt rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-theme-border group"
                  >
                    <div
                      className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}
                    >
                      <Icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-theme-text mb-2 group-hover:text-teal-500 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-theme-text-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Map */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-theme-text mb-6 leading-tight">
                Ready to Get
                <br />
                <span className="text-teal-500">Started?</span>
              </h2>
              <p className="text-lg text-theme-text-muted mb-8 leading-relaxed">
                Join developers who are already designing smarter architectures
                with AI. Transform your ideas in 2 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="group px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-full text-base font-medium transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center space-x-2"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("features")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                  className="px-8 py-4 bg-white dark:bg-theme-bg-alt hover:bg-theme-border border border-theme-border text-theme-text rounded-full text-base font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Map Placeholder */}
            <div className="relative h-96 bg-white dark:bg-theme-bg-alt rounded-3xl overflow-hidden shadow-xl border border-theme-border">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-vscode-blue/10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-theme-text-muted">Interactive Demo</p>
                </div>
              </div>
              <div className="absolute bottom-8 right-8 bg-teal-500 w-12 h-12 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-theme-border bg-theme-bg-alt py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img
              src="/src/assets/architecture.png"
              alt="AI Architect Logo"
              className="w-5 h-5 object-contain"
            />
            <span className="text-theme-text font-medium">AI Architect</span>
          </div>
          <p className="text-sm text-theme-text-muted">
            © 2025 AI Software Architect. Powered by AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
