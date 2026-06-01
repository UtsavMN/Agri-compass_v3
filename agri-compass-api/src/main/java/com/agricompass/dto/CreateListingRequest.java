package com.agricompass.dto;

public class CreateListingRequest {
    private String title;
    private String description;
    private String category;
    private String listingType;
    private Double price;
    private String priceUnit;
    private String location;
    private String imageUrl;

    public CreateListingRequest() {}

    public CreateListingRequest(String title, String description, String category, String listingType, Double price, String priceUnit, String location, String imageUrl) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.listingType = listingType;
        this.price = price;
        this.priceUnit = priceUnit;
        this.location = location;
        this.imageUrl = imageUrl;
    }

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
}
