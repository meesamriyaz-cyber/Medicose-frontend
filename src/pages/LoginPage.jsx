import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, Loader } from "lucide-react";
import { useAuthStore } from "../hooks/useAuthStore";
import { isCustomerMode } from "../config/appMode";
import logo from "../assets/haleemmedicose_logo.png";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const navigated = useRef(false);

  const { login, isAuthenticated, loading, user } = useAuthStore();

  const getRedirectPath = () => {
    if (user?.role === "admin") return "/dashboard";
    return "/";
  };

  // Redirect after successful login
  useEffect(() => {
    if (isAuthenticated && !navigated.current) {
      navigated.current = true;
      navigate(getRedirectPath());
    }
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen py-16 px-4 relative overflow-hidden">
      {/* Company Logo at Top */}
      <motion.div
        className="flex justify-center mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="opacity-95 hover:opacity-100 transition-all duration-300 transform hover:scale-105">
          <img
            src={logo}
            alt="Khan Pharmacy"
            className="h-40 w-auto"
            style={{
              filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.3))",
            }}
          />
        </div>
      </motion.div>

      {/* Enhanced center card with theme-matching gradient background */}
      <div
        className="max-w-2xl mx-auto p-8 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 128, 128, 0.95) 0%, rgba(0, 51, 102, 0.95) 50%, rgba(0, 100, 100, 0.95) 100%)",
          boxShadow:
            "0 25px 50px rgba(0, 128, 128, 0.25), 0 15px 35px rgba(0, 51, 102, 0.2)",
        }}
      >
        {/* Decorative gradient overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(46, 204, 113, 0.15) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
              Login
            </h2>
            <p className="text-white/90 text-sm leading-relaxed">
              Welcome back! Please sign in to your account.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Email address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Mail
                    className="h-5 w-5 text-emerald-300"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock
                    className="h-5 w-5 text-emerald-300"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100"
              style={{
                background: loading
                  ? "linear-gradient(135deg, rgba(0, 51, 102, 0.7), rgba(0, 68, 102, 0.7))"
                  : "linear-gradient(135deg, var(--accent), #004466)",
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Loading...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Login
                </>
              )}
            </button>
          </form>

          {isCustomerMode && (
            <p className="mt-8 text-center text-sm text-white/80">
              Not a member?{" "}
              <Link
                to="/signup"
                className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                Sign up now <ArrowRight className="h-4 w-4 inline ml-1" />
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
