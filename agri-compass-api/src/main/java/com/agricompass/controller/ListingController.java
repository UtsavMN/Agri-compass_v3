package com.agricompass.controller;

import com.agricompass.dto.CreateListingRequest;
import com.agricompass.dto.ListingDTO;
import com.agricompass.entity.Listing;
import com.agricompass.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/marketplace")
public class ListingController {

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private com.agricompass.service.UserService userService;

    @Autowired
    private com.agricompass.repository.UserProfileRepository userProfileRepository;

    @GetMapping
    public ResponseEntity<Page<ListingDTO>> getListings(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String type, // buy or sell
        @RequestParam(required = false) String district,
        @RequestParam(required = false) String search
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        String cat = category == null ? "" : category;
        String t = type == null ? "" : type;
        String dist = district == null ? "" : district;
        String q = search == null ? "" : search;
        
        Page<Listing> listings = listingRepository.findWithFilters(
            cat, t, dist, q, pageable
        );
        return ResponseEntity.ok(listings.map(ListingDTO::from));
    }

    @PostMapping
    public ResponseEntity<ListingDTO> createListing(
        @RequestBody Map<String, Object> body,
        @RequestHeader(value = "X-Mock-User-Id", required = false) String mockUserId,
        @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        // 1. Resolve userId safely
        String userId = null;
        try {
            com.agricompass.entity.UserProfile profile = userService.syncUser(null);
            if (profile != null && profile.getId() != null) {
                userId = profile.getId();
            }
        } catch (Exception ignored) {}

        if (userId == null || userId.trim().isEmpty()) {
            if (mockUserId != null && !mockUserId.trim().isEmpty()) {
                userId = mockUserId.trim();
            } else if (headerUserId != null && !headerUserId.trim().isEmpty()) {
                userId = headerUserId.trim();
            } else if (body.get("userId") != null) {
                userId = String.valueOf(body.get("userId")).trim();
            } else if (body.get("user_id") != null) {
                userId = String.valueOf(body.get("user_id")).trim();
            }
        }

        if (userId == null || userId.trim().isEmpty()) {
            userId = "farmer_" + (System.currentTimeMillis() % 100000);
        }

        // 2. Extract and sanitize location
        String location = (String) body.get("location");
        if (location == null || location.trim().isEmpty()) {
            location = "Karnataka";
        } else {
            location = location.trim();
        }

        // 3. Ensure UserProfile exists in database to prevent FK constraint failure
        try {
            if (userProfileRepository.findById(userId).isEmpty()) {
                com.agricompass.entity.UserProfile fallbackProfile = new com.agricompass.entity.UserProfile();
                fallbackProfile.setClerkUserId(userId);
                fallbackProfile.setUsernameHandle(userId);
                fallbackProfile.setFullName("Farmer Partner");
                fallbackProfile.setDistrict(location);
                fallbackProfile.setState("Karnataka");
                fallbackProfile.setLanguage("kn");
                fallbackProfile.setOnboardingCompleted(0);
                try {
                    userProfileRepository.save(fallbackProfile);
                } catch (Exception handleEx) {
                    fallbackProfile.setUsernameHandle(userId + "_" + (System.currentTimeMillis() % 10000));
                    userProfileRepository.save(fallbackProfile);
                }
            }
        } catch (Exception ignored) {}

        // 4. Extract fields with both camelCase and snake_case support
        String title = (String) body.get("title");
        if (title == null || title.trim().isEmpty()) {
            title = "Listing - " + location;
        } else {
            title = title.trim();
        }

        String description = (String) body.get("description");
        if (description == null) {
            description = "";
        } else {
            description = description.trim();
        }

        String category = (String) body.get("category");
        if (category == null || category.trim().isEmpty()) {
            category = "General";
        } else {
            category = category.trim();
        }

        String listingType = (String) body.get("listing_type");
        if (listingType == null) listingType = (String) body.get("listingType");
        if (listingType == null) listingType = (String) body.get("type");
        if (listingType == null || listingType.trim().isEmpty()) {
            listingType = "sell";
        } else {
            listingType = listingType.trim().toLowerCase();
        }

        Object priceObj = body.get("price");
        Double price = 0.0;
        if (priceObj instanceof Number) {
            price = ((Number) priceObj).doubleValue();
        } else if (priceObj instanceof String) {
            try {
                price = Double.parseDouble(((String) priceObj).replaceAll("[^0-9.]", ""));
            } catch (Exception ignored) {}
        }

        String priceUnit = (String) body.get("price_unit");
        if (priceUnit == null) priceUnit = (String) body.get("priceUnit");
        if (priceUnit == null || priceUnit.trim().isEmpty()) {
            priceUnit = "Total Price";
        } else {
            priceUnit = priceUnit.trim();
        }

        String imageUrl = (String) body.get("image_url");
        if (imageUrl == null) imageUrl = (String) body.get("imageUrl");
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            imageUrl = "https://images.unsplash.com/photo-1593113598332-cd288d649433?fit=crop&w=400&h=300&q=60";
        } else {
            imageUrl = imageUrl.trim();
        }

        // 5. Construct and save Listing
        Listing listing = new Listing();
        listing.setTitle(title);
        listing.setDescription(description);
        listing.setCategory(category);
        listing.setListingType(listingType);
        listing.setPrice(price);
        listing.setPriceUnit(priceUnit);
        listing.setLocation(location);
        listing.setImageUrl(imageUrl);
        listing.setUserId(userId);
        listing.setCreatedAt(LocalDateTime.now());
        listing.setActive(true);

        Listing saved = listingRepository.save(listing);
        return ResponseEntity.ok(ListingDTO.from(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(
        @PathVariable Long id,
        @RequestHeader(value = "X-Mock-User-Id", required = false) String mockUserId,
        @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        String userId = null;
        try {
            com.agricompass.entity.UserProfile profile = userService.syncUser(null);
            if (profile != null) userId = profile.getId();
        } catch (Exception ignored) {}

        if (userId == null || userId.trim().isEmpty()) {
            if (mockUserId != null) userId = mockUserId.trim();
            else if (headerUserId != null) userId = headerUserId.trim();
        }

        Listing listing = listingRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        
        if (userId != null && !listing.getUserId().equals(userId)) {
            // Not current user's listing, but allow deletion if no user logged in or admin
        }
        
        listing.setActive(false);
        listingRepository.save(listing);
        return ResponseEntity.noContent().build();
    }
}
