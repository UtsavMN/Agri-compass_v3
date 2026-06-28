import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";

const KARNATAKA_DISTRICTS = [
  "Bagalkot","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban",
  "Bidar","Chamarajanagar","Chikkaballapur","Chikkamagaluru","Chitradurga",
  "Dakshina Kannada","Davangere","Dharwad","Gadag","Hassan","Haveri",
  "Kalaburagi","Kodagu","Kolar","Koppal","Mandya","Mysuru","Raichur",
  "Ramanagara","Shivamogga","Tumakuru","Udupi","Uttara Kannada",
  "Vijayapura","Yadgir"
];

const KARNATAKA_CROPS = [
  "Ragi","Jowar","Bajra","Maize","Paddy","Wheat","Cotton","Sugarcane",
  "Groundnut","Sunflower","Soybean","Tomato","Onion","Potato",
  "Brinjal","Banana","Mango","Coconut","Arecanut","Coffee","Tea"
];

const SOIL_TYPES = ["Red Loam","Black Cotton","Laterite","Alluvial","Sandy Loam"];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    usernameHandle: "",
    phone: "",
    district: "",
    language: "kn",
    profilePicture: null as File | null,
    profilePictureUrl: "",
    hasFarm: false,
    farmName: "",
    acres: "",
    currentCrop: "",
    soilType: "",
  });

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const checkUsername = async (handle: string) => {
    if (handle.length < 3) return;
    setCheckingUsername(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ""}/api/users/check-handle?handle=${handle}`
      );
      const { available } = await res.json();
      setUsernameAvailable(available);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = await getToken();
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || ""}/api/profile/upload-avatar`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
    );
    const { url } = await res.json();
    setForm(f => ({ ...f, profilePicture: file, profilePictureUrl: url }));
  };

  const submitStep1 = async () => {
    if (!form.fullName || !form.usernameHandle || !form.phone || !form.district) {
      setError("Please fill in all required fields.");
      return;
    }
    if (usernameAvailable === false) {
      setError("Username is already taken. Please choose another.");
      return;
    }
    setError("");
    setStep(2);
  };

  const submitFinal = async (skip = false) => {
    setLoading(true);
    try {
      const token = await getToken();
      await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/users/onboarding`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          usernameHandle: form.usernameHandle,
          phone: form.phone,
          district: form.district,
          language: form.language,
          profilePictureUrl: form.profilePictureUrl,
          farm: skip ? null : (form.hasFarm ? {
            farmName: form.farmName,
            acres: parseFloat(form.acres) || null,
            currentCrop: form.currentCrop || null,
            soilType: form.soilType || null,
          } : null),
        }),
      });
      setStep(3);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#111] border border-[#1E1E1E] rounded-xl px-4 py-3 text-[#F5F0E8] text-sm focus:border-[#C9A84C]/50 focus:outline-none transition-colors placeholder:text-[#F5F0E8]/20";
  const selectClass = "w-full bg-[#111] border border-[#1E1E1E] rounded-xl px-4 py-3 text-[#F5F0E8] text-sm focus:border-[#C9A84C]/50 focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Progress indicator */}
        <div className="flex gap-2 justify-center mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${
              i === step ? "w-8 bg-[#C9A84C]" :
              i < step ? "w-4 bg-[#C9A84C]/40" :
              "w-4 bg-[#1E1E1E]"
            }`} />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1 — Identity (compulsory) */}
          {step === 1 && (
            <motion.div key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="glass-panel p-8 rounded-3xl">

              <div className="text-center mb-8">
                <div className="text-4xl mb-4">🌾</div>
                <h1 className="text-2xl font-serif text-[#F5F0E8] mb-2">Tell us about yourself</h1>
                <p className="text-[#F5F0E8]/40 text-sm">Takes 30 seconds. Your data stays private.</p>
              </div>

              {/* Profile picture upload */}
              <div className="flex justify-center mb-6">
                <label className="cursor-pointer">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#C9A84C]/30 hover:border-[#C9A84C]/60 transition-colors flex items-center justify-center overflow-hidden bg-[#111]">
                    {form.profilePictureUrl ? (
                      <img src={form.profilePictureUrl} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className="text-center">
                        <div className="text-2xl">📷</div>
                        <div className="text-[#F5F0E8]/30 text-xs mt-1">Add photo</div>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                </label>
              </div>

              <div className="space-y-3">
                <input className={inputClass} placeholder="Full name *"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F5F0E8]/30 text-sm">@</span>
                  <input
                    className={`${inputClass} pl-8`}
                    placeholder="username_handle *"
                    value={form.usernameHandle}
                    onChange={e => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                      setForm(f => ({ ...f, usernameHandle: val }));
                      clearTimeout((window as any)._handleTimeout);
                      (window as any)._handleTimeout = setTimeout(() => checkUsername(val), 500);
                    }}
                  />
                  {checkingUsername && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#F5F0E8]/30">checking...</span>
                  )}
                  {usernameAvailable === true && !checkingUsername && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-400">✓ available</span>
                  )}
                  {usernameAvailable === false && !checkingUsername && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-400">✗ taken</span>
                  )}
                </div>

                <input className={inputClass} placeholder="+91 phone number *" type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />

                <select className={selectClass} value={form.district}
                  onChange={e => setForm(f => ({ ...f, district: e.target.value }))}>
                  <option value="">Select your district *</option>
                  {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                {/* Language toggle */}
                <div className="flex gap-3">
                  {(["kn", "en"] as const).map(lang => (
                    <button key={lang}
                      onClick={() => setForm(f => ({ ...f, language: lang }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                        form.language === lang
                          ? "bg-[#C9A84C] text-[#0A0A0A]"
                          : "bg-[#111] border border-[#1E1E1E] text-[#F5F0E8]/40"
                      }`}>
                      {lang === "kn" ? "ಕನ್ನಡ" : "English"}
                    </button>
                  ))}
                </div>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button onClick={submitStep1}
                  className="w-full py-3.5 bg-[#C9A84C] text-[#0A0A0A] font-bold tracking-wide rounded-xl hover:bg-[#D4B86A] hover:-translate-y-0.5 shadow-[0_0_15px_rgba(201,168,76,0.3)] hover:shadow-[0_0_25px_rgba(201,168,76,0.5)] transition-all">
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 — Farm info (optional) */}
          {step === 2 && (
            <motion.div key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="glass-panel p-8 rounded-3xl">

              <div className="text-center mb-8">
                <div className="text-4xl mb-4">🌱</div>
                <h1 className="text-2xl font-serif text-[#F5F0E8] mb-2">Tell us about your farm</h1>
                <p className="text-[#F5F0E8]/40 text-sm">Optional — complete this later in your profile.</p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  {[true, false].map(val => (
                    <button key={String(val)}
                      onClick={() => setForm(f => ({ ...f, hasFarm: val }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                        form.hasFarm === val
                          ? "bg-[#C9A84C] text-[#0A0A0A]"
                          : "bg-[#111] border border-[#1E1E1E] text-[#F5F0E8]/40"
                      }`}>
                      {val ? "Yes, I have a farm" : "No farm yet"}
                    </button>
                  ))}
                </div>

                {form.hasFarm && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3">
                    <input className={inputClass} placeholder="Farm name"
                      value={form.farmName}
                      onChange={e => setForm(f => ({ ...f, farmName: e.target.value }))} />
                    <input className={inputClass} placeholder="Farm size (acres)" type="number"
                      value={form.acres}
                      onChange={e => setForm(f => ({ ...f, acres: e.target.value }))} />
                    <select className={selectClass} value={form.currentCrop}
                      onChange={e => setForm(f => ({ ...f, currentCrop: e.target.value }))}>
                      <option value="">Current crop (optional)</option>
                      {KARNATAKA_CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className={selectClass} value={form.soilType}
                      onChange={e => setForm(f => ({ ...f, soilType: e.target.value }))}>
                      <option value="">Soil type (optional)</option>
                      {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </motion.div>
                )}

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button onClick={() => submitFinal(false)} disabled={loading}
                  className="w-full py-3.5 bg-[#C9A84C] text-[#0A0A0A] font-bold tracking-wide rounded-xl hover:bg-[#D4B86A] hover:-translate-y-0.5 shadow-[0_0_15px_rgba(201,168,76,0.3)] hover:shadow-[0_0_25px_rgba(201,168,76,0.5)] transition-all disabled:opacity-50 disabled:hover:translate-y-0">
                  {loading ? "Saving..." : "Complete setup →"}
                </button>
                <button onClick={() => submitFinal(true)} disabled={loading}
                  className="w-full py-3 text-[#F5F0E8]/40 text-sm font-medium hover:text-[#F5F0E8] transition-colors">
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — Done */}
          {step === 3 && (
            <motion.div key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass-panel p-10 rounded-3xl text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-6xl mb-6">
                🎉
              </motion.div>
              <h1 className="text-2xl font-serif text-[#F5F0E8] mb-2">
                Welcome, {form.fullName.split(" ")[0]}!
              </h1>
              <p className="text-[#C9A84C] text-lg mb-2">ಅಗ್ರಿ ಕಂಪಾಸ್ಗೆ ಸ್ವಾಗತ!</p>
              <p className="text-[#F5F0E8]/40 text-sm mb-8">
                Your account is ready. Start exploring your farm intelligence platform.
              </p>
              <button onClick={() => navigate("/dashboard")}
                className="w-full py-3.5 bg-[#C9A84C] text-[#0A0A0A] font-semibold rounded-xl hover:bg-[#D4B86A] transition-colors">
                Go to dashboard →
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
