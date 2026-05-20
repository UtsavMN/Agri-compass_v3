import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Leaf, Star, TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface Crop {
  id: string | number;
  name: string;
  season?: string;
  imageUrl?: string;
  image_url?: string;
  investmentPerAcre?: number;
  expectedReturns?: number;
  durationDays?: number;
  aiScore?: {
    profitabilityScore: number;
    climateSuitabilityScore: number;
  };
  scientificName?: string;
  difficultyLevel?: string;
}

interface CropCardPremiumProps {
  crop: Crop;
}

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove special characters
    .replace(/[\s/]+/g, '-')       // Replace spaces and slashes with a single dash
    .replace(/-+/g, '-')           // Replace multiple consecutive dashes with a single dash
    .replace(/^-+|-+$/g, '');      // Remove leading and trailing dashes
};

export function CropCardPremium({ crop }: CropCardPremiumProps) {
  const navigate = useNavigate();
  const displayImage = crop.imageUrl || crop.image_url;
  const profitScore = crop.aiScore?.profitabilityScore || 80;

  return (
    <Card
      className="card-premium group overflow-hidden border-earth-border/50 hover:border-gold-400/30 cursor-pointer h-full flex flex-col"
      onClick={() => navigate(`/crop/${slugify(crop.name)}`)}
    >
      <div className="h-48 overflow-hidden relative">
        {displayImage ? (
          <img
            src={displayImage}
            alt={crop.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-earth-elevated flex items-center justify-center">
            <Leaf className="h-12 w-12 text-gold-400/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-earth-main/90 via-earth-main/20 to-transparent" />
        
        <div className="absolute top-4 left-4 flex gap-2 max-w-[50%]">
          <Badge 
            title={crop.season || 'Annual'}
            className="bg-gold-400 text-earth-main border-none font-black text-[10px] px-2 py-0.5 truncate block"
          >
            {crop.season || 'Annual'}
          </Badge>
        </div>

        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 bg-earth-main/80 backdrop-blur-md px-2 py-1 rounded-lg border border-gold-400/30 shadow-lg">
            <Star className="h-3 w-3 text-gold-400 fill-gold-400" />
            <span className="text-[10px] font-black text-gold-100">{profitScore}% AI SCORE</span>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-black text-gold-100 tracking-tighter drop-shadow-lg">{crop.name}</h3>
          {crop.scientificName && (
            <p className="text-xs italic text-gold-300/80 mt-0.5 font-medium drop-shadow">{crop.scientificName}</p>
          )}
        </div>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 p-3 bg-earth-elevated rounded-2xl border border-earth-border group-hover:border-gold-400/20 transition-all">
            <div className="text-[9px] uppercase tracking-widest text-gold-100/40 font-black">Capital</div>
            <div className="text-sm font-bold text-gold-200">
              ₹{Math.round(crop.investmentPerAcre || 0).toLocaleString() || 'N/A'}
            </div>
          </div>

          <div className="flex flex-col gap-1 p-3 bg-earth-elevated rounded-2xl border border-earth-border group-hover:border-gold-400/20 transition-all">
            <div className="text-[9px] uppercase tracking-widest text-gold-100/40 font-black">Returns</div>
            <div className="text-sm font-black text-gold-400 flex items-center gap-1">
              ₹{Math.round(crop.expectedReturns || 0).toLocaleString() || 'N/A'}
              <TrendingUp className="h-3 w-3" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gold-100/60 uppercase tracking-tight">
            <Zap className="h-3 w-3 text-gold-400" /> {crop.durationDays || 'N/A'} Day Cycle
          </div>
          {crop.difficultyLevel ? (
            <Badge 
              variant="outline" 
              className={`text-[9px] font-black uppercase px-2 py-0.5 ${
                crop.difficultyLevel.toLowerCase() === 'easy' 
                  ? 'border-green-500/30 text-green-400 bg-green-500/10' 
                  : crop.difficultyLevel.toLowerCase() === 'hard'
                  ? 'border-red-500/30 text-red-400 bg-red-500/10'
                  : 'border-gold-400/30 text-gold-300 bg-gold-400/10'
              }`}
            >
              {crop.difficultyLevel}
            </Badge>
          ) : (
            <div className="text-[10px] font-black text-gold-400/40 uppercase tracking-widest">
              Detailed Analysis
            </div>
          )}
        </div>

        <Button 
          className="w-full btn-gold h-12 rounded-xl transition-all group-hover:shadow-gold-glow mt-2 font-black uppercase tracking-widest text-[10px]"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/crop/${slugify(crop.name)}`);
          }}
        >
          Explore Intelligence
        </Button>
      </CardContent>
    </Card>
  );
}
