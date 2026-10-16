import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, CheckCircle2, Database, AlertCircle } from "lucide-react";
import { usePdfDownload, useDatasetDownload } from "../../hooks/useCropGuides";
import type { CropDetail } from "../../types/cropGuide";

interface PdfDownloadButtonProps {
  slug: string;
  cropName: string;
  crop?: CropDetail | null;
  className?: string;
  showDatasetButton?: boolean;
}

export const PdfDownloadButton = ({
  slug,
  cropName,
  crop = null,
  className = "",
  showDatasetButton = true,
}: PdfDownloadButtonProps) => {
  const { downloadPdf, downloading: pdfDownloading, error: pdfError } = usePdfDownload();
  const { downloadDataset, downloading: jsonDownloading, error: jsonError } = useDatasetDownload();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handlePdfClick = () => {
    downloadPdf(slug, cropName);
    setDownloadSuccess("Cultivation Guide PDF Download Started");
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleJsonClick = () => {
    if (crop) {
      downloadDataset(crop);
      setDownloadSuccess("Crop Agronomic Dataset (JSON) Exported");
      setTimeout(() => setDownloadSuccess(null), 4000);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        {/* Primary PDF Download Button */}
        <motion.button
          onClick={handlePdfClick}
          disabled={pdfDownloading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest
                      transition-all shadow-lg ${
                        pdfDownloading
                          ? "opacity-60 cursor-not-allowed bg-gold-400 text-earth-main"
                          : "cursor-pointer bg-gradient-to-r from-[#D4AF37] to-[#B8972E] text-[#0A0900] hover:brightness-110 hover:shadow-gold-glow"
                      }`}
        >
          {pdfDownloading ? (
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

        {/* Secondary Dataset (JSON) Download Button */}
        {showDatasetButton && crop && (
          <motion.button
            onClick={handleJsonClick}
            disabled={jsonDownloading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest
                        border border-[#C9A84C]/30 bg-[#191610]/80 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all ${
                          jsonDownloading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                        }`}
          >
            {jsonDownloading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>Download Dataset</span>
                <span className="text-[9px] font-mono opacity-70 bg-[#C9A84C]/10 px-1.5 py-0.5 rounded">JSON</span>
              </>
            )}
          </motion.button>
        )}
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
      {(pdfError || jsonError) && (
        <div className="flex items-center gap-2 text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg w-fit">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{pdfError || jsonError}</span>
        </div>
      )}
    </div>
  );
};
