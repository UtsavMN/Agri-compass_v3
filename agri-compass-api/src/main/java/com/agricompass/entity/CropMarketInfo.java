package com.agricompass.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "crop_market_info")
public class CropMarketInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "crop_id", referencedColumnName = "id", nullable = false)
    private Crop crop;

    @Column(name = "average_msp")
    private Double averageMsp;

    @Column(name = "market_demand")
    private String marketDemand;

    @Column(name = "export_potential")
    private String exportPotential;

    @Column(name = "price_volatility")
    private String priceVolatility;

    public CropMarketInfo() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Crop getCrop() { return crop; }
    public void setCrop(Crop crop) { this.crop = crop; }

    public Double getAverageMsp() { return averageMsp; }
    public void setAverageMsp(Double averageMsp) { this.averageMsp = averageMsp; }

    public String getMarketDemand() { return marketDemand; }
    public void setMarketDemand(String marketDemand) { this.marketDemand = marketDemand; }

    public String getExportPotential() { return exportPotential; }
    public void setExportPotential(String exportPotential) { this.exportPotential = exportPotential; }

    public String getPriceVolatility() { return priceVolatility; }
    public void setPriceVolatility(String priceVolatility) { this.priceVolatility = priceVolatility; }
}
