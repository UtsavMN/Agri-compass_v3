import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/httpClient';
import { useUser } from '@/store';
import { LISTING_CATEGORIES } from '@/data/marketplaceCategories';
import { 
  Plus, 
  MapPin, 
  Phone, 
  X, 
  ExternalLink, 
  Bookmark, 
  ChevronRight, 
  ChevronLeft, 
  Trash2,
  CheckCircle,
  Search,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CardShimmer } from '@/components/ui/loading-shimmer';
import { EmptyState } from '@/components/ui/EmptyState';

export interface Listing {
  id: number;
  title: string;
  description: string;
  category: string;
  listingType: 'buy' | 'sell';
  price: number;
  priceUnit: string;
  location: string;
  imageUrl: string;
  userId: string;
  sellerName: string;
  sellerVerified: boolean;
  createdAt: string;
}

export function Marketplace() {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [listingType, setListingType] = useState<'buy' | 'sell' | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, [activeCategory, listingType, searchTerm]);

  const loadListings = async () => {
    try {
      setLoading(true);
      let url = '/api/marketplace?page=0&size=50';
      if (activeCategory !== 'all') {
        url += `&category=${activeCategory}`;
      }
      if (listingType !== 'all') {
        url += `&type=${listingType}`;
      }
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const data = await apiGet(url);
      // Backend returns a Page object: data.content
      setListings(data.content || []);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast({
        title: 'Error loading listings',
        description: 'Failed to fetch listings from the marketplace.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (id: number) => {
    try {
      await apiDelete(`/api/marketplace/${id}`);
      toast({
        title: 'Listing deleted',
        description: 'Your marketplace listing was removed successfully.',
      });
      loadListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Delete failed',
        description: 'Could not remove listing. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const timeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-serif font-black text-[#f0ece0] tracking-tight">Farmer Marketplace</h2>
          <p className="text-[13px] text-[#6a6050] mt-0.5 font-medium">
            Buy and sell crops, land, equipment, and farm inputs directly with local growers.
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#c49a2a] hover:bg-[#d4aa3a] text-[#0f0f0b] font-bold px-5 py-3 rounded-xl text-[12px] uppercase tracking-wider transition-colors shadow-lg shrink-0">
          <Plus size={16} strokeWidth={2.5} />
          Post a listing
        </button>
      </div>

      {/* Filters block */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 items-center">
        {/* Buy / Sell / All toggle */}
        <div className="flex gap-2 bg-earth-elevated/20 p-1 rounded-xl border border-earth-border/40 w-fit shrink-0">
          {(['all', 'buy', 'sell'] as const).map(type => (
            <button key={type}
              onClick={() => setListingType(type)}
              className={cn(
                'px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all',
                listingType === type
                  ? 'bg-[#c49a2a] text-[#0f0f0b] shadow-inner'
                  : 'text-[#a09880] hover:text-[#f0ece0]'
              )}>
              {type === 'all' ? 'All listings' : type === 'buy' ? '🔍 Looking to buy' : '📢 For sale'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6a6050]" />
          <input
            placeholder="Search crop, equipment, land, keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 bg-earth-elevated/20 border border-earth-border/40 text-gold-100 focus:border-[#c49a2a] h-12 rounded-xl text-xs font-bold uppercase tracking-widest placeholder:text-[#6a6050] outline-none"
          />
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn('px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border shrink-0 transition-all',
            activeCategory === 'all'
              ? 'bg-[#c49a2a] text-[#0f0f0b] border-[#c49a2a]'
              : 'border-[rgba(255,255,255,0.08)] text-[#a09880] bg-earth-elevated/20 hover:border-white/10'
          )}>
          All categories
        </button>
        {LISTING_CATEGORIES.map(cat => (
          <button key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border shrink-0 transition-all',
              activeCategory === cat.id
                ? 'border-[rgba(196,154,42,0.4)] text-[#c49a2a] bg-[rgba(196,154,42,0.06)]'
                : 'border-[rgba(255,255,255,0.08)] text-[#a09880] bg-earth-elevated/20 hover:border-white/10'
            )}>
            <span className="text-sm">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Listings grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardShimmer className="h-64" />
          <CardShimmer className="h-64" />
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map(listing => (
            <div key={listing.id} className="card-base card-hover overflow-hidden flex flex-col justify-between transition-all">
              <div>
                {/* Image */}
                {listing.imageUrl && (
                  <div className="h-44 overflow-hidden relative border-b border-[rgba(255,255,255,0.05)]">
                    <img src={listing.imageUrl} alt={listing.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={e => e.currentTarget.style.display = 'none'}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-[10px] text-[#c49a2a] bg-[rgba(196,154,42,0.12)] border border-[rgba(196,154,42,0.2)] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-md">
                        {listing.category}
                      </span>
                      <span className={cn(
                        'text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-md border',
                        listing.listingType === 'sell'
                          ? 'bg-[rgba(74,154,106,0.12)] text-[#4a9a6a] border-[rgba(74,154,106,0.2)]'
                          : 'bg-[rgba(74,122,196,0.12)] text-[#4a7ac4] border-[rgba(74,122,196,0.2)]'
                      )}>
                        {listing.listingType === 'sell' ? '📢 For Sale' : '🔍 Wanted'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5">
                  {!listing.imageUrl && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px] text-[#c49a2a] bg-[rgba(196,154,42,0.1)] px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-[rgba(196,154,42,0.15)]">
                        {listing.category}
                      </span>
                      <span className={cn(
                        'text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border',
                        listing.listingType === 'sell'
                          ? 'bg-[rgba(74,154,106,0.12)] text-[#4a9a6a] border-[rgba(74,154,106,0.2)]'
                          : 'bg-[rgba(74,122,196,0.12)] text-[#4a7ac4] border-[rgba(74,122,196,0.2)]'
                      )}>
                        {listing.listingType === 'sell' ? '📢 For Sale' : '🔍 Wanted'}
                      </span>
                    </div>
                  )}

                  <h3 className="font-bold text-[16px] text-[#f0ece0] mb-2 leading-tight">{listing.title}</h3>
                  <p className="text-[12px] text-[#a09880] mb-4 leading-relaxed line-clamp-3 font-medium">{listing.description}</p>
                </div>
              </div>

              <div className="px-5 pb-5">
                {/* Key details */}
                <div className="flex items-center justify-between mb-4 p-3 bg-white/3 rounded-xl border border-white/5">
                  <div>
                    <p className="text-[18px] font-black text-[#c49a2a] leading-none mb-1">
                      {formatCurrency(listing.price)}
                    </p>
                    <p className="text-[10px] text-[#6a6050] font-bold uppercase tracking-wider">{listing.priceUnit}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-[11px] text-[#a09880] font-bold uppercase">
                      <MapPin size={11} className="text-[#c49a2a]" />
                      {listing.location}
                    </div>
                    <p className="text-[10px] text-[#6a6050] mt-0.5 font-semibold">{timeAgo(listing.createdAt)}</p>
                  </div>
                </div>

                {/* Seller info */}
                <div className="flex items-center gap-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <div className="w-8 h-8 rounded-full bg-[rgba(196,154,42,0.15)] border border-[rgba(196,154,42,0.2)] flex items-center justify-center text-[12px] font-black text-[#c49a2a]">
                    {(listing.sellerName || 'F')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-[#f0ece0] truncate">{listing.sellerName || 'Farmer Partner'}</p>
                    {listing.sellerVerified && (
                      <p className="text-[10px] text-[#4a9a6a] font-bold flex items-center gap-1">
                        <CheckCircle size={10} className="fill-[#4a9a6a]/10" /> Verified Seller
                      </p>
                    )}
                  </div>

                  {user?.id === listing.userId ? (
                    <button onClick={() => handleDeleteListing(listing.id)}
                      className="flex items-center justify-center p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete listing">
                      <Trash2 size={13} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        toast({
                          title: 'Contact Details',
                          description: `Reach out to the seller at: contact.agri@agricompass.com`,
                        });
                      }}
                      className="flex items-center gap-1 bg-[#c49a2a] hover:bg-[#d4aa3a] text-[#0f0f0b] text-[11px] font-extrabold uppercase px-3 py-2 rounded-lg tracking-wider transition-all shadow"
                    >
                      <Phone size={11} />
                      Contact
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingCart}
          title="No marketplace listings found"
          description="Be the first to list agricultural produce, land, or machinery on the marketplace!"
          action={{
            label: "Post a listing",
            onClick: () => setShowCreateModal(true)
          }}
        />
      )}

      {/* Create listing modal */}
      {showCreateModal && (
        <CreateListingModal onClose={() => setShowCreateModal(false)} onCreated={loadListings} />
      )}
    </div>
  );
}

// Create listing modal sub-component
function CreateListingModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { toast } = useToast();
  const { user, profile } = useUser();
  const [step, setStep] = useState(1);
  const [listingType, setListingType] = useState<'sell' | 'buy'>('sell');
  const [selectedCategory, setSelectedCategory] = useState<typeof LISTING_CATEGORIES[0] | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('Total Price');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Custom Dynamic Fields
  const [subType, setSubType] = useState('');
  const [customField1, setCustomField1] = useState('');
  const [customField2, setCustomField2] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.location || profile?.district) {
      setLocation(profile.location || profile.district || '');
    }
  }, [profile]);

  useEffect(() => {
    if (selectedCategory) {
      setSubType(selectedCategory.subTypes[0]);
      setPriceUnit(selectedCategory.priceLabel);
    }
  }, [selectedCategory]);

  const handleSubmit = async () => {
    if (!title.trim() || !price || !location.trim()) {
      toast({
        title: 'Validation failed',
        description: 'Please fill in all the required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Build detailed description utilizing custom fields
      let finalDescription = description.trim();
      if (selectedCategory) {
        const specs: string[] = [];
        specs.push(`Type: ${subType}`);
        if (customField1) specs.push(`${selectedCategory.requiredFields[0].replace('_', ' ')}: ${customField1}`);
        if (customField2) specs.push(`${selectedCategory.requiredFields[1].replace('_', ' ')}: ${customField2}`);
        finalDescription = `[${specs.join(' | ')}] \n\n${finalDescription}`;
      }

      const payload = {
        title: title.trim(),
        description: finalDescription,
        category: selectedCategory?.label || 'General',
        listingType,
        price: parseFloat(price),
        priceUnit,
        location: location.trim(),
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?fit=crop&w=400&h=300&q=60'
      };

      await apiPost('/api/marketplace', payload);
      toast({
        title: 'Listing posted!',
        description: 'Your listing is now live on the farmer marketplace.',
      });
      onCreated();
      onClose();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Submission failed',
        description: 'Failed to create listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6 select-none animate-fade-in">
      <div className="bg-[#1a1a14] border border-[rgba(255,255,255,0.1)] rounded-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.07)]">
          <div>
            <h2 className="font-serif font-black text-[18px] text-[#f0ece0] tracking-tight uppercase">Post a Listing</h2>
            <p className="text-[11px] text-[#6a6050] font-bold uppercase tracking-wider mt-0.5">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-[#6a6050] hover:text-[#a09880] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-6">
              {/* Sell or Buy */}
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setListingType('sell')}
                  className={cn('p-5 rounded-xl border text-left transition-all',
                    listingType === 'sell'
                      ? 'border-[#c49a2a] bg-[rgba(196,154,42,0.05)] shadow-gold-glow'
                      : 'border-[rgba(255,255,255,0.08)] bg-white/3'
                  )}>
                  <p className="text-[24px] mb-2">📢</p>
                  <p className="font-bold text-[14px] text-[#f0ece0] uppercase tracking-wider">I want to sell</p>
                  <p className="text-[11px] text-[#6a6050] mt-1">List your crops, land, or machine</p>
                </button>
                <button onClick={() => setListingType('buy')}
                  className={cn('p-5 rounded-xl border text-left transition-all',
                    listingType === 'buy'
                      ? 'border-[#c49a2a] bg-[rgba(196,154,42,0.05)] shadow-gold-glow'
                      : 'border-[rgba(255,255,255,0.08)] bg-white/3'
                  )}>
                  <p className="text-[24px] mb-2">🔍</p>
                  <p className="font-bold text-[14px] text-[#f0ece0] uppercase tracking-wider">I want to buy</p>
                  <p className="text-[11px] text-[#6a6050] mt-1">Post item request to growers</p>
                </button>
              </div>

              {/* Category grid */}
              <div>
                <p className="text-[11px] text-[#6a6050] uppercase tracking-widest font-bold mb-3">Select Category</p>
                <div className="grid grid-cols-2 gap-3">
                  {LISTING_CATEGORIES.map(cat => (
                    <button key={cat.id}
                      onClick={() => { setSelectedCategory(cat); setStep(2); }}
                      className="flex items-center gap-3 p-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-white/3 hover:border-[#c49a2a] hover:bg-[rgba(196,154,42,0.03)] transition-all text-left">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <p className="text-[13px] font-bold text-[#f0ece0] uppercase tracking-wide leading-tight">{cat.label}</p>
                        <p className="text-[10px] text-[#6a6050] font-semibold mt-0.5">{cat.subTypes.length} types</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && selectedCategory && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] bg-[rgba(196,154,42,0.1)] border border-[rgba(196,154,42,0.2)] text-[#c49a2a] px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                  Category: {selectedCategory.label}
                </span>
              </div>

              {/* Sub Type Select */}
              <div className="space-y-1">
                <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Listing Subtype</label>
                <select
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                  className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-10 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                >
                  {selectedCategory.subTypes.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Required/Custom Fields */}
              <div className="grid grid-cols-2 gap-4">
                {selectedCategory.requiredFields[0] && (
                  <div className="space-y-1">
                    <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">
                      {selectedCategory.requiredFields[0].replace('_', ' ')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5 acres, Urea, Tractor model"
                      value={customField1}
                      onChange={(e) => setCustomField1(e.target.value)}
                      className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-10 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                    />
                  </div>
                )}
                {selectedCategory.requiredFields[1] && (
                  <div className="space-y-1">
                    <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">
                      {selectedCategory.requiredFields[1].replace('_', ' ')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Borewell, Grade A, Year"
                      value={customField2}
                      onChange={(e) => setCustomField2(e.target.value)}
                      className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-10 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Core Details */}
              <div className="space-y-1">
                <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Listing Title</label>
                <input
                  type="text"
                  placeholder="e.g. High Quality Sona Masuri Rice Seedlings"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-12 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-10 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Unit / Frequency</label>
                  <input
                    type="text"
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-10 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Description Details</label>
                <textarea
                  placeholder="Describe your produce, equipment or services..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 p-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Location / Taluk</label>
                  <input
                    type="text"
                    placeholder="Mandya, Ballari, etc."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-10 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Photo URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="Paste crop/equipment image link"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-10 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-[12px] text-[#a09880] font-bold uppercase tracking-widest text-center mb-4">Confirm Listing Details</p>
                <div className="bg-[#1e1e16] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[11px] text-[#6a6050] uppercase font-bold tracking-wider">Type</span>
                    <span className="text-[11px] text-[#c49a2a] bg-[rgba(196,154,42,0.1)] px-2 py-0.5 rounded font-extrabold uppercase">
                      {listingType === 'sell' ? 'For Sale' : 'Wanted'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[11px] text-[#6a6050] uppercase font-bold tracking-wider">Category</span>
                    <span className="text-xs font-bold text-[#f0ece0]">{selectedCategory?.label}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[11px] text-[#6a6050] uppercase font-bold tracking-wider">Title</span>
                    <span className="text-xs font-bold text-[#f0ece0] truncate max-w-[200px]">{title}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[11px] text-[#6a6050] uppercase font-bold tracking-wider">Price</span>
                    <span className="text-xs font-black text-[#c49a2a]">{formatCurrency(parseFloat(price) || 0)} ({priceUnit})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[#6a6050] uppercase font-bold tracking-wider">Location</span>
                    <span className="text-xs font-bold text-[#f0ece0]">{location}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex gap-3 items-start text-xs text-yellow-400">
                <CheckCircle size={15} className="mt-0.5 shrink-0 text-yellow-500" />
                <div>
                  <span className="font-bold uppercase tracking-wider">Safety Policy:</span> Double check descriptions. Misrepresenting crops or machinery will result in account suspension.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(255,255,255,0.07)] bg-earth-card">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] text-[#a09880] hover:text-[#f0ece0] px-4 py-2.5 rounded-lg text-[11px] uppercase tracking-wider font-bold transition-all">
              <ChevronLeft size={13} />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button onClick={() => {
              if (step === 2 && (!title.trim() || !price || !location.trim())) {
                toast({
                  title: 'Validation failed',
                  description: 'Title, price and location are required fields.',
                  variant: 'destructive'
                });
                return;
              }
              setStep(step + 1);
            }}
              className="flex items-center gap-1.5 bg-[#c49a2a] hover:bg-[#d4aa3a] text-[#0f0f0b] px-5 py-2.5 rounded-lg text-[11px] uppercase tracking-wider font-extrabold transition-all shadow shrink-0">
              Next
              <ChevronRight size={13} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="flex items-center gap-1.5 bg-[#c49a2a] hover:bg-[#d4aa3a] text-[#0f0f0b] px-6 py-3 rounded-lg text-[11px] uppercase tracking-wider font-extrabold transition-all shadow shrink-0">
              {isSubmitting ? 'Posting...' : 'Confirm & Post'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
