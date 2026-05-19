package com.agricompass.repository;

import com.agricompass.entity.CropAiScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CropAiScoreRepository extends JpaRepository<CropAiScore, Long> {
    Optional<CropAiScore> findByCropId(Long cropId);
}
