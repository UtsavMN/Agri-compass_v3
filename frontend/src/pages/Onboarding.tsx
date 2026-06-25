import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiPost } from '@/lib/httpClient';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';

const DISTRICTS = [
  "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
  "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
  "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri",
  "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur",
  "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"
];

export default function Onboarding() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    district: '',
    profilePictureUrl: user?.imageUrl || '',
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = await getToken();
      await apiPost('/api/profile/setup', {
        full_name: formData.fullName,
        district: formData.district,
        profile_picture_url: formData.profilePictureUrl,
        username_handle: `user_${Date.now()}` // Default auto handle for now
      }, token);
      
      toast.success('Welcome to Agri Compass!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-2">
            <span>Step {step} of 3</span>
            <span>{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#1E1E1E] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#C9A84C]"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="bg-[#111111] border border-[#1E1E1E] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Name */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-black text-[#F5F0E8] mb-2">Welcome to Agri Compass</h2>
                  <p className="text-[#F5F0E8]/60 text-sm">Let's start with your name.</p>
                </div>
                
                <div className="space-y-4">
                  <Input 
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Your Full Name"
                    className="bg-[#0A0A0A] border-[#1E1E1E] text-[#F5F0E8] focus:border-[#C9A84C] text-lg py-6"
                  />
                  <Button 
                    onClick={nextStep} 
                    disabled={!formData.fullName.trim()}
                    className="w-full bg-[#C9A84C] hover:bg-[#D4B86A] text-[#0A0A0A] font-bold py-6 text-lg"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: District */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-black text-[#F5F0E8] mb-2">Where is your farm?</h2>
                  <p className="text-[#F5F0E8]/60 text-sm">Select your district in Karnataka.</p>
                </div>

                <div className="space-y-4">
                  <Select onValueChange={v => setFormData({ ...formData, district: v })} value={formData.district}>
                    <SelectTrigger className="w-full bg-[#0A0A0A] border-[#1E1E1E] text-[#F5F0E8] py-6 text-lg">
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#1E1E1E] max-h-60">
                      {DISTRICTS.map(d => (
                        <SelectItem key={d} value={d} className="text-[#F5F0E8] focus:bg-[#C9A84C]/20 focus:text-[#C9A84C]">
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={prevStep} className="w-1/3 border-[#1E1E1E] text-[#F5F0E8] hover:bg-[#1E1E1E] py-6">Back</Button>
                    <Button onClick={nextStep} disabled={!formData.district} className="w-2/3 bg-[#C9A84C] hover:bg-[#D4B86A] text-[#0A0A0A] font-bold py-6">Continue</Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Profile Pic / Done */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-black text-[#F5F0E8] mb-2">Almost Done!</h2>
                  <p className="text-[#F5F0E8]/60 text-sm">Add a profile picture so other farmers can recognize you.</p>
                </div>

                <div className="flex justify-center my-8">
                  <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-[#C9A84C]/50 flex items-center justify-center bg-[#0A0A0A] overflow-hidden group cursor-pointer hover:border-[#C9A84C] transition-colors">
                    {formData.profilePictureUrl ? (
                      <img src={formData.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-[#C9A84C]/50 group-hover:text-[#C9A84C] transition-colors" />
                    )}
                    {/* Cloudinary file upload logic */}
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      title="Upload" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setIsSubmitting(true);
                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          // We use the exact preset name created by the user
                          formData.append('upload_preset', 'Agri compass'); 

                          const res = await fetch('https://api.cloudinary.com/v1_1/dmudy4pf1/image/upload', {
                            method: 'POST',
                            body: formData
                          });

                          if (!res.ok) {
                            throw new Error('Upload failed');
                          }

                          const data = await res.json();
                          setFormData(prev => ({ ...prev, profilePictureUrl: data.secure_url }));
                          toast.success('Profile picture uploaded!');
                        } catch (err) {
                          console.error(err);
                          toast.error('Upload failed. Check your Cloudinary preset settings.');
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={prevStep} className="w-1/3 border-[#1E1E1E] text-[#F5F0E8] hover:bg-[#1E1E1E] py-6">Back</Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="w-2/3 bg-[#C9A84C] hover:bg-[#D4B86A] text-[#0A0A0A] font-bold py-6"
                  >
                    {isSubmitting ? 'Saving...' : 'Finish Setup'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
