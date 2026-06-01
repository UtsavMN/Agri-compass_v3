import { useState, useEffect } from 'react';
import { Sprout, User, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser, MOCK_USERS } from '@/store';
import { Card } from '@/components/ui/card';

export default function Auth() {
  const { user, switchUser } = useUser();
  const navigate = useNavigate();

  // If already logged in (mock), redirect
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user) return null;


  return (
    <div className="min-h-screen bg-earth-main flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold-400/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gold-400/5 blur-[100px] rounded-full" />

      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gold-400/10 p-4 rounded-[2rem] border border-gold-400/20 shadow-premium group hover:scale-110 transition-all duration-500">
              <Sprout className="h-10 w-10 text-gold-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-gold-100 tracking-tighter mb-2">
            Agri Compass
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-100/30">
            Ecosystem Optimization Engine
          </p>
        </div>

        <Card className="card-premium p-10 w-full border-none shadow-premium bg-earth-elevated/40 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-8 justify-center">
             <Shield size={14} className="text-gold-400" />
             <h2 className="text-xs font-black uppercase tracking-widest text-gold-100/60">Select Authority Account</h2>
          </div>
          
          <div className="space-y-4">
            {MOCK_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  switchUser?.(u.id);
                  navigate('/dashboard');
                }}
                className="w-full group flex items-center gap-4 p-5 rounded-2xl border border-earth-border bg-earth-main/50 hover:bg-gold-400/10 hover:border-gold-400/40 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400 group-hover:bg-gold-400 group-hover:text-earth-main transition-all duration-300">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="font-black text-gold-100 uppercase tracking-tight group-hover:text-gold-400 transition-colors">{u.name}</div>
                  <div className="text-[10px] font-bold text-gold-100/30 uppercase tracking-widest mt-0.5">{u.id}@agri-protocol.ai</div>
                </div>
                <Zap size={14} className="text-gold-100/10 group-hover:text-gold-400 transition-colors" />
              </button>
            ))}
          </div>

          <p className="text-[9px] font-bold text-gold-100/20 text-center mt-10 uppercase tracking-widest leading-relaxed">
            Authorized access only. By selecting an account you agree to the regional agricultural data protocols.
          </p>
        </Card>
      </div>
    </div>
  );
}
