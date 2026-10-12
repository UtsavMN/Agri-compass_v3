package com.agricompass.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_notifications",
    indexes = {
        @Index(name = "idx_notification_recipient", columnList = "recipient_user_id")
    }
)
public class Notification {

    @Id
    private String id;

    @Column(name = "recipient_user_id", nullable = false)
    private String recipientUserId;

    @Column(name = "sender_user_id")
    private String senderUserId;

    @Column(name = "author_name")
    private String authorName;

    @Column(name = "author_avatar", columnDefinition = "TEXT")
    private String authorAvatar;

    @Column(nullable = false)
    private String type; // "MARKETPLACE_INTEREST", "POST", "FARM_UPDATE"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    private String link;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "created_at", updatable = false)
    private String createdAt;

    public Notification() {}

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now().toString();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(String recipientUserId) { this.recipientUserId = recipientUserId; }

    public String getSenderUserId() { return senderUserId; }
    public void setSenderUserId(String senderUserId) { this.senderUserId = senderUserId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
