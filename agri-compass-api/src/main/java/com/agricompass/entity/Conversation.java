package com.agricompass.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "conversations")
public class Conversation {

    @Id
    private String id;

    @Column(name = "participant_one", nullable = false)
    private String participantOne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_one", insertable = false, updatable = false)
    private UserProfile participantOneProfile;

    @Column(name = "participant_two", nullable = false)
    private String participantTwo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_two", insertable = false, updatable = false)
    private UserProfile participantTwoProfile;

    @Column(name = "created_at", updatable = false)
    private String createdAt;

    public Conversation() {}

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = java.time.LocalDateTime.now().toString();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getParticipantOne() { return participantOne; }
    public void setParticipantOne(String participantOne) { this.participantOne = participantOne; }

    public UserProfile getParticipantOneProfile() { return participantOneProfile; }
    public void setParticipantOneProfile(UserProfile participantOneProfile) { this.participantOneProfile = participantOneProfile; }

    public String getParticipantTwo() { return participantTwo; }
    public void setParticipantTwo(String participantTwo) { this.participantTwo = participantTwo; }

    public UserProfile getParticipantTwoProfile() { return participantTwoProfile; }
    public void setParticipantTwoProfile(UserProfile participantTwoProfile) { this.participantTwoProfile = participantTwoProfile; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
