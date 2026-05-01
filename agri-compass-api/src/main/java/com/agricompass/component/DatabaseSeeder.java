package com.agricompass.component;

import com.agricompass.entity.Crop;
import com.agricompass.entity.CropEconomics;
import com.agricompass.repository.CropRepository;
import com.agricompass.repository.CropEconomicsRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final CropRepository cropRepo;
    private final CropEconomicsRepository econRepo;

    public DatabaseSeeder(CropRepository cropRepo, CropEconomicsRepository econRepo) {
        this.cropRepo = cropRepo;
        this.econRepo = econRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        seedCrop("Rice", "Kharif", 130, "High", "Clay / Loam", "20°C - 35°C", 25000.0, 22.0, 2300.0);
        seedCrop("Maize", "Kharif/Rabi", 110, "Medium", "Loamy / Red Sandy", "18°C - 27°C", 18000.0, 25.0, 2000.0);
        seedCrop("Chickpea", "Rabi", 100, "Low", "Black Cotton", "15°C - 25°C", 12000.0, 8.0, 5000.0);
        seedCrop("Kidneybeans", "Kharif", 115, "Medium", "Loamy", "15°C - 25°C", 16000.0, 10.0, 8000.0);
        seedCrop("Pigeonpeas", "Kharif", 150, "Medium", "Black / Red", "20°C - 30°C", 14000.0, 9.0, 6500.0);
        seedCrop("Mothbeans", "Kharif", 80, "Low", "Sandy", "25°C - 30°C", 8000.0, 5.0, 5500.0);
        seedCrop("Mungbean", "Zaid/Kharif", 65, "Low", "Loamy", "25°C - 35°C", 10000.0, 6.0, 7500.0);
        seedCrop("Blackgram", "Kharif", 85, "Medium", "Black / Loam", "25°C - 30°C", 11000.0, 7.0, 6800.0);
        seedCrop("Lentil", "Rabi", 120, "Low", "Black / Alluvial", "15°C - 25°C", 13000.0, 8.0, 6200.0);
        seedCrop("Pomegranate", "Year-round", 365, "Low (Drip)", "Light Soils", "20°C - 35°C", 60000.0, 45.0, 6000.0);
        seedCrop("Banana", "Year-round", 330, "High", "Alluvial", "20°C - 30°C", 75000.0, 150.0, 1200.0);
        seedCrop("Mango", "Year-round", 0, "Low", "Lateritic / Alluvial", "24°C - 30°C", 40000.0, 50.0, 3500.0);
        seedCrop("Grapes", "Year-round", 0, "Medium", "Red Loam", "15°C - 40°C", 90000.0, 80.0, 4000.0);
        seedCrop("Watermelon", "Zaid", 90, "Medium", "Sandy Loam", "25°C - 35°C", 30000.0, 120.0, 800.0);
        seedCrop("Muskmelon", "Zaid", 80, "Medium", "Sandy Loam", "25°C - 35°C", 25000.0, 100.0, 1200.0);
        seedCrop("Apple", "Year-round", 0, "Medium", "Loamy", "0°C - 21°C", 80000.0, 60.0, 6000.0);
        seedCrop("Orange", "Year-round", 0, "Medium", "Light Loam", "13°C - 37°C", 55000.0, 70.0, 3000.0);
        seedCrop("Papaya", "Year-round", 0, "High", "Alluvial / Lateritic", "22°C - 26°C", 50000.0, 150.0, 1500.0);
        seedCrop("Coconut", "Year-round", 0, "High", "Coastal / Sandy", "27°C - 32°C", 35000.0, 60.0, 3000.0); // Yield in nuts equivalent roughly
        seedCrop("Cotton", "Kharif", 180, "Medium", "Black Cotton", "21°C - 30°C", 28000.0, 12.0, 7500.0);
        seedCrop("Jute", "Kharif", 130, "High", "Alluvial", "24°C - 35°C", 22000.0, 15.0, 4000.0);
        seedCrop("Coffee", "Year-round", 0, "High", "Lateritic", "15°C - 28°C", 80000.0, 12.0, 15000.0);
        seedCrop("Groundnut", "Kharif/Rabi", 110, "Medium", "Red Sandy", "20°C - 30°C", 20000.0, 10.0, 5500.0);
        seedCrop("Sugarcane", "Year-round", 365, "High", "Alluvial / Black", "20°C - 35°C", 65000.0, 350.0, 350.0);
        seedCrop("Soybean", "Kharif", 100, "Medium", "Black / Red", "25°C - 30°C", 16000.0, 9.0, 4500.0);
        seedCrop("Sorghum", "Kharif/Rabi", 120, "Low", "Black / Red", "25°C - 32°C", 12000.0, 15.0, 2000.0);
        seedCrop("Ragi", "Kharif", 110, "Low", "Red Loam", "25°C - 30°C", 10000.0, 12.0, 2800.0);
        seedCrop("Pepper", "Year-round", 0, "High", "Lateritic", "20°C - 30°C", 40000.0, 5.0, 45000.0);
        seedCrop("Arecanut", "Year-round", 0, "High", "Lateritic", "14°C - 36°C", 60000.0, 10.0, 35000.0);
        seedCrop("Tomato", "Kharif/Rabi", 120, "Medium", "Sandy Loam", "21°C - 24°C", 35000.0, 150.0, 1500.0);
        System.out.println("✅ Decision Support System Database Synced: Highly realistic agricultural economics primed.");
    }

    private void seedCrop(String name, String season, int duration, String water, String soil, String temp, double inv, double yld, double price) {
        Optional<Crop> optCrop = cropRepo.findByNameIgnoreCase(name);
        Crop crop = optCrop.orElseGet(Crop::new);
        
        crop.setName(name);
        crop.setSeason(season);
        crop.setDurationDays(duration);
        crop.setWaterRequirement(water);
        crop.setSoilType(soil);
        crop.setTemperatureRange(temp);
        
        // Fix for missing Dataset info on Dashboard
        crop.setInvestmentPerAcre(inv);
        crop.setExpectedReturns(yld * price);
        crop.setBreakevenMonths(duration > 0 ? (duration / 30 > 0 ? duration / 30 : 1) : 4);
        crop.setGuidelines("Comprehensive cultivation guidelines for " + name + ":\n- Ensure proper soil preparation.\n- Manage irrigation according to seasonal needs.\n- Apply required fertilizers at correct stages.\n- Monitor for pests and diseases regularly.\n- Transport and market efficiently to maximize profit.");

        crop = cropRepo.save(crop);

        Optional<CropEconomics> optEcon = econRepo.findByCropId(crop.getId());
        if (optEcon.isEmpty()) {
            CropEconomics e = new CropEconomics();
            e.setCrop(crop);
            e.setInvestmentPerAcre(inv);
            e.setYieldQuintal(yld);
            e.setMarketPrice(price);
            
            double expectedReturn = yld * price;
            double profit = expectedReturn - inv;
            
            e.setExpectedReturn(expectedReturn);
            e.setProfitMargin(profit);
            econRepo.save(e);
        }
    }
}
