


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  Loader2,
  MapPin,
  Send,
  Video,
  Sparkles,
  X,
  ShieldCheck,
  BrainCircuit,
  Navigation,
  FileText,
  Zap,
  ScanSearch,
  Building2,
  Target,
  Activity,
  Info,
} from "lucide-react";
import api from "../api/axios";

import Location from "../components/LocationMap";

const CreateComplaint = () => {
  const navigate = useNavigate();

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: "",
    video: "",
    location: {
      latitude: "",
      longitude: "",
      address: "",
      landmark: "",
    },
  });

  // =====================================================
  // UI STATES
  // =====================================================

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [visionLoading, setVisionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // IMAGE FILE STATE
  // =====================================================

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [visionResult, setVisionResult] = useState(null);

  // =====================================================
  // HANDLE BASIC INPUTS
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // HANDLE LOCATION FROM GIS COMPONENT
  // =====================================================

  const handleLocationChange = (newLocation) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        ...newLocation,
      },
    }));

    setError("");
  };

  // =====================================================
  // GET CURRENT GPS LOCATION
  // EXISTING LOGIC — UNCHANGED
  // =====================================================

  const getCurrentLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            latitude,
            longitude,
          },
        }));

        setLocationLoading(false);
      },

      (locationError) => {
        console.error("Location error:", locationError);

        setError(
          "Unable to get your location. Please allow location access or select a location on the map."
        );

        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // =====================================================
  // HANDLE IMAGE SELECTION
  // =====================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setVisionResult(null);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG, and WEBP images are allowed."
      );

      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Image size must be less than 5 MB.");

      event.target.value = "";
      return;
    }

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);

    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  };

  // =====================================================
  // REMOVE SELECTED IMAGE
  // =====================================================

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setVisionResult(null);

    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  };

  // =====================================================
  // RUN PYTHON AI VISION
  // EXISTING LOGIC — UNCHANGED
  // =====================================================

  const analyzeImageWithAI = async () => {
    if (!selectedImage) {
      setError("Please select an image first.");

      return null;
    }

    try {
      setError("");
      setVisionLoading(true);
      setVisionResult(null);

      const formDataObject = new FormData();

      formDataObject.append("file", selectedImage);

      console.log(
        "🤖 [AstraOS Vision] Sending image to Python AI..."
      );

      const response = await api.post(
        "/ai/python-vision",
        formDataObject,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },

          timeout: 120000,
        }
      );

      console.log(
        "🤖 [AstraOS Vision] Response:",
        response.data
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "AI image analysis failed."
        );
      }

      const result = response.data?.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Python AI could not analyze the image."
        );
      }

      setVisionResult(result);

      if (result.image) {
        setFormData((prev) => ({
          ...prev,
          image: result.image,
        }));
      }

      console.log(
        "✅ [AstraOS Vision] Analysis completed"
      );

      return result;
    } catch (err) {
      console.error(
        "❌ [AstraOS Vision] Analysis failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to analyze the image."
      );

      return null;
    } finally {
      setVisionLoading(false);
    }
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    if (!formData.title.trim()) {
      return "Please enter a complaint title.";
    }

    if (formData.title.trim().length < 3) {
      return "Complaint title must be at least 3 characters.";
    }

    if (!formData.description.trim()) {
      return "Please describe the civic issue.";
    }

    if (formData.description.trim().length < 10) {
      return "Description must be at least 10 characters.";
    }

    if (!formData.category) {
      return "Please select a complaint category.";
    }

    if (
      formData.location.latitude === "" ||
      formData.location.longitude === ""
    ) {
      return "Please select the complaint location on the map or use your current location.";
    }

    return "";
  };

  // =====================================================
  // SUBMIT COMPLAINT
  // EXISTING LOGIC — UNCHANGED
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      let currentVisionResult = visionResult;

      if (selectedImage && !currentVisionResult) {
        currentVisionResult = await analyzeImageWithAI();

        if (!currentVisionResult) {
          setLoading(false);
          return;
        }
      }

      const complaintFormData = new FormData();

      complaintFormData.append(
        "title",
        formData.title.trim()
      );

      complaintFormData.append(
        "description",
        formData.description.trim()
      );

      complaintFormData.append(
        "category",
        formData.category
      );

      if (selectedImage) {
        complaintFormData.append(
          "image",
          selectedImage
        );
      }

      if (formData.video.trim()) {
        complaintFormData.append(
          "video",
          formData.video.trim()
        );
      }

      const location = {
        latitude:
          formData.location.latitude === ""
            ? undefined
            : Number(formData.location.latitude),

        longitude:
          formData.location.longitude === ""
            ? undefined
            : Number(formData.location.longitude),

        address:
          formData.location.address?.trim() || "",

        landmark:
          formData.location.landmark?.trim() || "",
      };

      complaintFormData.append(
        "location",
        JSON.stringify(location)
      );

      console.log(
        "📍 [AstraOS GIS] Complaint location:",
        location
      );

      console.log(
        "🚨 [AstraOS] Creating complaint with multipart/form-data"
      );

      const response = await api.post(
        "/complaints",
        complaintFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },

          timeout: 180000,
        }
      );

      const data = response.data;

      console.log(
        "✅ [AstraOS] Complaint response:",
        data
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to create complaint."
        );
      }

      setSuccess(
        "Complaint submitted successfully. AstraOS is now analyzing it."
      );

      const complaint =
        data.data?.complaint;

      if (complaint?.id) {
        setTimeout(() => {
          navigate(`/complaints/${complaint.id}`);
        }, 1200);
      } else {
        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);
      }
    } catch (err) {
      console.error(
        "❌ [AstraOS] Complaint creation error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to submit complaint."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CATEGORY OPTIONS
  // =====================================================

  const categories = [
    "ROAD",
    "WATER",
    "ELECTRICITY",
    "TRAFFIC",
    "GARBAGE",
    "ENVIRONMENT",
    "ANIMALS",
    "INFRASTRUCTURE",
    "CONSTRUCTION",
    "EMERGENCY",
  ];

  // =====================================================
  // CATEGORY LABEL
  // =====================================================

  const getCategoryLabel = (category) => {
    return category
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">

      {/* =================================================
          ASTRAOS AMBIENT BACKGROUND
      ================================================= */}

      <div className="fixed inset-0 pointer-events-none">

        <div className="absolute -top-48 -left-48 w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-[130px]" />

        <div className="absolute top-[30%] -right-52 w-[600px] h-[600px] bg-cyan-500/[0.07] rounded-full blur-[130px]" />

        <div className="absolute -bottom-48 left-[30%] w-[600px] h-[600px] bg-blue-500/[0.05] rounded-full blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="flex items-center justify-between mb-8">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-white transition"
          >

            <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.035] flex items-center justify-center group-hover:border-blue-400/30 transition">

              <ArrowLeft className="w-4 h-4" />

            </div>

            Back

          </button>

          <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">

            <span className="relative flex h-2 w-2">

              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />

              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />

            </span>

            AstraOS Civic Network

          </div>

        </div>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="mb-8">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-7">

            <div className="max-w-3xl">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 text-[11px] font-medium mb-5">

                <Sparkles size={13} />

                INTELLIGENT CIVIC REPORTING

              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">

                Report an issue.

                <span className="block mt-2 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">

                  Let AstraOS take it forward.

                </span>

              </h1>

              <p className="mt-5 text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">

                Capture the problem, provide its exact location,
                attach evidence, and let AstraOS intelligence
                help route your complaint through the civic
                resolution network.

              </p>

            </div>

            <div className="hidden lg:block w-[280px] rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-5">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">

                  <ShieldCheck
                    size={19}
                    className="text-blue-400"
                  />

                </div>

                <div>

                  <p className="text-sm font-semibold">
                    Secure civic submission
                  </p>

                  <p className="text-[11px] text-slate-500 mt-1">
                    Protected by AstraOS
                  </p>

                </div>

              </div>

              <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-400">

                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />

                SYSTEM OPERATIONAL

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            PROCESS STRIP
        ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">

          <ProcessCard
            number="01"
            icon={FileText}
            title="Describe"
            text="Explain the civic issue"
          />

          <ProcessCard
            number="02"
            icon={ScanSearch}
            title="Analyze"
            text="AI examines your evidence"
          />

          <ProcessCard
            number="03"
            icon={Navigation}
            title="Locate"
            text="Pin the exact GIS location"
          />

          <ProcessCard
            number="04"
            icon={Building2}
            title="Route"
            text="Move into civic workflow"
          />

        </section>

        {/* =================================================
            ALERTS
        ================================================= */}

        {success && (

          <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] backdrop-blur-xl p-4">

            <div className="flex items-start gap-3">

              <div className="w-9 h-9 rounded-lg bg-emerald-400/10 flex items-center justify-center shrink-0">

                <CheckCircle2
                  className="w-5 h-5 text-emerald-400"
                />

              </div>

              <div>

                <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-400">
                  Submission Successful
                </p>

                <p className="text-sm font-medium text-emerald-200 mt-1">
                  {success}
                </p>

              </div>

            </div>

          </div>

        )}

        {error && (

          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.07] backdrop-blur-xl p-4">

            <div className="flex items-start gap-3">

              <div className="w-9 h-9 rounded-lg bg-red-400/10 flex items-center justify-center shrink-0">

                <AlertCircle
                  className="w-5 h-5 text-red-400"
                />

              </div>

              <div>

                <p className="text-[10px] uppercase tracking-[0.18em] text-red-400">
                  Action Required
                </p>

                <p className="text-sm font-medium text-red-200 mt-1">
                  {error}
                </p>

              </div>

            </div>

          </div>

        )}

        {/* =================================================
            MAIN FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-2xl shadow-2xl shadow-black/30 overflow-hidden"
        >

          {/* =================================================
              ISSUE DETAILS
          ================================================= */}

          <FormSection
            icon={FileText}
            iconClass="text-blue-400"
            iconBg="bg-blue-500/10"
            eyebrow="01 / Issue Intelligence"
            title="Tell us what happened"
            description="Provide enough context for AstraOS to understand and classify the civic issue."
          >

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

              <div>

                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Complaint Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Example: Large pothole near main road"
                  maxLength={200}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-600"
                />

                <p className="text-[11px] text-slate-600 mt-2">
                  Keep the title short and specific.
                </p>

              </div>

              <div>

                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Issue Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                >

                  <option
                    value=""
                    className="bg-slate-950"
                  >
                    Select issue category
                  </option>

                  {categories.map((category) => (

                    <option
                      key={category}
                      value={category}
                      className="bg-slate-950"
                    >
                      {getCategoryLabel(category)}
                    </option>

                  ))}

                </select>

                <p className="text-[11px] text-slate-600 mt-2">
                  This helps route the complaint correctly.
                </p>

              </div>

            </div>

            <div className="mt-6">

              <div className="flex items-center justify-between mb-2">

                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-slate-300"
                >
                  Description
                </label>

                <span className="text-[10px] text-slate-600">
                  {formData.description.length}/5000
                </span>

              </div>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what happened, where it happened, what you observed, and why it needs attention..."
                rows={7}
                maxLength={5000}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition placeholder:text-slate-600"
              />

            </div>

          </FormSection>

          {/* =================================================
              AI VISION
          ================================================= */}

          <FormSection
            icon={BrainCircuit}
            iconClass="text-cyan-300"
            iconBg="bg-cyan-400/10"
            eyebrow="02 / AI Vision"
            title="Add visual evidence"
            description="Upload an image and AstraOS Vision can inspect the scene for detectable civic issues."
          >

            <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-5">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div className="flex items-start gap-3">

                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center shrink-0">

                    <ScanSearch
                      size={18}
                      className="text-cyan-300"
                    />

                  </div>

                  <div>

                    <p className="text-sm font-semibold text-white">
                      AstraOS Vision Engine
                    </p>

                    <p className="text-[11px] text-slate-500 mt-1">
                      Evidence analysis powered by your AI pipeline
                    </p>

                  </div>

                </div>

                <div className="inline-flex items-center gap-2 text-[10px] text-emerald-400">

                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />

                  READY

                </div>

              </div>

              <div className="mt-6">

                <label
                  htmlFor="imageFile"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Civic Issue Image
                </label>

                <input
                  id="imageFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={
                    visionLoading ||
                    loading
                  }
                  className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-500/10 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-blue-300 hover:file:bg-blue-500/20"
                />

                <p className="text-[11px] text-slate-600 mt-2">
                  JPG, PNG, or WEBP • Maximum 5 MB
                </p>

              </div>

              {/* IMAGE PREVIEW */}

              {imagePreview && (

                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">

                  <div className="flex items-center justify-between mb-4">

                    <div>

                      <p className="text-sm font-semibold text-slate-300">
                        Evidence Preview
                      </p>

                      {selectedImage && (
                        <p className="text-[11px] text-slate-600 mt-1">
                          {selectedImage.name}
                        </p>
                      )}

                    </div>

                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      disabled={
                        visionLoading ||
                        loading
                      }
                      className="w-8 h-8 rounded-lg border border-white/10 text-slate-500 hover:text-red-400 hover:border-red-400/20 hover:bg-red-400/5 transition flex items-center justify-center"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>

                  </div>

                  <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">

                    <img
                      src={imagePreview}
                      alt="Selected civic issue"
                      className="w-full max-h-[420px] object-contain"
                    />

                  </div>

                </div>

              )}

              {/* AI BUTTON */}

              {selectedImage && (

                <button
                  type="button"
                  onClick={analyzeImageWithAI}
                  disabled={
                    visionLoading ||
                    loading ||
                    !!visionResult
                  }
                  className="group w-full mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-cyan-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >

                  {visionLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AstraOS is analyzing evidence...
                    </>
                  ) : visionResult ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      AI Analysis Completed
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Image with AstraOS AI
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition"
                      />
                    </>
                  )}

                </button>

              )}

              {/* AI RESULT */}

              {visionResult && (

                <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.035] overflow-hidden">

                  <div className="p-5 border-b border-white/5">

                    <div className="flex items-center gap-3">

                      <div className="w-9 h-9 rounded-xl bg-cyan-400/10 flex items-center justify-center">

                        <Sparkles
                          size={17}
                          className="text-cyan-300"
                        />

                      </div>

                      <div>

                        <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-400">
                          AI Intelligence
                        </p>

                        <h3 className="text-base font-bold text-white mt-1">
                          Vision Analysis Result
                        </h3>

                      </div>

                    </div>

                  </div>

                  <div className="p-5">

                    <div className="grid grid-cols-2 gap-3">

                      <AIStat
                        label="Overall Severity"
                        value={
                          visionResult.overall_severity ||
                          "N/A"
                        }
                      />

                      <AIStat
                        label="Detections"
                        value={
                          visionResult.detection_count ??
                          0
                        }
                      />

                    </div>

                    {visionResult.detections?.length > 0 && (

                      <div className="mt-5">

                        <p className="text-xs font-semibold text-slate-300 mb-3">
                          Detected Issues
                        </p>

                        <div className="space-y-2">

                          {visionResult.detections.map(
                            (detection, index) => (

                              <div
                                key={index}
                                className="rounded-xl border border-white/5 bg-white/[0.025] p-4"
                              >

                                <div className="flex items-center justify-between gap-3">

                                  <div>

                                    <p className="font-semibold text-sm text-white capitalize">
                                      {detection.object}
                                    </p>

                                    <p className="text-[11px] text-slate-500 mt-1">
                                      Confidence:{" "}
                                      {(
                                        detection.confidence *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </p>

                                  </div>

                                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[10px] font-bold text-amber-300">
                                    {detection.severity}
                                  </span>

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    )}

                    <div className="flex items-start gap-2 mt-5 rounded-xl border border-blue-400/10 bg-blue-400/[0.035] p-3">

                      <Info
                        size={14}
                        className="text-blue-400 mt-0.5 shrink-0"
                      />

                      <p className="text-[10px] leading-relaxed text-slate-500">
                        Vision AI preview completed. The original
                        image is also sent to the main complaint
                        pipeline during submission.
                      </p>

                    </div>

                  </div>

                </div>

              )}

            </div>

            {/* IMAGE PATH */}

            <div className="mt-6">

              <label
                htmlFor="image"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Image Path / URL
              </label>

              <div className="relative">

                <ImagePlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />

                <input
                  id="image"
                  name="image"
                  type="text"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="Image path / URL"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 pl-10 pr-4 py-3.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition placeholder:text-slate-600"
                />

              </div>

            </div>

            {/* VIDEO */}

            <div className="mt-5">

              <label
                htmlFor="video"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Video URL
              </label>

              <div className="relative">

                <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />

                <input
                  id="video"
                  name="video"
                  type="text"
                  value={formData.video}
                  onChange={handleChange}
                  placeholder="Paste video URL"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 pl-10 pr-4 py-3.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition placeholder:text-slate-600"
                />

              </div>

            </div>

          </FormSection>

          {/* =================================================
              GIS LOCATION
          ================================================= */}

          <FormSection
            icon={MapPin}
            iconClass="text-emerald-400"
            iconBg="bg-emerald-400/10"
            eyebrow="03 / Geospatial Intelligence"
            title="Pin the exact location"
            description="A precise location helps AstraOS connect the complaint with the right civic area and workflow."
          >

            <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.02] overflow-hidden">

              <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-xl bg-emerald-400/10 flex items-center justify-center">

                    <Navigation
                      size={16}
                      className="text-emerald-400"
                    />

                  </div>

                  <div>

                    <p className="text-sm font-semibold text-white">
                      GIS Location Intelligence
                    </p>

                    <p className="text-[10px] text-slate-600">
                      Select directly on the map
                    </p>

                  </div>

                </div>

                {formData.location.latitude !== "" &&
                  formData.location.longitude !== "" && (

                    <div className="inline-flex items-center gap-2 text-[10px] text-emerald-400">

                      <CheckCircle2 size={13} />

                      LOCATION CAPTURED

                    </div>

                  )}

              </div>

              <div className="p-4">

                <div className="rounded-xl overflow-hidden border border-white/10">

                  <Location
                    location={formData.location}
                    onLocationChange={
                      handleLocationChange
                    }
                    disabled={
                      loading ||
                      locationLoading
                    }
                  />

                </div>

              </div>

            </div>

            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={
                locationLoading ||
                loading
              }
              className="w-full mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-400/10 transition disabled:opacity-60"
            >

              {locationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Getting your current location...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Use My Current Location
                </>
              )}

            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">

              <DarkInput
                id="latitude"
                label="Latitude"
                value={
                  formData.location.latitude
                }
                placeholder="Select location on map"
              />

              <DarkInput
                id="longitude"
                label="Longitude"
                value={
                  formData.location.longitude
                }
                placeholder="Select location on map"
              />

            </div>

            <div className="mt-5">

              <label
                htmlFor="address"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Address
              </label>

              <input
                id="address"
                type="text"
                value={
                  formData.location.address
                }
                onChange={(event) =>
                  handleLocationChange({
                    address:
                      event.target.value,
                  })
                }
                placeholder="Example: Main Road, Hyderabad"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition placeholder:text-slate-600"
              />

            </div>

            <div className="mt-5">

              <label
                htmlFor="landmark"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Landmark
              </label>

              <input
                id="landmark"
                type="text"
                value={
                  formData.location.landmark
                }
                onChange={(event) =>
                  handleLocationChange({
                    landmark:
                      event.target.value,
                  })
                }
                placeholder="Example: Near Government School"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition placeholder:text-slate-600"
              />

            </div>

          </FormSection>

          {/* =================================================
              AI PIPELINE
          ================================================= */}

          <section className="p-6 sm:p-8 border-t border-white/5">

            <div className="rounded-2xl border border-blue-400/10 bg-blue-400/[0.025] overflow-hidden">

              <div className="p-5 border-b border-white/5">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">

                    <BrainCircuit
                      size={18}
                      className="text-blue-400"
                    />

                  </div>

                  <div>

                    <p className="text-[10px] uppercase tracking-[0.18em] text-blue-400">
                      AstraOS Intelligence Pipeline
                    </p>

                    <h3 className="text-base font-bold text-white mt-1">
                      What happens after submission?
                    </h3>

                  </div>

                </div>

              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                <PipelineStep
                  icon={FileText}
                  number="01"
                  title="Complaint Stored"
                  text="Your civic report enters the AstraOS system."
                />

                <PipelineStep
                  icon={ScanSearch}
                  number="02"
                  title="Vision Analysis"
                  text="Uploaded evidence can be analyzed by AI."
                />

                <PipelineStep
                  icon={BrainCircuit}
                  number="03"
                  title="NLP Intelligence"
                  text="Complaint context is analyzed for understanding."
                />

                <PipelineStep
                  icon={Target}
                  number="04"
                  title="Priority Engine"
                  text="AstraOS determines the complaint priority."
                />

                <PipelineStep
                  icon={Activity}
                  number="05"
                  title="Duplicate Detection"
                  text="Similar complaints can be identified."
                />

                <PipelineStep
                  icon={Building2}
                  number="06"
                  title="Department Routing"
                  text="The issue moves toward the appropriate department."
                />

              </div>

              <div className="px-5 pb-5">

                <div className="flex items-start gap-2 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.025] p-3">

                  <Zap
                    size={14}
                    className="text-cyan-400 mt-0.5 shrink-0"
                  />

                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    AstraOS combines complaint data, evidence,
                    AI intelligence, priority logic, duplicate
                    detection, department routing, and GIS
                    information into one civic workflow.
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="submit"
              disabled={
                loading ||
                visionLoading
              }
              className="group w-full mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/20 hover:from-blue-500 hover:to-cyan-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >

              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting complaint...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Complaint to AstraOS
                  <ArrowRight
                    size={17}
                    className="group-hover:translate-x-1 transition"
                  />
                </>
              )}

            </button>

            <p className="text-center text-[10px] text-slate-600 mt-4">
              By submitting, your complaint enters the AstraOS
              civic resolution workflow.
            </p>

          </section>

        </form>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="mt-10 pt-6 border-t border-white/5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-2">

              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">

                <ShieldCheck size={15} />

              </div>

              <div>

                <p className="text-xs font-semibold text-slate-300">
                  Astra<span className="text-cyan-400">OS</span>
                </p>

                <p className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
                  Civic Intelligence Platform
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-600">

              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

              Secure civic infrastructure

            </div>

          </div>

        </footer>

      </main>
    </div>
  );
};

