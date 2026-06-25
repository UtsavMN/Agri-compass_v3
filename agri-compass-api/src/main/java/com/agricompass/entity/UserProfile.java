package com.agricompass.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @Column(name = "clerk_user_id")
    private String clerkUserId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "username_handle", unique = true, nullable = false)
    private String usernameHandle;

    private String phone;

    @Column(nullable = false)
    private String district;

    private String state = "Karnataka";

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    private String bio;

    private String language = "kn";

    @Column(name = "onboarding_completed")
    private Integer onboardingCompleted = 0;

    @Column(name = "created_at", insertable = false, updatable = false)
    private String createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private String updatedAt;

    public UserProfile() {}

    public String getClerkUserId() { return clerkUserId; }
    public void setClerkUserId(String clerkUserId) { this.clerkUserId = clerkUserId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getUsernameHandle() { return usernameHandle; }
    public void setUsernameHandle(String usernameHandle) { this.usernameHandle = usernameHandle; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public Integer getOnboardingCompleted() { return onboardingCompleted; }
    public void setOnboardingCompleted(Integer onboardingCompleted) { this.onboardingCompleted = onboardingCompleted; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
