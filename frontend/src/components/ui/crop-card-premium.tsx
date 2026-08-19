import React from 'react';
import { Card,    CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Leaf, Star, TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resolveCropImage } from '@/lib/cropImages';
import { formatCurrency } from '@/data/masterData';
import { CropCard } from '@/types/cropGuide';

export type Crop = CropCard;

interface CropCardPremiumProps {
  crop: Crop;
}

const SEASON_ACCENTS: Record<string, { border: string; bg: string }> = {
  Kharif: { border: 'rgba(74,154,106,0.3)', bg: 'rgba(74,154,106,0.1)' },
  Rabi: { border: 'rgba(74,122,196,0.3)', bg: 'rgba(74,122,196,0.1)' },
  Perennial: { border: 'rgba(196,154,42,0.3)', bg: 'rgba(196,154,42,0.1)' },
  Summer: { border: 'rgba(196,90,74,0.3)', bg: 'rgba(196,90,74,0.1)' },
};

export const CropCardPremium = React.memo(function CropCardPremium({ crop }: CropCardPremiumProps) {
  const navigate = useNavigate();
  const displayImage = resolveCropImage(crop);
  const profitScore = crop.aiScore ?? null;

  const seasonKey = crop.season || '';
  const accent = SEASON_ACCENTS[seasonKey] || { border: 'rgba(255,255,255,0.07)', bg: 'rgba(30,30,22,0.4)' };

  return (
    <Card
      onClick={() => navigate(`/crop/${crop.slug}`)}
      className="card-premium group overflow-hidden flex flex-col h-full backdrop-blur-md transition-all cursor-pointer border-earth-border hover:border-gold-400/40 shadow-xl min-h-[260px] sm:min-h-[380px] lg:min-h-[420px]"
      style={{
        borderColor: accent.border,
        backgroundColor: accent.bg,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '14px'
      }}
    >
      <div className="h-32 sm:h-48 overflow-hidden relative shrink-0">
        {displayImage ? (
          <img
            src={displayImage}
            alt={crop.nameEnglish}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-earth-elevated flex items-center justify-center">
            <Leaf className="h-12 w-12 text-gold-400/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-earth-main/90 via-earth-main/20 to-transparent" />

        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex gap-1 sm:gap-2 max-w-[70%] sm:max-w-[50%]">
          <Badge
            title={crop.season || 'Annual'}
            className="bg-gold-400 text-earth-main border-none font-black text-[8px] sm:text-[10px] px-1.5 py-0.5 sm:px-2 sm:py-0.5 truncate block"
          >
            {crop.season || 'Annual'}
          </Badge>
        </div>

        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          <div className="flex items-center gap-1 bg-earth-main/80 backdrop-blur-md px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-gold-400/30 shadow-lg">
            <Star className="h-2 w-2 sm:h-3 sm:w-3 text-gold-400 fill-gold-400" />
            {profitScore !== null ? (
              <span className="text-[8px] sm:text-[10px] font-black text-gold-100">{profitScore}%</span>
            ) : (
              <span className="text-[8px] sm:text-[10px] font-black text-gold-100/40">N/A</span>
            )}
          </div>
        </div>

        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
          <h3 className="text-sm sm:text-2xl font-black text-gold-100 tracking-tighter drop-shadow-lg truncate">{crop.nameEnglish}</h3>
          {crop.nameScientific && crop.nameScientific.toLowerCase() !== 'unknown' && (
            <p className="text-[8px] sm:text-xs italic text-gold-300/80 mt-0.5 font-medium drop-shadow truncate">{crop.nameScientific}</p>
          )}
        </div>
      </div>

      <CardContent className="p-3 sm:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-5">
        <div className="grid grid-cols-2 gap-1.5 sm:gap-4">
          <div className="flex flex-col justify-center sm:justify-start gap-0.5 sm:gap-1.5 p-1.5 sm:p-4 min-h-[3rem] sm:min-h-[4.5rem] bg-earth-elevated rounded-xl sm:rounded-2xl border border-earth-border group-hover:border-gold-400/20 transition-all">
            <div className="text-[7px] sm:text-[9px] uppercase tracking-widest text-gold-100/40 font-black truncate">Capital</div>
            <div className={`text-[9px] sm:text-sm ${crop.capitalMin ? 'font-bold text-gold-200' : 'font-medium text-gold-200/40'} truncate`}>
              {crop.capitalMin ? formatCurrency(crop.capitalMin) : 'N/A'}
            </div>
          </div>

          <div className="flex flex-col justify-center sm:justify-start gap-0.5 sm:gap-1.5 p-1.5 sm:p-4 min-h-[3rem] sm:min-h-[4.5rem] bg-earth-elevated rounded-xl sm:rounded-2xl border border-earth-border group-hover:border-gold-400/20 transition-all">
            <div className="text-[7px] sm:text-[9px] uppercase tracking-widest text-gold-100/40 font-black truncate">Returns</div>
            <div className={`text-[9px] sm:text-sm flex items-center gap-1 ${crop.returnsMax ? 'font-black text-gold-400' : 'font-medium text-gold-400/40'} truncate`}>
              {crop.returnsMax ? formatCurrency(crop.returnsMax) : 'N/A'}
              {!!crop.returnsMax && <TrendingUp className="h-3 w-3" />}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-0.5 sm:px-1">
          <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[10px] font-bold text-gold-100/60 uppercase tracking-tight">
            <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gold-400 shrink-0" /> <span className="truncate">{crop.durationDays ? `${crop.durationDays}d` : 'N/A'}</span>
          </div>
          {crop.difficulty ? (
            <Badge
              variant="outline"
              className={`text-[7px] sm:text-[9px] font-black uppercase px-1.5 py-0 sm:px-2 sm:py-0.5 shrink-0 ${crop.difficulty.toLowerCase() === 'easy'
                  ? 'border-green-500/30 text-green-400 bg-green-500/10'
                  : crop.difficulty.toLowerCase() === 'hard'
                    ? 'border-red-500/30 text-red-400 bg-red-500/10'
                    : 'border-gold-400/30 text-gold-300 bg-gold-400/10'
                }`}
            >
              {crop.difficulty}
            </Badge>
          ) : (
            <div className="text-[7px] sm:text-[10px] font-black text-gold-400/40 uppercase tracking-widest truncate max-w-[60%]">
              Detailed Analysis
            </div>
          )}
        </div>

        <Button
          className="w-full btn-gold h-8 sm:h-12 rounded-lg sm:rounded-xl transition-all group-hover:shadow-gold-glow mt-1 sm:mt-2 font-black uppercase tracking-widest text-[8px] sm:text-[10px]"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/crop/${crop.slug}`);
          }}
        >
          Explore<span className="hidden sm:inline">&nbsp;Intelligence</span>
        </Button>
      </CardContent>
    </Card>
  );
});


