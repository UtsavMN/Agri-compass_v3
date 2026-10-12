package com.agricompass.controller;

import com.agricompass.entity.Follow;
import com.agricompass.entity.FarmUpdate;
import com.agricompass.entity.Post;
import com.agricompass.entity.UserProfile;
import com.agricompass.repository.FarmUpdateRepository;
import com.agricompass.repository.FollowRepository;
import com.agricompass.repository.PostRepository;
import com.agricompass.repository.UserProfileRepository;
import com.agricompass.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final FollowRepository followRepository;
    private final PostRepository postRepository;
    private final FarmUpdateRepository farmUpdateRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserService userService;
    private final com.agricompass.repository.NotificationRepository notificationRepository;

    public NotificationController(
            FollowRepository followRepository,
            PostRepository postRepository,
            FarmUpdateRepository farmUpdateRepository,
            UserProfileRepository userProfileRepository,
            UserService userService,
            com.agricompass.repository.NotificationRepository notificationRepository) {
        this.followRepository = followRepository;
        this.postRepository = postRepository;
        this.farmUpdateRepository = farmUpdateRepository;
        this.userProfileRepository = userProfileRepository;
        this.userService = userService;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications() {
        String currentUserId = null;
        try {
            UserProfile user = userService.syncUser(null);
            if (user != null) currentUserId = user.getId();
        } catch (Exception ignored) {}

        List<Map<String, Object>> notifications = new ArrayList<>();

        if (currentUserId == null || currentUserId.isEmpty()) {
            return ResponseEntity.ok(Map.of("notifications", notifications));
        }

        // 1. Fetch direct user notifications (such as marketplace buyer inquiries)
        try {
            List<com.agricompass.entity.Notification> directNotifs = notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(currentUserId);
            for (com.agricompass.entity.Notification n : directNotifs) {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", n.getId());
                dto.put("type", n.getType());
                dto.put("message", n.getMessage());
                dto.put("timestamp", n.getCreatedAt());
                dto.put("link", n.getLink() != null ? n.getLink() : "/community");
                dto.put("authorName", n.getAuthorName() != null ? n.getAuthorName() : "Farmer Partner");
                dto.put("authorAvatar", n.getAuthorAvatar());
                notifications.add(dto);
            }
        } catch (Exception ignored) {}

        // 2. Get followed users
        List<String> followedUserIds = followRepository.findByFollowerId(currentUserId)
                .stream()
                .map(Follow::getFollowingId)
                .collect(Collectors.toList());

        if (!followedUserIds.isEmpty()) {
            // Get recent posts
            List<Post> recentPosts = postRepository.findByClerkUserIdInOrderByCreatedAtDesc(followedUserIds);
            for (Post post : recentPosts) {
                notifications.add(createNotificationDTO(
                        "POST",
                        post.getId(),
                        post.getClerkUserId(),
                        post.getContent(),
                        post.getCreatedAt(),
                        "/post/" + post.getId()
                ));
            }

            // Get recent farm updates
            List<FarmUpdate> recentUpdates = farmUpdateRepository.findByClerkUserIdInOrderByCreatedAtDesc(followedUserIds);
            for (FarmUpdate update : recentUpdates) {
                notifications.add(createNotificationDTO(
                        "FARM_UPDATE",
                        update.getId(),
                        update.getClerkUserId(),
                        update.getPostText(),
                        update.getCreatedAt(),
                        "/profile/" + update.getClerkUserId() // Fixed route to /profile/
                ));
            }
        }

        // Sort by timestamp descending
        notifications.sort((a, b) -> {
            String timeA = (String) a.get("timestamp");
            String timeB = (String) b.get("timestamp");
            timeA = timeA == null ? "" : timeA;
            timeB = timeB == null ? "" : timeB;
            return timeB.compareTo(timeA);
        });

        // Limit to 50 recent notifications
        if (notifications.size() > 50) {
            notifications = notifications.subList(0, 50);
        }

        return ResponseEntity.ok(Map.of("notifications", notifications));
    }

    private Map<String, Object> createNotificationDTO(String type, String id, String authorId, String message, String timestamp, String link) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", id);
        dto.put("type", type);
        dto.put("message", message);
        dto.put("timestamp", timestamp);
        dto.put("link", link);
        
        userProfileRepository.findById(authorId).ifPresentOrElse(profile -> {
            dto.put("authorName", profile.getFullName() != null ? profile.getFullName() : profile.getUsername());
            dto.put("authorAvatar", profile.getAvatarUrl());
        }, () -> {
            dto.put("authorName", "Unknown Farmer");
            dto.put("authorAvatar", null);
        });
        
        return dto;
    }
}
