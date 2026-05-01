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

    // Getters and Setters
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
}
