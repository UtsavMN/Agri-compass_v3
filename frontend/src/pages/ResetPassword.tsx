import { useState, FormEvent } from 'react';
import { Lock, Eye, EyeOff, Sprout } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { apiPost } from '@/lib/httpClient';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const isValidPassword = (pwd: string) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[^A-Za-z0-9]/.test(pwd)
    );
  };

  const isFormValid = isValidPassword(password) && password === confirmPassword && token && email;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    try {
      await apiPost('/api/auth/reset-password', {
        token,
        email,
        newPassword: password
      });
      toast({ title: 'Password Reset', description: 'Your password was successfully reset. You can now login.' });
      navigate('/auth');
    } catch (error: any) {
      toast({ title: 'Reset Failed', description: error.message || 'Invalid or expired token', variant: 'destructive' });
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
         <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center">
            <h2 className="text-xl text-red-600 font-semibold mb-4">Invalid Reset Link</h2>
            <p className="text-gold-100/70 mb-6">This password reset link is invalid or missing required parameters.</p>
            <button onClick={() => navigate('/auth')} className="bg-green-600 text-white px-6 py-2 rounded-lg">Go to Login</button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <Sprout className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>
          <p className="text-gold-100/70">Enter your new secure password</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-xl w-full">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 chars, containing uppercase, lowercase, numbers & special character.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-3 mt-6 px-4 rounded-lg text-white font-medium shadow-md transition-colors
                ${!isFormValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
