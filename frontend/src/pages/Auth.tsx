import { SignIn } from '@clerk/clerk-react';

export default function Auth() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#C9A84C]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#C9A84C]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        <SignIn 
          routing="hash"
          forceRedirectUrl="/onboarding-check"
          appearance={{
            elements: {
              card: "bg-[#111111] border border-[#1E1E1E] shadow-2xl rounded-2xl",
              headerTitle: "text-[#F5F0E8] font-black text-2xl",
              headerSubtitle: "text-[#F5F0E8]/60",
              socialButtonsBlockButton: "bg-[#0A0A0A] border-[#1E1E1E] text-[#F5F0E8] hover:bg-[#1E1E1E]",
              socialButtonsBlockButtonText: "text-[#F5F0E8] font-bold",
              dividerLine: "bg-[#1E1E1E]",
              dividerText: "text-[#F5F0E8]/40",
              formFieldLabel: "text-[#F5F0E8]/80 font-bold",
              formFieldInput: "bg-[#0A0A0A] border-[#1E1E1E] text-[#F5F0E8] focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]",
              formButtonPrimary: "bg-[#C9A84C] hover:bg-[#D4B86A] text-[#0A0A0A] font-bold",
              footerActionText: "text-[#F5F0E8]/60",
              footerActionLink: "text-[#C9A84C] hover:text-[#D4B86A]",
              identityPreviewText: "text-[#F5F0E8]",
              identityPreviewEditButton: "text-[#C9A84C] hover:text-[#D4B86A]",
            }
          }}
        />
      </div>
    </div>
  );
}
