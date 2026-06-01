package com.agricompass.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class DataController {

    private Map<String, Object> createSchemeMap(
            String id, String name, String description, String eligibility, String benefits,
            String applicationProcess, String contactInfo, String state, String category,
            boolean active, String casteCategory, String landHolding, String gender, String subsidyQuantum,
            String portalUrl, String coverageType, String activeDistricts) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("name", name);
        map.put("description", description);
        map.put("eligibility", eligibility);
        map.put("benefits", benefits);
        map.put("application_process", applicationProcess);
        map.put("contact_info", contactInfo);
        map.put("state", state);
        map.put("category", category);
        map.put("active", active);
        map.put("caste_category", casteCategory);
        map.put("land_holding", landHolding);
        map.put("gender", gender);
        map.put("subsidy_quantum", subsidyQuantum);
        map.put("portal_url", portalUrl);
        map.put("coverage_type", coverageType);
        map.put("active_districts", activeDistricts);
        return map;
    }

    // GET /api/schemes
    @GetMapping("/schemes")
    public ResponseEntity<List<Map<String, Object>>> getSchemes() {
        return ResponseEntity.ok(List.of(
            createSchemeMap(
                "1",
                "PM-KISAN",
                "Direct income support of Rs. 6000 per year to farmer families",
                "Small and marginal landholding farmers",
                "Rs. 2000 per installment, three times a year",
                "Apply through PM-KISAN portal or local CSC",
                "Helpline: 155261",
                "National",
                "Financial Support",
                true,
                "All",
                "Small & Marginal",
                "All",
                "N/A",
                "https://pmkisan.gov.in/",
                "Statewide",
                "All"
            ),
            createSchemeMap(
                "2",
                "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                "Crop insurance scheme to provide financial support to farmers suffering crop loss/damage arising out of unforeseen events.",
                "All farmers growing notified crops in a notified area",
                "Comprehensive insurance cover against failure of the crop",
                "Apply at nearest bank branch or PMFBY portal",
                "PMFBY Helpline",
                "National",
                "Insurance",
                true,
                "All",
                "All",
                "All",
                "50%",
                "https://pmfby.gov.in/",
                "Statewide",
                "All"
            ),
            createSchemeMap(
                "3",
                "Paramparagat Krishi Vikas Yojana (PKVY)",
                "Promoting organic farming through cluster approach.",
                "Farmers forming a cluster of 50 acres",
                "Financial assistance for organic inputs, certification, and marketing",
                "Contact local Agriculture Department",
                "State Agriculture Department",
                "National",
                "Organic Farming",
                true,
                "All",
                "All",
                "All",
                "75%",
                "https://pgsindia-ncof.dac.gov.in/pkvy/",
                "Statewide",
                "All"
            ),
            createSchemeMap(
                "4",
                "Krishi Bhagya Scheme",
                "Karnataka government scheme for rainwater harvesting and protective irrigation in dry zones.",
                "Dry-land farmers in Karnataka dry zone districts",
                "90% subsidy for SC/ST farmers, 80% subsidy for general category on farm ponds, polyhouses, diesel pumpsets",
                "Apply at local Raitha Samparka Kendra (RSK)",
                "Karnataka Agriculture Department Helpline",
                "Karnataka",
                "Irrigation",
                true,
                "All",
                "Small & Marginal",
                "All",
                "90%",
                "https://raitamitra.karnataka.gov.in/",
                "Dry Zone Districts Only",
                "Bagalkot, Vijayapura, Koppal, Gadag, Ballari, Chitradurga, Davanagere, Kalaburagi, Yadgir, Raichur"
            ),
            createSchemeMap(
                "5",
                "Sub-Mission on Agricultural Mechanization (SMAM)",
                "Promotion of agricultural mechanization by providing subsidies on tractors, tillers, and machinery.",
                "SC/ST and women farmers receive higher subsidies",
                "Up to 50% subsidy for general and 90% subsidy for women and SC/ST farmers",
                "Apply online through SMAM portal or district Joint Director of Agriculture",
                "Agri-Machinery Portal Helpdesk",
                "National",
                "Mechanization",
                true,
                "SC/ST",
                "Small & Marginal",
                "Female",
                "90%",
                "https://agrimachinery.nic.in/",
                "Statewide",
                "All"
            ),
            createSchemeMap(
                "6",
                "Ganga Kalyana Scheme",
                "Drilling of borewells and installation of pumpsets for minority/backward class farmers to provide irrigation facilities.",
                "Small & marginal farmers belonging to minority communities",
                "100% subsidy on borewell drilling, pumpset installation, and electrical connection up to Rs. 2 Lakhs",
                "Apply online on KDDC / Devaraj Urs development corporation portal",
                "KDDC Helpline: 080-22860999",
                "Karnataka",
                "Irrigation",
                true,
                "SC/ST",
                "Small & Marginal",
                "All",
                "90%",
                "https://kddc.karnataka.gov.in/",
                "Statewide",
                "All"
            )
        ));
    }
}
