import { useState, useEffect, useRef } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/httpClient';
import { UploadAPI } from '@/lib/api/upload';
import { useUser } from '@/store';
import { LISTING_CATEGORIES } from '@/data/marketplaceCategories';
import { 
  Plus, 
  MapPin, 
  Phone, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Trash2,
  CheckCircle,
  Search,
  ShoppingCart,
  MessageCircle,
  Upload,
  Check,
  CheckCircle2,
  Tag,
  Package,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Bell
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
  address?: string;
  contactPhone?: string;
  contact_phone?: string;
  quantity?: string;
  quantityUnit?: string;
  quantity_unit?: string;
  isNegotiable?: boolean;
  is_negotiable?: boolean;
  status?: string;
  imageUrl: string;
  userId: string;
  sellerName: string;
  sellerVerified: boolean;
  createdAt: string;
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const timeAgo = (dateStr: string) => {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return 'Recently';
  }
};

export function Marketplace() {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [listingType, setListingType] = useState<'buy' | 'sell' | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contactingListing, setContactingListing] = useState<Listing | null>(null);
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
      const rawList = data?.content || (Array.isArray(data) ? data : []);
      const mapped: Listing[] = rawList.map((item: any) => ({
        ...item,
        listingType: item.listingType || item.listing_type || 'sell',
        priceUnit: item.priceUnit || item.price_unit || 'Total Price',
        address: item.address || item.location || '',
        contactPhone: item.contactPhone || item.contact_phone || '+91 98450 12345',
        quantity: item.quantity || '1',
        quantityUnit: item.quantityUnit || item.quantity_unit || 'Units',
        isNegotiable: item.isNegotiable !== undefined ? item.isNegotiable : (item.is_negotiable !== undefined ? item.is_negotiable : false),
        status: item.status || 'ACTIVE',
        imageUrl: item.imageUrl || item.image_url || '',
        userId: item.userId || item.user_id || '',
        sellerName: item.sellerName || item.seller_name || 'Farmer Partner',
        sellerVerified: item.sellerVerified !== undefined ? item.sellerVerified : (item.seller_verified !== undefined ? item.seller_verified : true),
        createdAt: item.createdAt || item.created_at || new Date().toISOString()
      }));
      setListings(mapped);
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

  const handleMarkSold = async (id: number) => {
    try {
      await apiPost(`/api/marketplace/${id}/mark-sold`, {});
      toast({
        title: '🎉 Listing Marked as Sold!',
        description: 'Congratulations! This deal is completed and the post has been removed from the feed.',
      });
      loadListings();
    } catch (error) {
      console.error('Error marking as sold:', error);
      toast({
        title: 'Update failed',
        description: 'Could not mark listing as sold. Please try again.',
        variant: 'destructive',
      });
    }
  };


  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.06)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-black text-2xl md:text-3xl text-[#f0ece0] tracking-tight">
              Farmer Marketplace
            </h1>
            <span className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
              Live Trades
            </span>
          </div>
          <p className="text-[12px] text-[#a09880] mt-1 font-medium">
            Buy and sell crops, machinery, land, and fertilizers directly with verified local farmers.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-[#c49a2a] hover:bg-[#d4aa3a] text-[#0f0f0b] px-5 py-2.5 rounded-xl font-extrabold uppercase text-[12px] tracking-wider transition-all shadow hover:shadow-gold-glow shrink-0"
        >
          <Plus size={16} strokeWidth={3} />
          Post a Listing
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Listing type toggles */}
          <div className="flex items-center gap-1.5 p-1 bg-white/3 rounded-xl border border-white/5 shrink-0">
            <button
              onClick={() => setListingType('all')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all',
                listingType === 'all'
                  ? 'bg-[#c49a2a] text-[#0f0f0b] shadow'
                  : 'text-[#a09880] hover:text-[#f0ece0]'
              )}
            >
              All Listings
            </button>
            <button
              onClick={() => setListingType('buy')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all',
                listingType === 'buy'
                  ? 'bg-[#c49a2a] text-[#0f0f0b] shadow'
                  : 'text-[#a09880] hover:text-[#f0ece0]'
              )}
            >
              🔍 Looking to Buy
            </button>
            <button
              onClick={() => setListingType('sell')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all',
                listingType === 'sell'
                  ? 'bg-[#c49a2a] text-[#0f0f0b] shadow'
                  : 'text-[#a09880] hover:text-[#f0ece0]'
              )}
            >
              📢 For Sale
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6a6050]" />
            <input
              type="text"
              placeholder="Search crop, equipment, village, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/3 border border-white/5 text-[#f0ece0] pl-10 pr-4 py-2 rounded-xl text-xs font-medium placeholder:text-[#6a6050] focus:border-[#c49a2a] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category horizontal scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all',
              activeCategory === 'all'
                ? 'bg-[#c49a2a] border-[#c49a2a] text-[#0f0f0b] font-extrabold'
                : 'border-[rgba(255,255,255,0.08)] bg-white/3 text-[#a09880] hover:text-[#f0ece0]'
            )}
          >
            All Categories
          </button>
          {LISTING_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.label)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all',
                activeCategory === cat.label
                  ? 'bg-[#c49a2a] border-[#c49a2a] text-[#0f0f0b] font-extrabold'
                  : 'border-[rgba(255,255,255,0.08)] bg-white/3 text-[#a09880] hover:text-[#f0ece0]'
              )}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardShimmer />
          <CardShimmer />
          <CardShimmer />
          <CardShimmer />
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map(listing => (
            <div key={listing.id} className="card-base card-hover overflow-hidden flex flex-col justify-between transition-all border border-earth-border/40 hover:border-gold-400/30">
              <div>
                {/* Image */}
                {listing.imageUrl ? (
                  <div className="h-48 overflow-hidden relative border-b border-[rgba(255,255,255,0.05)] bg-[#111]">
                    <img 
                      src={listing.imageUrl} 
                      alt={listing.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={e => e.currentTarget.style.display = 'none'}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-[10px] text-[#c49a2a] bg-[rgba(196,154,42,0.15)] border border-[rgba(196,154,42,0.3)] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
                        {listing.category}
                      </span>
                      <span className={cn(
                        'text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider backdrop-blur-md border shadow-sm',
                        listing.listingType === 'sell'
                          ? 'bg-[rgba(74,154,106,0.18)] text-[#4a9a6a] border-[rgba(74,154,106,0.3)]'
                          : 'bg-[rgba(74,122,196,0.18)] text-[#4a7ac4] border-[rgba(74,122,196,0.3)]'
                      )}>
                        {listing.listingType === 'sell' ? '📢 For Sale' : '🔍 Wanted'}
                      </span>
                    </div>

                    {listing.isNegotiable && (
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-bold text-amber-300">
                        Negotiable
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-5 pb-0 flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="text-[10px] text-[#c49a2a] bg-[rgba(196,154,42,0.12)] border border-[rgba(196,154,42,0.2)] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {listing.category}
                      </span>
                      <span className={cn(
                        'text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border',
                        listing.listingType === 'sell'
                          ? 'bg-[rgba(74,154,106,0.12)] text-[#4a9a6a] border-[rgba(74,154,106,0.2)]'
                          : 'bg-[rgba(74,122,196,0.12)] text-[#4a7ac4] border-[rgba(74,122,196,0.2)]'
                      )}>
                        {listing.listingType === 'sell' ? '📢 For Sale' : '🔍 Wanted'}
                      </span>
                    </div>
                    {listing.isNegotiable && (
                      <span className="text-[9px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                        Negotiable
                      </span>
                    )}
                  </div>
                )}

                <div className="p-5">
                  <h3 className="font-bold text-[17px] text-[#f0ece0] mb-1.5 leading-snug">{listing.title}</h3>
                  <p className="text-[12px] text-[#a09880] mb-3 leading-relaxed line-clamp-2 font-medium">{listing.description}</p>
                  
                  {/* Quantity & Location tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {listing.quantity && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gold-300 bg-gold-400/10 px-2.5 py-1 rounded-lg border border-gold-400/15">
                        <Package size={11} className="text-gold-400" />
                        {listing.quantity} {listing.quantityUnit || 'Units'} available
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-earth-subtext bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                      <MapPin size={11} className="text-[#c49a2a]" />
                      {listing.address || listing.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5">
                {/* Price block */}
                <div className="flex items-center justify-between mb-4 p-3 bg-white/3 rounded-xl border border-white/5">
                  <div>
                    <p className="text-[20px] font-black text-[#c49a2a] leading-none mb-1">
                      {formatCurrency(listing.price)}
                    </p>
                    <p className="text-[10px] text-[#6a6050] font-bold uppercase tracking-wider">{listing.priceUnit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-[#a09880] font-bold uppercase">{listing.location}</p>
                    <p className="text-[10px] text-[#6a6050] mt-0.5 font-semibold">{timeAgo(listing.createdAt)}</p>
                  </div>
                </div>

                {/* Seller info & Action buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <div className="w-9 h-9 rounded-full bg-[rgba(196,154,42,0.15)] border border-[rgba(196,154,42,0.2)] flex items-center justify-center text-[13px] font-black text-[#c49a2a] shrink-0">
                    {(listing.sellerName || 'F')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#f0ece0] truncate">{listing.sellerName || 'Farmer Partner'}</p>
                    {listing.sellerVerified && (
                      <p className="text-[10px] text-[#4a9a6a] font-bold flex items-center gap-1">
                        <CheckCircle size={10} className="fill-[#4a9a6a]/10" /> Verified Grower
                      </p>
                    )}
                  </div>

                  {user?.id === listing.userId ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleMarkSold(listing.id)}
                        className="flex items-center gap-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 text-[11px] font-bold px-3 py-2 rounded-lg transition-all"
                        title="Mark as Sold and remove from marketplace"
                      >
                        <Check size={12} />
                        Mark Sold
                      </button>
                      <button 
                        onClick={() => handleDeleteListing(listing.id)}
                        className="flex items-center justify-center p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete listing"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setContactingListing(listing)}
                      className="flex items-center gap-1.5 bg-[#c49a2a] hover:bg-[#d4aa3a] text-[#0f0f0b] text-[11px] font-black uppercase px-4 py-2.5 rounded-lg tracking-wider transition-all shadow hover:shadow-gold-glow shrink-0"
                    >
                      <Phone size={12} />
                      Contact / Inquire
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

      {/* Contact & Notify Modal */}
      {contactingListing && (
        <ContactFarmerModal
          listing={contactingListing}
          onClose={() => setContactingListing(null)}
        />
      )}

      {/* Create listing modal */}
      {showCreateModal && (
        <CreateListingModal onClose={() => setShowCreateModal(false)} onCreated={loadListings} />
      )}
    </div>
  );
}

// Contact Farmer & In-App Notification Modal Sub-Component
function ContactFarmerModal({ 
  listing, 
  onClose
}: { 
  listing: Listing; 
  onClose: () => void; 
}) {
  const [isNotifying, setIsNotifying] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const { user } = useUser();
  const { toast } = useToast();

  const hasPhone = Boolean(
    listing.contactPhone && 
    listing.contactPhone.trim() && 
    listing.contactPhone.replace(/[^0-9]/g, '').length >= 6
  );
  const cleanPhone = (listing.contactPhone || '').replace(/[^0-9+]/g, '');
  const waNumber = cleanPhone.startsWith('+') ? cleanPhone.replace('+', '') : `91${cleanPhone.replace(/^0+/, '')}`;
  const whatsappText = encodeURIComponent(
    `Hello ${listing.sellerName || 'Farmer Partner'}, I am interested in purchasing your listing "${listing.title}" listed for ${formatCurrency(listing.price)} (${listing.priceUnit}) on Agri-Compass. Is it available for pickup?`
  );

  const handleNotifySeller = async () => {
    setIsNotifying(true);
    try {
      await apiPost(`/api/marketplace/${listing.id}/notify`, {
        buyerId: user?.id,
        buyerName: user?.fullName || user?.firstName || 'Interested Buyer',
        message: inquiryMessage.trim() || undefined
      });
      toast({
        title: '🔔 Notification Sent!',
        description: `Farmer ${listing.sellerName || 'Partner'} has been notified about your interest in ${listing.title}.`,
      });
      onClose();
    } catch (err) {
      console.error('Failed to notify seller:', err);
      toast({
        title: 'Notification Error',
        description: 'Unable to send notification to the seller right now. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-[#14140f] border border-[rgba(255,255,255,0.12)] rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-400/15 border border-gold-400/30 flex items-center justify-center text-gold-400 font-black text-sm">
              {(listing.sellerName || 'F')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-serif font-black text-lg text-gold-100">{listing.sellerName || 'Farmer Partner'}</h2>
              <p className="text-[11px] text-green-400 font-bold flex items-center gap-1">
                <ShieldCheck size={12} /> Verified Agricultural Seller
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-earth-subtext hover:text-gold-100 p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Item Summary Card */}
          <div className="bg-earth-card border border-earth-border/40 rounded-xl p-4 flex gap-4 items-center">
            {listing.imageUrl ? (
              <img src={listing.imageUrl} alt={listing.title} className="w-16 h-16 rounded-lg object-cover shrink-0 border border-white/10" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gold-400/10 flex items-center justify-center text-2xl shrink-0">
                🌾
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-gold-100 truncate">{listing.title}</h4>
              <p className="text-gold-300 font-extrabold text-base mt-0.5">
                {formatCurrency(listing.price)} <span className="text-xs font-medium text-earth-subtext">({listing.priceUnit})</span>
              </p>
              {listing.quantity && (
                <p className="text-[11px] text-earth-subtext font-semibold mt-0.5">
                  Available: {listing.quantity} {listing.quantityUnit || 'Units'}
                </p>
              )}
            </div>
          </div>

          {/* Location & Address */}
          <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-gold-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] uppercase tracking-wider font-extrabold text-gold-300">Pickup Address / Farm Location</p>
                <p className="text-xs text-gold-100 font-medium mt-0.5 leading-relaxed">
                  {listing.address || listing.location || 'Karnataka, India'}
                </p>
                <p className="text-[11px] text-earth-subtext font-semibold mt-1">District: {listing.location}</p>
              </div>
            </div>
          </div>

          {/* Direct Communication Action Buttons */}
          {hasPhone ? (
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-wider font-extrabold text-earth-subtext">Direct Contact Channels</p>
              
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow"
                >
                  <Phone size={14} />
                  Call Farmer
                </a>

                <a
                  href={`https://wa.me/${waNumber}?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-xs py-3 rounded-xl transition-all shadow"
                >
                  <MessageCircle size={14} />
                  Chat WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white/3 border border-white/5 rounded-xl p-3 flex items-center gap-2.5 text-xs text-earth-subtext">
              <Phone size={14} className="text-earth-subtext shrink-0" />
              <span>Seller chose not to share phone publicly. Click "Notify Seller" below to connect in-app.</span>
            </div>
          )}

          {/* In-App Seller Notification Action */}
          <div className="pt-2 border-t border-white/5">
            <div className="bg-gold-400/5 border border-gold-400/15 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs font-bold text-gold-200">Interested in this item?</p>
                <p className="text-[11px] text-earth-subtext mt-0.5">
                  Send an instant inquiry notification to the seller's bell icon so they know you want to buy.
                </p>
              </div>

              <input
                type="text"
                placeholder="Optional note (e.g. Is price negotiable? Can I inspect today?)"
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                className="w-full bg-[#12120e] border border-earth-border/40 text-gold-100 h-9 px-3 rounded-lg text-xs font-medium focus:border-[#c49a2a] outline-none placeholder:text-earth-subtext/60"
              />

              <button
                onClick={handleNotifySeller}
                disabled={isNotifying}
                className="w-full flex items-center justify-center gap-2 bg-[#c49a2a] hover:bg-[#d4aa3a] text-[#0f0f0b] font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow hover:shadow-gold-glow"
              >
                <Bell size={15} />
                {isNotifying ? 'Sending Notification...' : 'Notify Seller / Express Interest'}
              </button>
            </div>
          </div>
        </div>
      </div>
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
  const [quantity, setQuantity] = useState('1');
  const [quantityUnit, setQuantityUnit] = useState('Quintals');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Custom Dynamic Fields
  const [subType, setSubType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.location || profile?.district) {
      setLocation(profile.location || profile.district || '');
    }
    if (profile?.phone) {
      setContactPhone(profile.phone);
    }
  }, [profile]);

  useEffect(() => {
    if (selectedCategory) {
      setSubType(selectedCategory.subTypes[0]);
      setPriceUnit(selectedCategory.priceLabel);
    }
  }, [selectedCategory]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // 1. Instantly compress and set preview so user's exact photo is never lost
      const compressedDataUrl = await compressImage(file);
      setImageUrl(compressedDataUrl);

      // 2. Upload to backend/Cloudinary if configured
      try {
        const res = await UploadAPI.uploadMedia(file, 'agri-compass/marketplace');
        if (res?.url) {
          setImageUrl(res.url);
        }
      } catch (uploadErr) {
        console.warn('Backend upload fell back to embedded image data:', uploadErr);
      }

      toast({ title: 'Photo attached successfully!' });
    } catch (err) {
      console.error('Failed to process image:', err);
      toast({
        title: 'Image attachment failed',
        description: 'You can also paste a direct image URL.',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!price || !location.trim()) {
      toast({
        title: 'Validation failed',
        description: 'Price and District are required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let finalDescription = description.trim();
      if (selectedCategory) {
        finalDescription = `[Type: ${subType}] \n\n${finalDescription}`;
      }

      const finalTitle = title.trim() || `${subType} - ${location}`;
      const cleanPrice = typeof price === 'string' ? parseFloat(price.replace(/,/g, '')) : parseFloat(String(price));

      const payload = {
        title: finalTitle,
        description: finalDescription,
        category: selectedCategory?.label || 'General',
        listingType,
        listing_type: listingType,
        type: listingType,
        price: !isNaN(cleanPrice) ? cleanPrice : 0,
        priceUnit,
        price_unit: priceUnit,
        quantity: quantity.trim() || '1',
        quantityUnit: quantityUnit.trim() || 'Units',
        quantity_unit: quantityUnit.trim() || 'Units',
        isNegotiable,
        is_negotiable: isNegotiable,
        location: location.trim(),
        address: address.trim() || location.trim(),
        contactPhone: contactPhone.trim() || undefined,
        contact_phone: contactPhone.trim() || undefined,
        phone: contactPhone.trim() || undefined,
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?fit=crop&w=400&h=300&q=60',
        image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?fit=crop&w=400&h=300&q=60',
        userId: user?.id,
        user_id: user?.id
      };

      await apiPost('/api/marketplace', payload);
      toast({
        title: '🎉 Listing posted!',
        description: 'Your produce is now live on the farmer marketplace with your contact details.',
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
      <div className="bg-[#1a1a14] border border-[rgba(255,255,255,0.1)] rounded-2xl w-full max-w-[580px] max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              {/* Core Title */}
              <div className="space-y-1">
                <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Listing Title</label>
                <input
                  type="text"
                  placeholder="e.g. Sona Masuri Rice Seedlings (Grade A)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-11 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                />
              </div>

              {/* Price & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-10 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Price Unit</label>
                  <input
                    type="text"
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-10 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                  />
                </div>
              </div>

              {/* Quantity & Negotiable */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-1">
                  <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Quantity Available</label>
                  <input
                    type="text"
                    placeholder="e.g. 50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-10 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                  />
                </div>
                <div className="space-y-1 sm:col-span-1">
                  <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Quantity Unit</label>
                  <select
                    value={quantityUnit}
                    onChange={(e) => setQuantityUnit(e.target.value)}
                    className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-10 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                  >
                    <option value="Quintals">Quintals</option>
                    <option value="Kg">Kg</option>
                    <option value="Bags">Bags</option>
                    <option value="Acres">Acres</option>
                    <option value="Tons">Tons</option>
                    <option value="Units">Units / Pieces</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6 sm:col-span-1">
                  <input
                    type="checkbox"
                    id="negotiable"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="w-4 h-4 rounded border-earth-border/40 accent-[#c49a2a]"
                  />
                  <label htmlFor="negotiable" className="text-xs text-gold-200 font-bold cursor-pointer">
                    Price Negotiable
                  </label>
                </div>
              </div>

              {/* Location & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">District *</label>
                  <input
                    type="text"
                    placeholder="Shivamogga, Mandya, etc."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-10 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Farmer Phone Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="+91 98450 XXXXX (leave blank if preferred)"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-10 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Farm / Village Address (Optional)</label>
                <input
                  type="text"
                  placeholder="Village, Taluk, Landmark (leave blank if preferred)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 h-10 px-3 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Produce / Item Description</label>
                <textarea
                  placeholder="Detail crop quality, harvest date, variety, condition..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-earth-main/50 border border-earth-border/40 text-gold-100 p-2.5 rounded-lg text-xs font-semibold focus:border-[#c49a2a] outline-none resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-[#6a6050] uppercase tracking-widest font-bold">Produce Photo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-lg text-xs font-bold text-gold-200 transition-colors"
                  >
                    <Upload size={13} />
                    {uploadingImage ? 'Uploading...' : 'Upload Image File'}
                  </button>

                  <span className="text-[10px] text-earth-subtext font-bold uppercase">or URL:</span>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 bg-earth-main/50 border border-earth-border/40 text-gold-100 h-9 px-3 rounded-lg text-xs font-medium focus:border-[#c49a2a] outline-none truncate"
                  />
                </div>
                {imageUrl && (
                  <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-[12px] text-[#a09880] font-bold uppercase tracking-widest text-center mb-4">Confirm Real-World Trade Details</p>
                <div className="bg-[#1e1e16] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 space-y-3.5">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[11px] text-[#6a6050] uppercase font-bold tracking-wider">Type</span>
                    <span className="text-[11px] text-[#c49a2a] bg-[rgba(196,154,42,0.1)] px-2 py-0.5 rounded font-extrabold uppercase">
                      {listingType === 'sell' ? 'For Sale' : 'Wanted'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[11px] text-[#6a6050] uppercase font-bold tracking-wider">Item Title</span>
                    <span className="text-xs font-bold text-[#f0ece0] truncate max-w-[240px]">{title || `${subType} - ${location}`}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[11px] text-[#6a6050] uppercase font-bold tracking-wider">Price</span>
                    <span className="text-xs font-black text-[#c49a2a]">
                      {formatCurrency(parseFloat(price) || 0)} ({priceUnit}) {isNegotiable && '• Negotiable'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[11px] text-[#6a6050] uppercase font-bold tracking-wider">Quantity</span>
                    <span className="text-xs font-bold text-[#f0ece0]">{quantity} {quantityUnit}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[11px] text-[#6a6050] uppercase font-bold tracking-wider">Pickup Address</span>
                    <span className="text-xs font-bold text-[#f0ece0] truncate max-w-[240px]">
                      {address.trim() ? address : `District: ${location} (Specific address withheld)`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[#6a6050] uppercase font-bold tracking-wider">Farmer Contact</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {contactPhone.trim() ? contactPhone : 'In-app notifications only'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3 items-start text-xs text-emerald-400">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                <div>
                  <span className="font-bold uppercase tracking-wider">Privacy & Reach:</span> {contactPhone.trim() ? 'Your contact number is included so buyers can call or WhatsApp you directly.' : 'Your contact number is withheld; buyers will send inquiries to your in-app notifications.'}
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

          {step === 1 ? (
            <div />
          ) : step === 2 ? (
            <button onClick={() => {
              if (!price || !location.trim()) {
                toast({
                  title: 'Validation failed',
                  description: 'Please fill in Price and District.',
                  variant: 'destructive'
                });
                return;
              }
              setStep(3);
            }}
              className="flex items-center gap-1.5 bg-[#c49a2a] hover:bg-[#d4aa3a] text-[#0f0f0b] px-5 py-2.5 rounded-lg text-[11px] uppercase tracking-wider font-extrabold transition-all shadow shrink-0">
              Next
              <ChevronRight size={13} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="flex items-center gap-1.5 bg-[#c49a2a] hover:bg-[#d4aa3a] text-[#0f0f0b] px-6 py-3 rounded-lg text-[11px] uppercase tracking-wider font-extrabold transition-all shadow shrink-0">
              {isSubmitting ? 'Posting...' : 'Confirm & Post Listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
