package com.agricompass.dto;

import com.agricompass.entity.Listing;
import com.fasterxml.jackson.annotation.JsonProperty;
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
            String name = listing.getUserProfile().getFullName();
            if (name == null || name.isBlank()) {
                name = listing.getUserProfile().getUsername();
            }
            dto.setSellerName(name != null && !name.isBlank() ? name : "Farmer Partner");
        } else {
            dto.setSellerName("Farmer Partner");
        }
        dto.setSellerVerified(true);
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

    @JsonProperty("listingType")
    public String getListingType() { return listingType; }
    public void setListingType(String listingType) { this.listingType = listingType; }

    @JsonProperty("listing_type")
    public String getListingTypeSnake() { return listingType; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    @JsonProperty("priceUnit")
    public String getPriceUnit() { return priceUnit; }
    public void setPriceUnit(String priceUnit) { this.priceUnit = priceUnit; }

    @JsonProperty("price_unit")
    public String getPriceUnitSnake() { return priceUnit; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    @JsonProperty("imageUrl")
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    @JsonProperty("image_url")
    public String getImageUrlSnake() { return imageUrl; }

    @JsonProperty("userId")
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    @JsonProperty("user_id")
    public String getUserIdSnake() { return userId; }

    @JsonProperty("sellerName")
    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    @JsonProperty("seller_name")
    public String getSellerNameSnake() { return sellerName; }

    @JsonProperty("sellerVerified")
    public boolean isSellerVerified() { return sellerVerified; }
    public void setSellerVerified(boolean sellerVerified) { this.sellerVerified = sellerVerified; }

    @JsonProperty("seller_verified")
    public boolean isSellerVerifiedSnake() { return sellerVerified; }

    @JsonProperty("createdAt")
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @JsonProperty("created_at")
    public LocalDateTime getCreatedAtSnake() { return createdAt; }
}