// =========================================================
// FORM SECTION
// =========================================================

function FormSection({
  icon: Icon,
  iconClass,
  iconBg,
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section className="p-6 sm:p-8 border-b border-white/5">

      <div className="flex items-start gap-4 mb-7">

        <div
          className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
        >

          <Icon
            size={20}
            className={iconClass}
          />

        </div>

        <div>

          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
            {eyebrow}
          </p>

          <h2 className="text-xl font-bold text-white mt-1">
            {title}
          </h2>

          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>

        </div>

      </div>

      {children}

    </section>
  );
}

// =========================================================
// PROCESS CARD
// =========================================================

function ProcessCard({
  number,
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-4">

      <div className="flex items-center justify-between">

        <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">

          <Icon
            size={16}
            className="text-blue-400"
          />

        </div>

        <span className="text-[10px] text-slate-700 font-bold">
          {number}
        </span>

      </div>

      <p className="text-sm font-semibold text-white mt-3">
        {title}
      </p>

      <p className="text-[11px] text-slate-600 mt-1">
        {text}
      </p>

    </div>
  );
}

// =========================================================
// AI STAT
// =========================================================

function AIStat({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.025] p-4">

      <p className="text-[10px] uppercase tracking-[0.15em] text-slate-600">
        {label}
      </p>

      <p className="text-xl font-bold text-cyan-300 mt-2">
        {value}
      </p>

    </div>
  );
}

// =========================================================
// DARK INPUT
// =========================================================

function DarkInput({
  id,
  label,
  value,
  placeholder,
}) {
  return (
    <div>

      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-300 mb-2"
      >
        {label}
      </label>

      <input
        id={id}
        type="number"
        step="any"
        value={value}
        readOnly
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3.5 text-sm text-slate-400 outline-none placeholder:text-slate-700"
      />

    </div>
  );
}

// =========================================================
// PIPELINE STEP
// =========================================================

function PipelineStep({
  icon: Icon,
  number,
  title,
  text,
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.025] p-4">

      <div className="flex items-center justify-between">

        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">

          <Icon
            size={15}
            className="text-blue-400"
          />

        </div>

        <span className="text-[9px] font-bold text-slate-700">
          {number}
        </span>

      </div>

      <p className="text-xs font-semibold text-slate-300 mt-3">
        {title}
      </p>

      <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
        {text}
      </p>

    </div>
  );
}

export default CreateComplaint;