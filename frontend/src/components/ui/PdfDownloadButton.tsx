import { motion } from "framer-motion";
import { usePdfDownload } from "../../hooks/useCropGuides";

interface PdfDownloadButtonProps {
  slug: string;
  cropName: string;
  className?: string;
}

export const PdfDownloadButton = ({
  slug, cropName, className = ""
}: PdfDownloadButtonProps) => {
  const { downloadPdf, downloading, error } = usePdfDownload();

  return (
    <div>
      <motion.button
        onClick={() => downloadPdf(slug, cropName)}
        disabled={downloading}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm
                    transition-all ${downloading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                    ${className}`}
        style={{
          background: "#C9A84C",
          color: "#0A0900",
        }}
      >
        {downloading ? (
          <>
            <div className="w-4 h-4 border-2 border-[#0A0900]/30 border-t-[#0A0900] rounded-full animate-spin" />
            <span>Opening PDF...</span>
          </>
        ) : (
          <>
            <span>📄</span>
            <span>Download Cultivation Guide</span>
          </>
        )}
      </motion.button>

      {error && (
        <p className="text-red-400 text-xs mt-2 font-mono">{error}</p>
      )}
    </div>
  );
};
