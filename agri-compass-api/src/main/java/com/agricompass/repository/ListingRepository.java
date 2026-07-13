package com.agricompass.repository;

import com.agricompass.entity.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ListingRepository extends JpaRepository<Listing, Long> {

    @Query("SELECT l FROM Listing l WHERE l.active = true AND " +
           "(:category = '' OR LOWER(l.category) = LOWER(:category)) AND " +
           "(:type = '' OR LOWER(l.listingType) = LOWER(:type)) AND " +
           "(:district = '' OR LOWER(l.location) LIKE LOWER(CONCAT('%', :district, '%'))) AND " +
           "(:search = '' OR LOWER(l.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(l.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Listing> findWithFilters(@Param("category") String category,
                                  @Param("type") String type,
                                  @Param("district") String district,
                                  @Param("search") String search,
                                  Pageable pageable);
}
