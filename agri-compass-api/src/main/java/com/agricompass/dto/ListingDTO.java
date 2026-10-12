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
    private String address;
    private String contactPhone;
    private String quantity;
    private String quantityUnit;
    private Boolean isNegotiable;
    private String status;
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
        dto.setAddress(listing.getAddress() != null && !listing.getAddress().isBlank() ? listing.getAddress() : listing.getLocation());
        
        String phone = listing.getContactPhone();
        if ((phone == null || phone.isBlank()) && listing.getUserProfile() != null) {
            phone = listing.getUserProfile().getPhone();
        }
        dto.setContactPhone(phone != null && !phone.isBlank() ? phone : "+91 98450 12345");
        dto.setQuantity(listing.getQuantity());
        dto.setQuantityUnit(listing.getQuantityUnit());
        dto.setIsNegotiable(listing.getIsNegotiable() != null ? listing.getIsNegotiable() : false);
        dto.setStatus(listing.getStatus() != null ? listing.getStatus() : (listing.isActive() ? "ACTIVE" : "SOLD"));

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

    @JsonProperty("address")
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    @JsonProperty("contactPhone")
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    @JsonProperty("contact_phone")
    public String getContactPhoneSnake() { return contactPhone; }

    @JsonProperty("quantity")
    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }

    @JsonProperty("quantityUnit")
    public String getQuantityUnit() { return quantityUnit; }
    public void setQuantityUnit(String quantityUnit) { this.quantityUnit = quantityUnit; }

    @JsonProperty("quantity_unit")
    public String getQuantityUnitSnake() { return quantityUnit; }

    @JsonProperty("isNegotiable")
    public Boolean getIsNegotiable() { return isNegotiable; }
    public void setIsNegotiable(Boolean isNegotiable) { this.isNegotiable = isNegotiable; }

    @JsonProperty("is_negotiable")
    public Boolean getIsNegotiableSnake() { return isNegotiable; }

    @JsonProperty("status")
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

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
