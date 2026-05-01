package com.agricompass.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DataController {

    // GET /api/schemes
    @GetMapping("/schemes")
    public ResponseEntity<List<Map<String, Object>>> getSchemes() {
        return ResponseEntity.ok(List.of(
            Map.of(
                "id", "1",
                "name", "PM-KISAN",
                "description", "Direct income support of Rs. 6000 per year to farmer families",
                "eligibility", "Small and marginal landholding farmers",
                "benefits", "Rs. 2000 per installment, three times a year",
                "application_process", "Apply through PM-KISAN portal or local CSC",
                "contact_info", "Helpline: 155261",
                "state", "National",
                "category", "Financial Support",
                "active", true
            ),
            Map.of(
                "id", "2",
                "name", "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                "description", "Crop insurance scheme to provide financial support to farmers suffering crop loss/damage arising out of unforeseen events.",
                "eligibility", "All farmers growing notified crops in a notified area",
                "benefits", "Comprehensive insurance cover against failure of the crop",
                "application_process", "Apply at nearest bank branch or PMFBY portal",
                "contact_info", "PMFBY Helpline",
                "state", "National",
                "category", "Insurance",
                "active", true
            ),
            Map.of(
                "id", "3",
                "name", "Paramparagat Krishi Vikas Yojana (PKVY)",
                "description", "Promoting organic farming through cluster approach.",
                "eligibility", "Farmers forming a cluster of 50 acres",
                "benefits", "Financial assistance for organic inputs, certification, and marketing",
                "application_process", "Contact local Agriculture Department",
                "contact_info", "State Agriculture Department",
                "state", "National",
                "category", "Organic Farming",
                "active", true
            )
        ));
    }
}

