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

@RestController
@RequestMapping("/api/marketplace")
public class ListingController {

    @Autowired
    private ListingRepository listingRepository;

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
        Page<Listing> listings = listingRepository.findWithFilters(
            category, type, district, search, pageable
        );
        return ResponseEntity.ok(listings.map(ListingDTO::from));
    }

    @PostMapping
    public ResponseEntity<ListingDTO> createListing(
        @RequestBody CreateListingRequest request,
        @RequestHeader("X-Mock-User-Id") String userId
    ) {
        Listing listing = new Listing();
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setCategory(request.getCategory());
        listing.setListingType(request.getListingType()); // buy or sell
        listing.setPrice(request.getPrice());
        listing.setPriceUnit(request.getPriceUnit());
        listing.setLocation(request.getLocation());
        listing.setImageUrl(request.getImageUrl());
        listing.setUserId(userId);
        listing.setCreatedAt(LocalDateTime.now());
        listing.setActive(true);

        Listing saved = listingRepository.save(listing);
        return ResponseEntity.ok(ListingDTO.from(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(
        @PathVariable Long id,
        @RequestHeader("X-Mock-User-Id") String userId
    ) {
        Listing listing = listingRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        if (!listing.getUserId().equals(userId))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        
        listing.setActive(false);
        listingRepository.save(listing);
        return ResponseEntity.noContent().build();
    }
}
