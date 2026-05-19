package com.agricompass.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "profiles",
    indexes = {
        @Index(name = "idx_userprofile_district", columnList = "district")
    }
)
public class UserProfile {

    @Id
    private String id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(name = "district")
    private String district;

    @Column(columnDefinition = "TEXT")
    private String preferences; // JSON string

    private String username;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    private String email;

    private String phone;

    private String location;

    @Column(name = "language_preference")
    private String languagePreference;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public UserProfile() {}

    public UserProfile(String id, User user, String district, String preferences, String username, String fullName, String avatarUrl, String email, String phone, String location, String languagePreference, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.district = district;
        this.preferences = preferences;
        this.username = username;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.email = email;
        this.phone = phone;
        this.location = location;
        this.languagePreference = languagePreference;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getPreferences() { return preferences; }
    public void setPreferences(String preferences) { this.preferences = preferences; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getLanguagePreference() { return languagePreference; }
    public void setLanguagePreference(String languagePreference) { this.languagePreference = languagePreference; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static UserProfileBuilder builder() {
        return new UserProfileBuilder();
    }

    public static class UserProfileBuilder {
        private String id;
        private User user;
        private String district;
        private String preferences;
        private String username;
        private String fullName;
        private String avatarUrl;
        private String email;
        private String phone;
        private String location;
        private String languagePreference;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        UserProfileBuilder() {}

        public UserProfileBuilder id(String id) { this.id = id; return this; }
        public UserProfileBuilder user(User user) { this.user = user; return this; }
        public UserProfileBuilder district(String district) { this.district = district; return this; }
        public UserProfileBuilder preferences(String preferences) { this.preferences = preferences; return this; }
        public UserProfileBuilder username(String username) { this.username = username; return this; }
        public UserProfileBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public UserProfileBuilder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public UserProfileBuilder email(String email) { this.email = email; return this; }
        public UserProfileBuilder phone(String phone) { this.phone = phone; return this; }
        public UserProfileBuilder location(String location) { this.location = location; return this; }
        public UserProfileBuilder languagePreference(String languagePreference) { this.languagePreference = languagePreference; return this; }
        public UserProfileBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UserProfileBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public UserProfile build() {
            return new UserProfile(id, user, district, preferences, username, fullName, avatarUrl, email, phone, location, languagePreference, createdAt, updatedAt);
        }
    }
}
