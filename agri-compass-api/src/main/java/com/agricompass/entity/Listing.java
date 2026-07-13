package com.agricompass.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "marketplace_listings",
    indexes = {
        @Index(name = "idx_listing_category", columnList = "category"),
        @Index(name = "idx_listing_type", columnList = "listing_type")
    }
)
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(name = "listing_type", nullable = false)
    private String listingType; // "buy" or "sell"

    @Column(nullable = false)
    private Double price;

    @Column(name = "price_unit")
    private String priceUnit;

    private String location;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private UserProfile userProfile;

    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Listing() {}

    public Listing(Long id, String title, String description, String category, String listingType, Double price, String priceUnit, String location, String imageUrl, String userId, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.listingType = listingType;
        this.price = price;
        this.priceUnit = priceUnit;
        this.location = location;
        this.imageUrl = imageUrl;
        this.userId = userId;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public UserProfile getUserProfile() { return userProfile; }
    public void setUserProfile(UserProfile userProfile) { this.userProfile = userProfile; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static ListingBuilder builder() {
        return new ListingBuilder();
    }

    public static class ListingBuilder {
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
        private boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        ListingBuilder() {}

        public ListingBuilder id(Long id) { this.id = id; return this; }
        public ListingBuilder title(String title) { this.title = title; return this; }
        public ListingBuilder description(String description) { this.description = description; return this; }
        public ListingBuilder category(String category) { this.category = category; return this; }
        public ListingBuilder listingType(String listingType) { this.listingType = listingType; return this; }
        public ListingBuilder price(Double price) { this.price = price; return this; }
        public ListingBuilder priceUnit(String priceUnit) { this.priceUnit = priceUnit; return this; }
        public ListingBuilder location(String location) { this.location = location; return this; }
        public ListingBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public ListingBuilder userId(String userId) { this.userId = userId; return this; }
        public ListingBuilder active(boolean active) { this.active = active; return this; }
        public ListingBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ListingBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Listing build() {
            return new Listing(id, title, description, category, listingType, price, priceUnit, location, imageUrl, userId, active, createdAt, updatedAt);
        }
    }
}
