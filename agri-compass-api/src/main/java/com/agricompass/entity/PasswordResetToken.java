package com.agricompass.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used;

    public PasswordResetToken() {}

    public PasswordResetToken(String id, User user, String tokenHash, LocalDateTime expiresAt, boolean used) {
        this.id = id;
        this.user = user;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.used = used;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }

    public static PasswordResetTokenBuilder builder() {
        return new PasswordResetTokenBuilder();
    }

    public static class PasswordResetTokenBuilder {
        private String id;
        private User user;
        private String tokenHash;
        private LocalDateTime expiresAt;
        private boolean used;

        PasswordResetTokenBuilder() {}

        public PasswordResetTokenBuilder id(String id) { this.id = id; return this; }
        public PasswordResetTokenBuilder user(User user) { this.user = user; return this; }
        public PasswordResetTokenBuilder tokenHash(String tokenHash) { this.tokenHash = tokenHash; return this; }
        public PasswordResetTokenBuilder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }
        public PasswordResetTokenBuilder used(boolean used) { this.used = used; return this; }

        public PasswordResetToken build() {
            return new PasswordResetToken(id, user, tokenHash, expiresAt, used);
        }
    }
}
