import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { apiGet } from '@/lib/httpClient';
import { GOVERNMENT_SCHEMES } from '@/data/schemesData';
import { BANK_SCHEMES } from '@/data/bankSchemes';
import { 
  Flag, 
  MapPin, 
  Building2, 
  ExternalLink, 
  Bookmark, 
  CheckCircle, 
  FileText, 
  ChevronUp, 
  ChevronDown, 
  Search 
} from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/animations';
import { Input } from '@/components/ui/input';

const SCHEME_TABS = [
  { id: 'for-you',   label: 'For You',          count: 0,  icon: Bookmark },
  { id: 'central',   label: 'Central Schemes',  count: 9,  icon: Flag },
  { id: 'karnataka', label: 'Karnataka Schemes', count: 8,  icon: MapPin },
  { id: 'banks',     label: 'Bank Benefits',     count: 8,  icon: Building2 },
];

const SchemeAccordion = ({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!children) return null;
  return (
    <div className="border-b border-[rgba(255,255,255,0.06)] py-3 last:border-none">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[13px] font-semibold text-[#a09880] hover:text-[#f0ece0] transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {isOpen && (
        <div className="mt-2 pl-6 text-[12px] text-[#8a8270] leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

export const SchemeCard = ({ scheme }: { scheme: typeof GOVERNMENT_SCHEMES[0] }) => {
  const [bookmarked, setBookmarked] = useState(false);
  return (
    <div className="card-base card-hover p-6 group flex flex-col justify-between h-full transition-all">
      <div>
        {/* Top row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <h3 className="font-bold text-[17px] text-[#f0ece0]">{scheme.name}</h3>
              {scheme.subsidyPercent && (
                <span className="bg-[rgba(74,154,106,0.15)] border border-[rgba(74,154,106,0.3)] text-[#4a9a6a] text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                  {scheme.subsidyPercent}% subsidy
                </span>
              )}
            </div>
            <p className="text-[12px] text-[#6a6050] font-medium">{scheme.fullName}</p>
          </div>

          {/* Deadline badge */}
          {scheme.deadline && (
            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] text-[#6a6050] uppercase tracking-wider font-bold">Deadline</p>
              <p className="text-[13px] font-semibold text-[#c45a4a]">{scheme.deadline}</p>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          <span className="bg-[rgba(196,154,42,0.1)] border border-[rgba(196,154,42,0.2)] text-[#c49a2a] text-[11px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {scheme.category}
          </span>
          <span className="bg-white/5 border border-white/8 text-[#a09880] text-[11px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {scheme.level}
          </span>
        </div>

        {/* Benefit highlight */}
        <div className="bg-[rgba(74,154,106,0.08)] border border-[rgba(74,154,106,0.15)] rounded-lg px-4 py-3 mb-4">
          <p className="text-[12px] text-[#6a6050] mb-0.5 font-bold uppercase tracking-wider">Benefit</p>
          <p className="text-[13px] text-[#f0ece0] leading-normal font-medium">{scheme.benefit}</p>
        </div>

        {/* Expandable sections */}
        <SchemeAccordion label="Eligibility" icon={<CheckCircle size={13} className="text-[#4a9a6a]" />}>
          {scheme.eligibility}
        </SchemeAccordion>
        <SchemeAccordion label="How to apply" icon={<FileText size={13} className="text-[#c49a2a]" />}>
          {scheme.howToApply}
        </SchemeAccordion>
      </div>

      {/* CTA */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
        <a href={scheme.applyUrl} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#c49a2a] hover:bg-[#d4aa3a] text-[#0f0f0b] font-bold text-[13px] py-2.5 rounded-lg transition-colors uppercase tracking-wider">
          Apply Now
          <ExternalLink size={13} />
        </a>
        <button 
          onClick={() => setBookmarked(!bookmarked)}
          className={`border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] px-4 py-2.5 rounded-lg text-[13px] transition-colors ${bookmarked ? 'bg-[#c49a2a]/20 text-[#c49a2a] border-[#c49a2a]/30' : 'text-[#a09880] hover:text-[#f0ece0]'}`}
        >
          <Bookmark size={14} className={bookmarked ? 'fill-[#c49a2a]' : ''} />
        </button>
      </div>
    </div>
  );
};

export const BankCard = ({ scheme }: { scheme: typeof BANK_SCHEMES[0] }) => {
  return (
    <div className="card-base card-hover p-6 flex flex-col justify-between h-full transition-all">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[rgba(196,154,42,0.1)] flex items-center justify-center text-xl shadow-inner">
            {scheme.bankLogo}
          </div>
          <div>
            <p className="text-[11px] text-[#6a6050] font-bold uppercase tracking-wider">{scheme.bank}</p>
            <h3 className="font-bold text-[15px] text-[#f0ece0]">{scheme.schemeName}</h3>
          </div>
          <span className="ml-auto text-[10px] bg-[rgba(196,154,42,0.1)] border border-[rgba(196,154,42,0.2)] text-[#c49a2a] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            {scheme.tag}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="bg-white/3 rounded-lg p-3 border border-white/5">
            <p className="text-[10px] text-[#6a6050] mb-1 font-bold uppercase tracking-wider">Interest Rate</p>
            <p className="text-[13px] font-bold text-[#4a9a6a]">{scheme.interestRate}</p>
          </div>
          <div className="bg-white/3 rounded-lg p-3 border border-white/5">
            <p className="text-[10px] text-[#6a6050] mb-1 font-bold uppercase tracking-wider">Loan Amount</p>
            <p className="text-[12px] text-[#f0ece0] font-medium leading-tight">{scheme.loanAmount}</p>
          </div>
        </div>

        <div className="bg-white/3 p-3.5 rounded-lg border border-white/5 mb-4">
          <p className="text-[11px] text-[#6a6050] mb-1 font-bold uppercase tracking-wider">Documents Required</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {scheme.documents.map((doc, idx) => (
              <span key={idx} className="bg-white/5 border border-white/8 text-[#a09880] text-[9px] px-2 py-0.5 rounded">
                {doc}
              </span>
            ))}
          </div>
        </div>

        <p className="text-[12px] text-[#a09880] mb-4 leading-relaxed font-medium">{scheme.benefit}</p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[rgba(255,255,255,0.06)]">
        <span className="text-[11px] text-[#6a6050] font-bold uppercase tracking-wider">
          ⏱ {scheme.processingTime}
        </span>
        <a href={scheme.applyUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-[#c49a2a] hover:bg-[#d4aa3a] text-[#0f0f0b] font-bold text-[12px] px-4 py-2.5 rounded-lg transition-colors uppercase tracking-wider">
          Apply at Bank
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};

export default function GovSchemes() {
  const [activeTab, setActiveTab] = useState<'for-you' | 'central' | 'karnataka' | 'banks'>('for-you');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  interface SchemeFilters {
    category: 'all' | 'central' | 'karnataka' | 'bank';
    benefit: 'all' | 'financial' | 'subsidy' | 'insurance' | 'training' | 'infrastructure';
    caste: 'all' | 'general' | 'sc' | 'st' | 'obc' | 'minority';
    landSize: 'all' | 'small' | 'marginal' | 'large';
  }

  const [filters, setFilters] = useState<SchemeFilters>({
    category: 'all', benefit: 'all', caste: 'all', landSize: 'all'
  });

  useEffect(() => {
    if (user?.id) {
       setLoading(true);
       Promise.all([
         apiGet('/api/farms').catch(() => []),
         apiGet('/api/profile/me').catch(() => null)
       ]).then(([farmsData, profileData]) => {
         setFarms(farmsData || []);
         setUserProfile(profileData);
       }).finally(() => setLoading(false));
    }
  }, [user?.id]);

  const calculateEligibilityScore = (scheme: typeof GOVERNMENT_SCHEMES[0]) => {
     let score = 50; // base score
     const totalAcres = farms.reduce((sum, f) => sum + (f.acres || 0), 0);
     
     // Benefit those with small acreage for subsidy schemes
     if (scheme.subsidyPercent && totalAcres < 5) score += 30;
     else if (scheme.subsidyPercent && totalAcres < 10) score += 15;
     
     // Specific match
     const schemeText = `${scheme.name} ${scheme.benefit} ${scheme.category}`.toLowerCase();
     if (userProfile?.district && schemeText.includes(userProfile.district.toLowerCase())) score += 20;
     if (farms.some(f => f.currentCrop && schemeText.includes(f.currentCrop.toLowerCase()))) score += 25;
     
     return Math.min(100, score);
  };

  // Filter logic
  const filteredGovSchemes = useMemo(() => {
    return GOVERNMENT_SCHEMES.filter(scheme => {
      const isLevelMatch = activeTab === 'central' ? scheme.level === 'National' : scheme.level === 'Karnataka';
      const isSearchMatch = !searchTerm ||
        scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.benefit.toLowerCase().includes(searchTerm.toLowerCase());
      return isLevelMatch && isSearchMatch;
    });
  }, [activeTab, searchTerm]);

  const personalizedSchemes = useMemo(() => {
    return GOVERNMENT_SCHEMES
      .map(scheme => ({ ...scheme, score: calculateEligibilityScore(scheme) }))
      .sort((a, b) => b.score - a.score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
      .slice(0, 6);
  }, [farms, userProfile]);

  const filteredBankSchemes = BANK_SCHEMES.filter(scheme => {
    const isSearchMatch = !searchTerm ||
      scheme.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.benefit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.type.toLowerCase().includes(searchTerm.toLowerCase());
    return isSearchMatch;
  });

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto animate-fade-in">
      <div className="space-y-8 pb-12">
        {/* Header Band */}
        <ScrollReveal direction="down">
          <div className="relative overflow-hidden rounded-3xl border border-earth-border/40 bg-earth-elevated/10 mb-6">
            <div className="absolute inset-0 h-[200px]">
              <div className="w-full h-full bg-gradient-to-b from-[#1a1710] to-[#0f0f0b] opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0b]/30 to-[#0f0f0b]" />
            </div>

            <div className="relative z-10 px-8 pt-10 pb-6">
              <p className="text-[11px] text-[#c49a2a] uppercase tracking-widest mb-2 font-semibold">
                Financial Welfare & Infrastructure Support
              </p>
              <h1 className="font-serif text-4xl font-bold text-[#f0ece0] tracking-tight mb-2">
                Government Schemes & Subsidies
              </h1>
              <p className="text-[13px] text-[#a09880] max-w-2xl font-medium">
                Explore central and state schemes, subsidies, and banking credit benefits tailored for Karnataka farmers.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Tab & Search controls */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4 items-center mb-6">
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {SCHEME_TABS.map(tab => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setSearchTerm('');
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#c49a2a] text-[#0f0f0b] border-[#c49a2a] shadow-gold-glow'
                        : 'border-[rgba(255,255,255,0.08)] text-[#a09880] hover:border-[rgba(255,255,255,0.16)] hover:text-[#f0ece0] bg-earth-elevated/20'
                    }`}
                  >
                    <IconComponent size={13} />
                    <span>{tab.label}</span>
                    <span className={`text-[10px] ml-1.5 px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-black/10 text-black font-extrabold' : 'bg-white/5 text-[#6a6050]'
                    }`}>
                      {tab.id === 'banks' ? BANK_SCHEMES.length : (tab.id === 'central' ? 9 : (tab.id === 'for-you' ? '★' : 8))}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6a6050]" />
              <Input
                placeholder="Search schemes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-earth-elevated/20 border-earth-border text-gold-100 focus:border-[#c49a2a] h-12 rounded-xl text-xs font-bold uppercase tracking-widest placeholder:text-[#6a6050]"
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Filter bar */}
        <ScrollReveal delay={0.15}>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {/* Benefit type */}
            <select
              value={filters.benefit}
              onChange={e => setFilters(f => ({ ...f, benefit: e.target.value as any }))}
              className="bg-[#111] border border-[#1E1E1E] text-[#F5F0E8] text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-2.5 focus:border-[#c49a2a]/50 focus:outline-none flex-shrink-0"
            >
              <option value="all">All Benefits</option>
              <option value="financial">Financial Support</option>
              <option value="subsidy">Subsidy</option>
              <option value="insurance">Crop Insurance</option>
              <option value="training">Training & Extension</option>
              <option value="infrastructure">Infrastructure</option>
            </select>

            {/* Caste category */}
            <select
              value={filters.caste}
              onChange={e => setFilters(f => ({ ...f, caste: e.target.value as any }))}
              className="bg-[#111] border border-[#1E1E1E] text-[#F5F0E8] text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-2.5 focus:border-[#c49a2a]/50 focus:outline-none flex-shrink-0"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="sc">SC</option>
              <option value="st">ST</option>
              <option value="obc">OBC</option>
              <option value="minority">Minority</option>
            </select>

            {/* Land size */}
            <select
              value={filters.landSize}
              onChange={e => setFilters(f => ({ ...f, landSize: e.target.value as any }))}
              className="bg-[#111] border border-[#1E1E1E] text-[#F5F0E8] text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-2.5 focus:border-[#c49a2a]/50 focus:outline-none flex-shrink-0"
            >
              <option value="all">All Land Sizes</option>
              <option value="marginal">Marginal (under 2 acres)</option>
              <option value="small">Small (2–5 acres)</option>
              <option value="large">Large (5+ acres)</option>
            </select>

            {/* Reset button */}
            {Object.values(filters).some(v => v !== 'all') && (
              <button
                onClick={() => setFilters({ category: 'all', benefit: 'all', caste: 'all', landSize: 'all' })}
                className="text-[#c49a2a] text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 flex-shrink-0 hover:text-[#d4aa3a]"
              >
                Clear filters
              </button>
            )}
          </div>
        </ScrollReveal>

        {/* Content grid */}
        {loading ? (
           <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c49a2a]"></div>
           </div>
        ) : (
        <ScrollReveal delay={0.2}>
          {activeTab !== 'banks' ? (
            filteredGovSchemes.length > 0 ? (
              <StaggerContainer staggerDelay={0.05}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGovSchemes.map(scheme => (
                    <StaggerItem key={scheme.id}>
                      <SchemeCard scheme={scheme} />
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            ) : activeTab === 'for-you' ? (
               <StaggerContainer staggerDelay={0.05}>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {personalizedSchemes.map(scheme => (
                     <StaggerItem key={scheme.id}>
                       <div className="relative">
                          <div className="absolute -top-3 -right-3 bg-[#c49a2a] text-[#0f0f0b] font-black text-[10px] px-3 py-1 rounded-full z-10 shadow-lg border-2 border-[#1E1E1E]">
                             {scheme.score}% Match
                          </div>
                          <SchemeCard scheme={scheme} />
                       </div>
                     </StaggerItem>
                   ))}
                 </div>
               </StaggerContainer>
            ) : (
              <div className="text-center py-16 border border-dashed border-earth-border/40 rounded-2xl bg-earth-elevated/10">
                <Flag className="h-12 w-12 text-[#6a6050] mx-auto mb-3" />
                <h3 className="text-md font-bold text-[#f0ece0]">No Schemes Found</h3>
                <p className="text-xs text-[#6a6050] mt-1">Try modifying your search criteria.</p>
              </div>
            )
          ) : (
            filteredBankSchemes.length > 0 ? (
              <StaggerContainer staggerDelay={0.05}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBankSchemes.map(scheme => (
                    <StaggerItem key={scheme.id}>
                      <BankCard scheme={scheme} />
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            ) : (
              <div className="text-center py-16 border border-dashed border-earth-border/40 rounded-2xl bg-earth-elevated/10">
                <Building2 className="h-12 w-12 text-[#6a6050] mx-auto mb-3" />
                <h3 className="text-md font-bold text-[#f0ece0]">No Bank Benefits Found</h3>
                <p className="text-xs text-[#6a6050] mt-1">Try modifying your search criteria.</p>
              </div>
            )
          )}
        </ScrollReveal>
        )}
      </div>
    </div>
  );
}
