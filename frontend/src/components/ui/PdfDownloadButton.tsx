import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { usePdfDownload } from "../../hooks/useCropGuides";

interface PdfDownloadButtonProps {
  slug: string;
  cropName: string;
  className?: string;
}

export const PdfDownloadButton = ({
  slug,
  cropName,
  className = "",
}: PdfDownloadButtonProps) => {
  const { downloadPdf, downloading, error } = usePdfDownload();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handlePdfClick = () => {
    downloadPdf(slug, cropName);
    setDownloadSuccess("Cultivation Guide Download Started");
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center">
        {/* Single Verified PDF Cultivation Guide Download Button */}
        <motion.button
          onClick={handlePdfClick}
          disabled={downloading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest
                      transition-all shadow-lg ${
                        downloading
                          ? "opacity-60 cursor-not-allowed bg-gold-400 text-earth-main"
                          : "cursor-pointer bg-gradient-to-r from-[#D4AF37] to-[#B8972E] text-[#0A0900] hover:brightness-110 hover:shadow-gold-glow"
                      }`}
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#0A0900]/30 border-t-[#0A0900] rounded-full animate-spin" />
              <span>Accessing Guide...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 text-[#0A0900]" />
              <span>Download Cultivation Guide</span>
              <span className="text-[9px] font-mono opacity-60 bg-[#0A0900]/10 px-1.5 py-0.5 rounded">PDF</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Success notification banner */}
      {downloadSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{downloadSuccess}</span>
        </motion.div>
      )}

      {/* Error notification banner */}
      {error && (
        <div className="flex items-center gap-2 text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg w-fit">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
