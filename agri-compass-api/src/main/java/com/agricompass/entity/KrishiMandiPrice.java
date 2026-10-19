package com.agricompass.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "krishi_mandi_prices", indexes = {
    @Index(name = "idx_kmv_district", columnList = "district"),
    @Index(name = "idx_kmv_commodity", columnList = "commodity"),
    @Index(name = "idx_kmv_report_date", columnList = "report_date"),
    @Index(name = "idx_kmv_unique_market_crop", columnList = "market, commodity, variety, grade", unique = true)
})
public class KrishiMandiPrice {

    @Id
    private String id;

    @Column(nullable = false)
    private String source = "KRISHI_MARATA_VAHINI";

    @Column(name = "report_date", nullable = false)
    private String reportDate; // ISO-8601 YYYY-MM-DD

    @Column(nullable = false)
    private String state = "Karnataka";

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String market;

    @Column(nullable = false)
    private String commodity;

    private String variety;

    @Column(nullable = false)
    private String grade = "STANDARD";

    @Column(name = "arrival_quantity")
    private Double arrivalQuantity;

    @Column(name = "arrival_unit")
    private String arrivalUnit = "Quintal";

    @Column(name = "price_unit")
    private String priceUnit = "Rs/Quintal";

    @Column(name = "min_price", nullable = false)
    private Double minPrice;

    @Column(name = "max_price", nullable = false)
    private Double maxPrice;

    @Column(name = "modal_price", nullable = false)
    private Double modalPrice;

    @Column(name = "created_at", updatable = false)
    private String createdAt;

    @Column(name = "updated_at")
    private String updatedAt;

    public KrishiMandiPrice() {}

    @PrePersist
    public void onPrePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        String now = Instant.now().toString();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        this.updatedAt = now;
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = Instant.now().toString();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getReportDate() { return reportDate; }
    public void setReportDate(String reportDate) { this.reportDate = reportDate; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getMarket() { return market; }
    public void setMarket(String market) { this.market = market; }

    public String getCommodity() { return commodity; }
    public void setCommodity(String commodity) { this.commodity = commodity; }

    public String getVariety() { return variety; }
    public void setVariety(String variety) { this.variety = variety; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public Double getArrivalQuantity() { return arrivalQuantity; }
    public void setArrivalQuantity(Double arrivalQuantity) { this.arrivalQuantity = arrivalQuantity; }

    public String getArrivalUnit() { return arrivalUnit; }
    public void setArrivalUnit(String arrivalUnit) { this.arrivalUnit = arrivalUnit; }

    public String getPriceUnit() { return priceUnit; }
    public void setPriceUnit(String priceUnit) { this.priceUnit = priceUnit; }

    public Double getMinPrice() { return minPrice; }
    public void setMinPrice(Double minPrice) { this.minPrice = minPrice; }

    public Double getMaxPrice() { return maxPrice; }
    public void setMaxPrice(Double maxPrice) { this.maxPrice = maxPrice; }

    public Double getModalPrice() { return modalPrice; }
    public void setModalPrice(Double modalPrice) { this.modalPrice = modalPrice; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
