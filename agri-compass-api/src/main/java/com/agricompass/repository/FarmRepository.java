package com.agricompass.repository;

import com.agricompass.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FarmRepository extends JpaRepository<Farm, String> {
    List<Farm> findByUserId(String userId);
}
