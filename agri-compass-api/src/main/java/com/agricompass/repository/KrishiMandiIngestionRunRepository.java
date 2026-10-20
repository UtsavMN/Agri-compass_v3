package com.agricompass.repository;

import com.agricompass.entity.KrishiMandiIngestionRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KrishiMandiIngestionRunRepository extends JpaRepository<KrishiMandiIngestionRun, String> {

    Optional<KrishiMandiIngestionRun> findFirstByOrderByStartedAtDesc();

    Optional<KrishiMandiIngestionRun> findFirstByStatusOrderByFinishedAtDesc(String status);

    default Optional<KrishiMandiIngestionRun> findLatestRun() {
        return findFirstByOrderByStartedAtDesc();
    }

    default Optional<KrishiMandiIngestionRun> findLatestSuccessfulRun() {
        return findFirstByStatusOrderByFinishedAtDesc("SUCCESS");
    }
}
