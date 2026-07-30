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

    public NotificationController(
            FollowRepository followRepository,
            PostRepository postRepository,
            FarmUpdateRepository farmUpdateRepository,
            UserProfileRepository userProfileRepository,
            UserService userService) {
        this.followRepository = followRepository;
        this.postRepository = postRepository;
        this.farmUpdateRepository = farmUpdateRepository;
        this.userProfileRepository = userProfileRepository;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications() {
        String currentUserId = userService.syncUser(null).getId();

        // Get followed users
        List<String> followedUserIds = followRepository.findByFollowerId(currentUserId)
                .stream()
                .map(Follow::getFollowingId)
                .collect(Collectors.toList());

        List<Map<String, Object>> notifications = new ArrayList<>();

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
