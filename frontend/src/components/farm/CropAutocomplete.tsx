import { useState, useEffect, useRef } from 'react';
import { apiGet } from '@/lib/httpClient';
import { Input } from '@/components/ui/input';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { Crop } from '@/components/ui/crop-card-premium';
import { Loader2 } from 'lucide-react';

interface CropAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

export function CropAutocomplete({ value, onChange }: CropAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Crop[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const fetchCrops = async () => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }
      
      // Fetch crops based on query

      setIsLoading(true);
      try {
        const data = await apiGet(`/api/crops/search?query=${encodeURIComponent(query)}`);
        setResults(data || []);
      } catch (error) {
        console.error('Failed to search crops:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchCrops();
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [query, value]);

  const handleSelect = (cropName: string) => {
    setQuery(cropName);
    onChange(cropName);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value); // allow custom entries as well
    setIsOpen(true);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search crop (e.g. Rice, Tomato)..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (query.length >= 2) setIsOpen(true) }}
          className="bg-earth-main border-earth-border focus-visible:ring-gold-400 text-gold-100 rounded-xl h-11 pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gold-400" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-earth-elevated border border-earth-border rounded-xl shadow-premium overflow-hidden max-h-60 overflow-y-auto">
          {results.map((crop) => (
            <div
              key={crop.id}
              className="px-4 py-3 cursor-pointer hover:bg-gold-400/10 text-gold-100 transition-colors flex flex-col"
              onClick={() => handleSelect(crop.name)}
            >
              <span className="font-bold text-sm uppercase tracking-tight">{crop.name}</span>
              <span className="text-[10px] text-gold-100/50 uppercase tracking-widest">{crop.scientificName || crop.season}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
