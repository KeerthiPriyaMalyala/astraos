


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  Building2,
  UserRound,
  Landmark,
  ArrowRight,
  Activity,
  Radio,
  Sparkles,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      return "Please enter your email.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (!formData.password) {
      return "Please enter your password.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      // =====================================================
      // EXISTING AUTHENTICATION LOGIC — UNCHANGED
      // =====================================================

      const response = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (!response?.success || !response?.data?.user) {
        setError(
          response?.message || "Login failed. Please try again."
        );
        return;
      }

      const user = response.data.user;

      setSuccess("Login successful! Welcome back to AstraOS.");

      // =====================================================
      // EXISTING ROLE-BASED REDIRECTION — UNCHANGED
      // =====================================================

      setTimeout(() => {
        switch (user.role) {
          case "ADMIN":
            navigate("/admin/dashboard");
            break;

          case "DEPARTMENT_HEAD":
            navigate("/department/dashboard");
            break;

          case "OFFICER":
            navigate("/officer/dashboard");
            break;

          case "CITIZEN":
            navigate("/dashboard");
            break;

          default:
            console.error("Unknown user role:", user.role);
            navigate("/dashboard");
        }
      }, 800);
    } catch (err) {
      console.error("Login error:", err);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong while logging in.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="absolute inset-0 pointer-events-none">

        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <div className="relative z-10 min-h-screen flex">

        {/* =====================================================
            LEFT — ASTRAOS STORY / LIVE PLATFORM
        ===================================================== */}

        <div className="hidden lg:flex lg:w-[58%] xl:w-[60%] p-10 xl:p-14 flex-col justify-between relative">

          {/* Brand */}

          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/20">
                <ShieldCheck size={27} />
              </div>

              <div>
                <div className="text-2xl font-bold tracking-tight">
                  Astra<span className="text-cyan-400">OS</span>
                </div>

                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  Civic Intelligence Platform
                </div>
              </div>

            </Link>
          </motion.div>


          {/* Hero */}

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="max-w-3xl"
          >

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 text-xs font-medium mb-6">

              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>

              Civic infrastructure, connected in real time

            </div>


            <h1 className="text-5xl xl:text-6xl font-bold leading-[1.05] tracking-tight">

              Turning citizen voices into

              <span className="block mt-2 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                smarter communities.
              </span>

            </h1>


            <p className="text-slate-400 text-lg leading-relaxed mt-7 max-w-2xl">
              AstraOS connects citizens, government departments,
              officers and administrators through one intelligent
              civic infrastructure platform.
            </p>


            {/* Role cards */}

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-10">

              <RoleCard
                icon={UserRound}
                title="Citizens"
                text="Raise & track"
                delay={0}
              />

              <RoleCard
                icon={Building2}
                title="Departments"
                text="Coordinate work"
                delay={0.1}
              />

              <RoleCard
                icon={Users}
                title="Officers"
                text="Resolve issues"
                delay={0.2}
              />

              <RoleCard
                icon={Landmark}
                title="Admins"
                text="Drive governance"
                delay={0.3}
              />

            </div>


            {/* Live activity board */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-5"
            >

              <div className="flex items-center justify-between mb-5">

                <div className="flex items-center gap-2">

                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Activity
                      size={16}
                      className="text-blue-400"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      AstraOS Civic Network
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Platform activity
                    </p>
                  </div>

                </div>


                <div className="flex items-center gap-2 text-[11px] text-emerald-400">

                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />

                  LIVE

                </div>

              </div>


              <div className="grid grid-cols-3 gap-3">

                <LiveStat
                  value="24/7"
                  label="Civic access"
                />

                <LiveStat
                  value="4"
                  label="Connected roles"
                />

                <LiveStat
                  value="1"
                  label="Unified platform"
                />

              </div>

            </motion.div>

          </motion.div>


          {/* Quote */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex items-center gap-4"
          >

            <div className="h-px w-12 bg-slate-700" />

            <p className="text-sm italic text-slate-500">
              “Better infrastructure begins with better communication.”
            </p>

          </motion.div>

        </div>


        {/* =====================================================
            RIGHT — LOGIN
        ===================================================== */}

        <div className="w-full lg:w-[42%] xl:w-[40%] flex items-center justify-center p-5 sm:p-8 lg:p-10">

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >

            {/* Mobile logo */}

            <div className="lg:hidden text-center mb-8">

              <Link
                to="/"
                className="inline-flex items-center gap-2"
              >

                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>

                <span className="text-2xl font-bold">
                  Astra<span className="text-cyan-400">OS</span>
                </span>

              </Link>

            </div>


            {/* Login heading */}

            <div className="mb-7">

              <div className="inline-flex items-center gap-2 text-xs text-slate-500 mb-3">

                <Radio size={13} />

                SECURE CIVIC ACCESS

              </div>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Welcome back
              </h2>

              <p className="text-slate-400 mt-2">
                Sign in to continue your AstraOS journey.
              </p>

            </div>


            {/* Login card */}

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/30">

              {/* Alerts */}

              <AnimatePresence>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  >

                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>

                  </motion.div>
                )}


                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
                  >

                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{success}</span>

                  </motion.div>
                )}

              </AnimatePresence>


              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Email */}

                <div>

                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email address
                  </label>

                  <div className="relative group">

                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition"
                    />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-600"
                    />

                  </div>

                </div>


                {/* Password */}

                <div>

                  <div className="flex items-center justify-between mb-2">

                    <label className="block text-sm font-medium text-slate-300">
                      Password
                    </label>

                    <span className="text-[11px] text-slate-600">
                      Protected access
                    </span>

                  </div>


                  <div className="relative group">

                    <Lock
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-600"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >

                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}

                    </button>

                  </div>

                </div>


                {/* Login */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 font-semibold text-sm transition hover:from-blue-500 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-blue-600/20"
                >

                  {loading ? (
                    <span className="flex items-center justify-center gap-2">

                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />

                      Signing in...

                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">

                      Sign in to AstraOS

                      <ArrowRight
                        size={17}
                        className="group-hover:translate-x-1 transition"
                      />

                    </span>
                  )}

                </button>

              </form>


              {/* Register */}

              <div className="relative my-7">

                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>

                <div className="relative flex justify-center">
                  <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-600">
                    New to AstraOS?
                  </span>
                </div>

              </div>


              <Link
                to="/register"
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-700 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:border-slate-600 transition"
              >

                Create citizen account

                <ArrowRight size={16} />

              </Link>


              {/* Trust indicators */}

              <div className="grid grid-cols-2 gap-3 mt-6">

                <div className="rounded-xl bg-white/[0.025] border border-white/5 p-3">

                  <div className="flex items-center gap-2">

                    <ShieldCheck
                      size={15}
                      className="text-emerald-400"
                    />

                    <span className="text-[11px] text-slate-400">
                      Secure authentication
                    </span>

                  </div>

                </div>


                <div className="rounded-xl bg-white/[0.025] border border-white/5 p-3">

                  <div className="flex items-center gap-2">

                    <MapPin
                      size={15}
                      className="text-blue-400"
                    />

                    <span className="text-[11px] text-slate-400">
                      Civic infrastructure
                    </span>

                  </div>

                </div>

              </div>

            </div>


            <p className="text-center text-[11px] text-slate-600 mt-6 leading-relaxed">
              AstraOS connects people, departments and decision-makers
              to create more responsive communities.
            </p>

          </motion.div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   ROLE CARD
========================================================= */

function RoleCard({
  icon: Icon,
  title,
  text,
  delay,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.25 + delay,
      }}
      whileHover={{
        y: -3,
      }}
      className="group rounded-2xl border border-white/8 bg-white/[0.035] backdrop-blur-xl p-4 transition hover:border-blue-400/20 hover:bg-blue-500/[0.04]"
    >

      <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 group-hover:bg-blue-500/15 transition">

        <Icon
          size={17}
          className="text-blue-400"
        />

      </div>

      <p className="text-sm font-semibold">
        {title}
      </p>

      <p className="text-[11px] text-slate-500 mt-1">
        {text}
      </p>

    </motion.div>
  );
}


/* =========================================================
   LIVE STAT
========================================================= */

function LiveStat({
  value,
  label,
}) {
  return (
    <div className="rounded-xl bg-slate-950/50 border border-white/5 p-3">

      <div className="flex items-center gap-2">

        <CheckCircle
          size={13}
          className="text-emerald-400"
        />

        <span className="text-lg font-bold">
          {value}
        </span>

      </div>

      <p className="text-[10px] text-slate-500 mt-1">
        {label}
      </p>

    </div>
  );
}



