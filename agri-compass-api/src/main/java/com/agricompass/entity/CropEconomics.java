package com.agricompass.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "crop_economics")
public class CropEconomics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "crop_id", referencedColumnName = "id", nullable = false)
    private Crop crop;

    @Column(name = "investment_per_acre")
    private Double investmentPerAcre;

    @Column(name = "yield_quintal_per_acre")
    private Double yieldQuintal;

    @Column(name = "market_price_per_quintal")
    private Double marketPrice;

    @Column(name = "expected_return")
    private Double expectedReturn;

    @Column(name = "profit_margin")
    private Double profitMargin;

    public CropEconomics() {}

    public CropEconomics(Long id, Crop crop, Double investmentPerAcre, Double yieldQuintal, Double marketPrice, Double expectedReturn, Double profitMargin) {
        this.id = id;
        this.crop = crop;
        this.investmentPerAcre = investmentPerAcre;
        this.yieldQuintal = yieldQuintal;
        this.marketPrice = marketPrice;
        this.expectedReturn = expectedReturn;
        this.profitMargin = profitMargin;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Crop getCrop() { return crop; }
    public void setCrop(Crop crop) { this.crop = crop; }

    public Double getInvestmentPerAcre() { return investmentPerAcre; }
    public void setInvestmentPerAcre(Double investmentPerAcre) { this.investmentPerAcre = investmentPerAcre; }

    public Double getYieldQuintal() { return yieldQuintal; }
    public void setYieldQuintal(Double yieldQuintal) { this.yieldQuintal = yieldQuintal; }

    public Double getMarketPrice() { return marketPrice; }
    public void setMarketPrice(Double marketPrice) { this.marketPrice = marketPrice; }

    public Double getExpectedReturn() { return expectedReturn; }
    public void setExpectedReturn(Double expectedReturn) { this.expectedReturn = expectedReturn; }

    public Double getProfitMargin() { return profitMargin; }
    public void setProfitMargin(Double profitMargin) { this.profitMargin = profitMargin; }

    public static CropEconomicsBuilder builder() {
        return new CropEconomicsBuilder();
    }

    public static class CropEconomicsBuilder {
        private Long id;
        private Crop crop;
        private Double investmentPerAcre;
        private Double yieldQuintal;
        private Double marketPrice;
        private Double expectedReturn;
        private Double profitMargin;

        CropEconomicsBuilder() {}

        public CropEconomicsBuilder id(Long id) { this.id = id; return this; }
        public CropEconomicsBuilder crop(Crop crop) { this.crop = crop; return this; }
        public CropEconomicsBuilder investmentPerAcre(Double investmentPerAcre) { this.investmentPerAcre = investmentPerAcre; return this; }
        public CropEconomicsBuilder yieldQuintal(Double yieldQuintal) { this.yieldQuintal = yieldQuintal; return this; }
        public CropEconomicsBuilder marketPrice(Double marketPrice) { this.marketPrice = marketPrice; return this; }
        public CropEconomicsBuilder expectedReturn(Double expectedReturn) { this.expectedReturn = expectedReturn; return this; }
        public CropEconomicsBuilder profitMargin(Double profitMargin) { this.profitMargin = profitMargin; return this; }

        public CropEconomics build() {
            return new CropEconomics(id, crop, investmentPerAcre, yieldQuintal, marketPrice, expectedReturn, profitMargin);
        }
    }
}
