package com.agricompass.dto;

import com.agricompass.entity.Listing;
import java.time.LocalDateTime;

public class ListingDTO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String listingType;
    private Double price;
    private String priceUnit;
    private String location;
    private String imageUrl;
    private String userId;
    private String sellerName;
    private boolean sellerVerified;
    private LocalDateTime createdAt;

    public ListingDTO() {}

    public static ListingDTO from(Listing listing) {
        ListingDTO dto = new ListingDTO();
        dto.setId(listing.getId());
        dto.setTitle(listing.getTitle());
        dto.setDescription(listing.getDescription());
        dto.setCategory(listing.getCategory());
        dto.setListingType(listing.getListingType());
        dto.setPrice(listing.getPrice());
        dto.setPriceUnit(listing.getPriceUnit());
        dto.setLocation(listing.getLocation());
        dto.setImageUrl(listing.getImageUrl());
        dto.setUserId(listing.getUserId());
        dto.setCreatedAt(listing.getCreatedAt());

        if (listing.getUserProfile() != null) {
            dto.setSellerName(listing.getUserProfile().getFullName() != null ? 
                listing.getUserProfile().getFullName() : listing.getUserProfile().getUsername());
        } else {
            dto.setSellerName("Farmer Partner");
        }
        dto.setSellerVerified(true); // Default to verified for premium look
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getListingType() { return listingType; }
    public void setListingType(String listingType) { this.listingType = listingType; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getPriceUnit() { return priceUnit; }
    public void setPriceUnit(String priceUnit) { this.priceUnit = priceUnit; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public boolean isSellerVerified() { return sellerVerified; }
    public void setSellerVerified(boolean sellerVerified) { this.sellerVerified = sellerVerified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
