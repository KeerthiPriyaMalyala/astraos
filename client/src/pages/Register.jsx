




import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  Building2,
  UserCog,
  Activity,
  ArrowUpRight,
  Radio,
  Sparkles,
  MapPin,
  MessageSquare,
  Zap,
} from "lucide-react";
import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    if (!formData.name.trim()) {
      return "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (!formData.phoneNumber.trim()) {
      return "Please enter your phone number.";
    }

    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      return "Phone number must contain exactly 10 digits.";
    }

    if (!formData.password) {
      return "Please create a password.";
    }

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
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

      const response = await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
      });

      const { user, token } = response.data.data;

      // =====================================================
      // EXISTING AUTHENTICATION STORAGE
      // =====================================================

      localStorage.setItem("astraos_token", token);
      localStorage.setItem(
        "astraos_user",
        JSON.stringify(user)
      );

      setSuccess(
        "Account created successfully! Welcome to AstraOS."
      );

      // =====================================================
      // EXISTING REDIRECTION
      // =====================================================

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (err) {
      console.error("Registration error:", err);

      const message =
        err.response?.data?.message ||
        "Something went wrong while creating your account.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const ecosystemCards = [
    {
      icon: Users,
      title: "Citizens",
      text: "Report civic issues",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      icon: UserCog,
      title: "Officers",
      text: "Resolve issues faster",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      icon: Building2,
      title: "Departments",
      text: "Coordinate response",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      icon: ShieldCheck,
      title: "Administration",
      text: "Drive accountability",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  const activityCards = [
    {
      icon: MapPin,
      title: "Road infrastructure",
      status: "Assigned",
      location: "Central District",
    },
    {
      icon: MessageSquare,
      title: "Civic complaint",
      status: "In progress",
      location: "Ward 14",
    },
    {
      icon: Zap,
      title: "Street lighting",
      status: "Resolved",
      location: "North Zone",
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">

      {/* =====================================================
          BACKGROUND ATMOSPHERE
      ===================================================== */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[100px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex">

        {/* =====================================================
            LEFT — ASTRAOS ECOSYSTEM
        ===================================================== */}

        <div className="hidden lg:flex lg:w-[56%] xl:w-[58%] relative px-10 xl:px-16 py-10 flex-col justify-between overflow-hidden">

          {/* Top branding */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-3 group"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
                <ShieldCheck size={24} />
              </div>

              <div>
                <div className="text-2xl font-bold tracking-tight">
                  Astra<span className="text-blue-400">OS</span>
                </div>

                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  Civic Intelligence Platform
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Main Hero */}
          <div className="max-w-2xl -mt-4">

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-300 text-xs font-medium mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>

                Civic intelligence network online
              </div>

              <h2 className="text-4xl xl:text-5xl font-bold leading-[1.08] tracking-tight">
                One platform.
                <br />

                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400">
                  One connected city.
                </span>
              </h2>

              <p className="text-slate-400 text-base xl:text-lg leading-relaxed mt-5 max-w-xl">
                AstraOS connects citizens, field officers,
                government departments and administrators into
                one intelligent civic response ecosystem.
              </p>
            </motion.div>

            {/* =================================================
                ECOSYSTEM FLOW
            ================================================= */}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8"
            >

              <div className="flex items-center gap-2 mb-3">
                <Activity
                  size={15}
                  className="text-blue-400"
                />

                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Connected civic ecosystem
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {ecosystemCards.map((card, index) => {
                  const Icon = card.icon;

                  return (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.4 + index * 0.08,
                      }}
                      whileHover={{
                        y: -3,
                        scale: 1.01,
                      }}
                      className={`group rounded-2xl border ${card.border} ${card.bg} backdrop-blur-xl p-4 transition-all`}
                    >
                      <div className="flex items-start justify-between">

                        <div
                          className={`w-9 h-9 rounded-xl bg-slate-950/50 flex items-center justify-center ${card.color}`}
                        >
                          <Icon size={18} />
                        </div>

                        <ArrowUpRight
                          size={15}
                          className="text-slate-600 group-hover:text-slate-300 transition"
                        />
                      </div>

                      <div className="mt-4">
                        <h3 className="font-semibold text-sm">
                          {card.title}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1">
                          {card.text}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* =================================================
                LIVE ACTIVITY BOARD
            ================================================= */}

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-6"
            >

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden">

                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">

                  <div className="flex items-center gap-2">
                    <Radio
                      size={15}
                      className="text-emerald-400"
                    />

                    <span className="text-xs font-semibold text-slate-300">
                      LIVE CIVIC ACTIVITY
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-emerald-400 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </div>

                </div>

                <div className="divide-y divide-slate-800/70">

                  {activityCards.map((activity, index) => {
                    const Icon = activity.icon;

                    return (
                      <motion.div
                        key={activity.title}
                        animate={{
                          opacity: [0.65, 1, 0.65],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.8,
                        }}
                        className="px-4 py-3 flex items-center gap-3"
                      >

                        <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-blue-400">
                          <Icon size={15} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-300 truncate">
                            {activity.title}
                          </p>

                          <p className="text-[10px] text-slate-600 mt-0.5">
                            {activity.location}
                          </p>
                        </div>

                        <span className="text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                          {activity.status}
                        </span>

                      </motion.div>
                    );
                  })}

                </div>
              </div>
            </motion.div>
          </div>

          {/* =================================================
              QUOTE
          ================================================= */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex items-center gap-4"
          >
            <div className="h-px w-10 bg-slate-800" />

            <p className="text-xs text-slate-500 italic">
              "Better infrastructure begins with better
              connections."
            </p>
          </motion.div>
        </div>

        {/* =====================================================
            RIGHT — REGISTRATION
        ===================================================== */}

        <div className="w-full lg:w-[44%] xl:w-[42%] flex items-center justify-center px-4 sm:px-8 py-8 lg:border-l border-slate-800/70">

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >

            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-7">

              <Link
                to="/"
                className="inline-flex items-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <ShieldCheck size={22} />
                </div>

                <span className="text-2xl font-bold">
                  Astra<span className="text-blue-400">OS</span>
                </span>
              </Link>

            </div>

            {/* =================================================
                FORM HEADER
            ================================================= */}

            <div className="mb-6">

              <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 mb-3">
                <Sparkles size={14} />
                Join the civic network
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Create your account
              </h1>

              <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                Join AstraOS and become part of a smarter,
                more connected civic ecosystem.
              </p>

            </div>

            {/* =================================================
                FORM CARD
            ================================================= */}

            <div className="bg-slate-900/75 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/30">

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                    }}
                    className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 overflow-hidden"
                  >
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                    }}
                    className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 overflow-hidden"
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
                className="space-y-4"
              >

                {/* =================================================
                    NAME
                ================================================= */}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Full Name
                  </label>

                  <div className="relative group">

                    <User
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition"
                    />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-600 hover:border-slate-600"
                    />

                  </div>
                </div>

                {/* =================================================
                    EMAIL
                ================================================= */}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Email Address
                  </label>

                  <div className="relative group">

                    <Mail
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition"
                    />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-600 hover:border-slate-600"
                    />

                  </div>
                </div>

                {/* =================================================
                    PHONE
                ================================================= */}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>

                  <div className="relative group">

                    <Phone
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition"
                    />

                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="10 digit mobile number"
                      maxLength={10}
                      autoComplete="tel"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-600 hover:border-slate-600"
                    />

                  </div>
                </div>

                {/* =================================================
                    PASSWORD
                ================================================= */}

                <div>
                  <div className="flex items-center justify-between mb-2">

                    <label className="block text-xs font-medium text-slate-300">
                      Password
                    </label>

                    <span className="text-[10px] text-slate-600">
                      8+ characters
                    </span>

                  </div>

                  <div className="relative group">

                    <Lock
                      size={17}
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
                      placeholder="Create a secure password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 py-3 pl-10 pr-12 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-600 hover:border-slate-600"
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
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                  </div>

                  <div className="mt-2 h-1 rounded-full bg-slate-800 overflow-hidden">

                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          formData.password.length === 0
                            ? "0%"
                            : formData.password.length < 8
                            ? "35%"
                            : formData.password.length < 12
                            ? "70%"
                            : "100%",
                      }}
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    />

                  </div>
                </div>

                {/* =================================================
                    CONFIRM PASSWORD
                ================================================= */}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Confirm Password
                  </label>

                  <div className="relative group">

                    <Lock
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition"
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 py-3 pl-10 pr-12 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-600 hover:border-slate-600"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                  </div>

                  {formData.confirmPassword &&
                    formData.password ===
                      formData.confirmPassword && (
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400">
                        <CheckCircle2 size={12} />
                        Passwords match
                      </div>
                    )}

                </div>

                {/* =================================================
                    SUBMIT
                ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 font-semibold text-sm transition-all hover:from-blue-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
                >

                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {loading ? (
                    <span className="relative flex items-center justify-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Creating your civic account...
                    </span>
                  ) : (
                    <span className="relative flex items-center justify-center gap-2">
                      Create Account
                      <ArrowUpRight
                        size={16}
                        className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      />
                    </span>
                  )}

                </button>

              </form>

              {/* =================================================
                  LOGIN
              ================================================= */}

              <div className="relative flex items-center gap-3 my-6">

                <div className="flex-1 h-px bg-slate-800" />

                <span className="text-[10px] uppercase tracking-wider text-slate-600">
                  Already connected?
                </span>

                <div className="flex-1 h-px bg-slate-800" />

              </div>

              <Link
                to="/login"
                className="flex items-center justify-center w-full rounded-xl border border-slate-700 bg-slate-950/50 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800/50 transition"
              >
                Sign in to AstraOS
              </Link>

              {/* =================================================
                  SECURITY
              ================================================= */}

              <div className="flex items-center justify-center gap-2 mt-5 text-[10px] text-slate-600">
                <ShieldCheck size={13} />
                Secure authentication • Civic data protection
              </div>

            </div>

            {/* Bottom statement */}
            <p className="text-center text-[10px] text-slate-700 mt-5">
              By creating an account, you agree to AstraOS
              community guidelines and platform terms.
            </p>

          </motion.div>
        </div>
      </div>
    </div>
  );
}