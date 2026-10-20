package com.agricompass.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "krishi_mandi_ingestion_runs", indexes = {
    @Index(name = "idx_run_started_at", columnList = "started_at")
})
public class KrishiMandiIngestionRun {

    @Id
    private String id;

    @Column(nullable = false)
    private String source = "KRISHI_MARATA_VAHINI";

    @Column(name = "report_date")
    private String reportDate;

    @Column(name = "started_at", nullable = false)
    private String startedAt;

    @Column(name = "finished_at")
    private String finishedAt;

    @Column(nullable = false)
    private String status; // SUCCESS, PARTIAL, FAILED

    @Column(name = "total_records_received")
    private int totalRecordsReceived;

    @Column(name = "valid_records_count")
    private int validRecordsCount;

    @Column(name = "rejected_records_count")
    private int rejectedRecordsCount;

    @Column(name = "completeness_established")
    private boolean completenessEstablished = false;

    @Column(name = "coverage_state")
    private String coverageState = "COVERAGE_UNVERIFIED";

    @Column(name = "coverage_message")
    private String coverageMessage = "Local dataset validated — coverage unverified";

    @Column(name = "rejection_summary", length = 4000)
    private String rejectionSummary;

    public KrishiMandiIngestionRun() {}

    @PrePersist
    public void onPrePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.startedAt == null) {
            this.startedAt = Instant.now().toString();
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getReportDate() { return reportDate; }
    public void setReportDate(String reportDate) { this.reportDate = reportDate; }

    public String getStartedAt() { return startedAt; }
    public void setStartedAt(String startedAt) { this.startedAt = startedAt; }

    public String getFinishedAt() { return finishedAt; }
    public void setFinishedAt(String finishedAt) { this.finishedAt = finishedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getTotalRecordsReceived() { return totalRecordsReceived; }
    public void setTotalRecordsReceived(int totalRecordsReceived) { this.totalRecordsReceived = totalRecordsReceived; }

    public int getValidRecordsCount() { return validRecordsCount; }
    public void setValidRecordsCount(int validRecordsCount) { this.validRecordsCount = validRecordsCount; }

    public int getRejectedRecordsCount() { return rejectedRecordsCount; }
    public void setRejectedRecordsCount(int rejectedRecordsCount) { this.rejectedRecordsCount = rejectedRecordsCount; }

    public boolean isCompletenessEstablished() { return completenessEstablished; }
    public void setCompletenessEstablished(boolean completenessEstablished) { this.completenessEstablished = completenessEstablished; }

    public String getCoverageState() { return coverageState; }
    public void setCoverageState(String coverageState) { this.coverageState = coverageState; }

    public String getCoverageMessage() { return coverageMessage; }
    public void setCoverageMessage(String coverageMessage) { this.coverageMessage = coverageMessage; }

    public String getRejectionSummary() { return rejectionSummary; }
    public void setRejectionSummary(String rejectionSummary) { this.rejectionSummary = rejectionSummary; }
}
