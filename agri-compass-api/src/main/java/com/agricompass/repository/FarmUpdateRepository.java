package com.agricompass.repository;

import com.agricompass.entity.FarmUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmUpdateRepository extends JpaRepository<FarmUpdate, String> {
    List<FarmUpdate> findByFarmIdOrderByCreatedAtDesc(String farmId);
}
