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

    @Autowired
    private com.agricompass.repository.NotificationRepository notificationRepository;

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
        com.agricompass.entity.UserProfile userProfile = userProfileRepository.findById(userId).orElse(null);
        try {
            if (userProfile == null) {
                com.agricompass.entity.UserProfile fallbackProfile = new com.agricompass.entity.UserProfile();
                fallbackProfile.setClerkUserId(userId);
                fallbackProfile.setUsernameHandle(userId);
                fallbackProfile.setFullName("Farmer Partner");
                fallbackProfile.setDistrict(location);
                fallbackProfile.setState("Karnataka");
                fallbackProfile.setLanguage("kn");
                fallbackProfile.setOnboardingCompleted(0);
                try {
                    userProfile = userProfileRepository.save(fallbackProfile);
                } catch (Exception handleEx) {
                    fallbackProfile.setUsernameHandle(userId + "_" + (System.currentTimeMillis() % 10000));
                    userProfile = userProfileRepository.save(fallbackProfile);
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

        String address = (String) body.get("address");
        if (address == null || address.trim().isEmpty()) {
            address = location;
        } else {
            address = address.trim();
        }

        String contactPhone = (String) body.get("contact_phone");
        if (contactPhone == null) contactPhone = (String) body.get("contactPhone");
        if (contactPhone == null) contactPhone = (String) body.get("phone");
        if ((contactPhone == null || contactPhone.trim().isEmpty()) && userProfile != null) {
            contactPhone = userProfile.getPhone();
        }
        if (contactPhone == null || contactPhone.trim().isEmpty()) {
            contactPhone = null;
        } else {
            contactPhone = contactPhone.trim();
        }

        String quantity = body.get("quantity") != null ? String.valueOf(body.get("quantity")).trim() : "1";
        String quantityUnit = (String) body.get("quantity_unit");
        if (quantityUnit == null) quantityUnit = (String) body.get("quantityUnit");
        if (quantityUnit == null || quantityUnit.trim().isEmpty()) quantityUnit = "Units";

        Boolean isNegotiable = false;
        if (body.get("is_negotiable") != null) {
            isNegotiable = Boolean.parseBoolean(String.valueOf(body.get("is_negotiable")));
        } else if (body.get("isNegotiable") != null) {
            isNegotiable = Boolean.parseBoolean(String.valueOf(body.get("isNegotiable")));
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
        listing.setAddress(address);
        listing.setContactPhone(contactPhone);
        listing.setQuantity(quantity);
        listing.setQuantityUnit(quantityUnit);
        listing.setIsNegotiable(isNegotiable);
        listing.setStatus("ACTIVE");
        listing.setImageUrl(imageUrl);
        listing.setUserId(userId);
        listing.setCreatedAt(LocalDateTime.now());
        listing.setActive(true);

        Listing saved = listingRepository.save(listing);
        return ResponseEntity.ok(ListingDTO.from(saved));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingDTO> getListingById(@PathVariable Long id) {
        Listing listing = listingRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        return ResponseEntity.ok(ListingDTO.from(listing));
    }

    @PostMapping("/{id}/buy")
    public ResponseEntity<Map<String, Object>> buyListing(
        @PathVariable Long id,
        @RequestBody(required = false) Map<String, Object> body
    ) {
        Listing listing = listingRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        
        listing.setActive(false);
        listing.setStatus("SOLD");
        listingRepository.save(listing);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Order confirmed! The listing has been marked as SOLD and removed from active marketplace.",
            "id", id,
            "status", "SOLD"
        ));
    }

    @PostMapping("/{id}/notify")
    public ResponseEntity<Map<String, Object>> notifySeller(
        @PathVariable Long id,
        @RequestBody(required = false) Map<String, Object> body,
        @RequestHeader(value = "X-Mock-User-Id", required = false) String mockUserId,
        @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        Listing listing = listingRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));

        String buyerId = null;
        try {
            com.agricompass.entity.UserProfile profile = userService.syncUser(null);
            if (profile != null) buyerId = profile.getId();
        } catch (Exception ignored) {}

        if (buyerId == null || buyerId.trim().isEmpty()) {
            if (mockUserId != null && !mockUserId.trim().isEmpty()) buyerId = mockUserId.trim();
            else if (headerUserId != null && !headerUserId.trim().isEmpty()) buyerId = headerUserId.trim();
            else if (body != null && body.get("buyerId") != null) buyerId = String.valueOf(body.get("buyerId")).trim();
            else if (body != null && body.get("buyer_id") != null) buyerId = String.valueOf(body.get("buyer_id")).trim();
        }

        String buyerName = "A buyer";
        String buyerAvatar = null;
        if (buyerId != null) {
            com.agricompass.entity.UserProfile buyerProfile = userProfileRepository.findById(buyerId).orElse(null);
            if (buyerProfile != null) {
                buyerName = buyerProfile.getFullName() != null && !buyerProfile.getFullName().isEmpty()
                    ? buyerProfile.getFullName() : buyerProfile.getUsername();
                buyerAvatar = buyerProfile.getAvatarUrl();
            }
        }
        if (body != null && body.get("buyerName") != null && !String.valueOf(body.get("buyerName")).isBlank()) {
            buyerName = String.valueOf(body.get("buyerName")).trim();
        }

        String customMsg = body != null && body.get("message") != null ? String.valueOf(body.get("message")).trim() : null;
        String notificationMessage = customMsg != null && !customMsg.isEmpty()
            ? buyerName + " is interested in your listing '" + listing.getTitle() + "': \"" + customMsg + "\""
            : buyerName + " expressed interest in purchasing '" + listing.getTitle() + "' (" + (listing.getPrice() != null ? listing.getPrice() : "") + " " + (listing.getPriceUnit() != null ? listing.getPriceUnit() : "") + ")!";

        if (listing.getUserId() != null && !listing.getUserId().isEmpty()) {
            com.agricompass.entity.Notification notification = new com.agricompass.entity.Notification();
            notification.setRecipientUserId(listing.getUserId());
            notification.setSenderUserId(buyerId);
            notification.setAuthorName(buyerName);
            notification.setAuthorAvatar(buyerAvatar);
            notification.setType("MARKETPLACE_INTEREST");
            notification.setMessage(notificationMessage);
            notification.setLink("/community");
            notificationRepository.save(notification);
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Notification sent to seller successfully!",
            "listingId", id
        ));
    }

    @PostMapping("/{id}/mark-sold")
    public ResponseEntity<Map<String, Object>> markSold(@PathVariable Long id) {
        return buyListing(id, null);
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
        
        listing.setActive(false);
        listing.setStatus("DELETED");
        listingRepository.save(listing);
        return ResponseEntity.noContent().build();
    }
}
