package com.agricompass.controller;

import com.agricompass.entity.Follow;
import com.agricompass.entity.FarmUpdate;
import com.agricompass.entity.Notification;
import com.agricompass.entity.Post;
import com.agricompass.entity.UserProfile;
import com.agricompass.repository.FarmUpdateRepository;
import com.agricompass.repository.FollowRepository;
import com.agricompass.repository.NotificationRepository;
import com.agricompass.repository.PostRepository;
import com.agricompass.repository.UserProfileRepository;
import com.agricompass.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    private final NotificationRepository notificationRepository;

    public NotificationController(
            FollowRepository followRepository,
            PostRepository postRepository,
            FarmUpdateRepository farmUpdateRepository,
            UserProfileRepository userProfileRepository,
            UserService userService,
            NotificationRepository notificationRepository) {
        this.followRepository = followRepository;
        this.postRepository = postRepository;
        this.farmUpdateRepository = farmUpdateRepository;
        this.userProfileRepository = userProfileRepository;
        this.userService = userService;
        this.notificationRepository = notificationRepository;
    }

    private String resolveCurrentUserId(String headerUserId) {
        try {
            UserProfile user = userService.syncUser(null);
            if (user != null && user.getId() != null) {
                return user.getId();
            }
        } catch (Exception ignored) {}

        if (headerUserId != null && !headerUserId.trim().isEmpty()) {
            return headerUserId.trim();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String currentUserId = resolveCurrentUserId(headerUserId);

        List<Map<String, Object>> notifications = new ArrayList<>();

        if (currentUserId == null || currentUserId.isEmpty()) {
            return ResponseEntity.ok(Map.of("notifications", notifications, "unreadCount", 0));
        }

        // 1. Fetch direct user notifications (likes, comments, follows, marketplace buyer inquiries)
        try {
            List<Notification> directNotifs = notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(currentUserId);
            for (Notification n : directNotifs) {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", n.getId());
                dto.put("type", n.getType());
                dto.put("message", n.getMessage());
                dto.put("timestamp", n.getCreatedAt());
                dto.put("link", n.getLink() != null ? n.getLink() : "/community");
                dto.put("authorName", n.getAuthorName() != null ? n.getAuthorName() : "Farmer Partner");
                dto.put("authorAvatar", n.getAuthorAvatar());
                dto.put("senderUserId", n.getSenderUserId());
                dto.put("isRead", n.getIsRead() != null ? n.getIsRead() : false);
                notifications.add(dto);
            }
        } catch (Exception ignored) {}

        // 2. Get followed users' activities (posts, farm updates)
        try {
            List<String> followedUserIds = followRepository.findByFollowerId(currentUserId)
                    .stream()
                    .map(Follow::getFollowingId)
                    .collect(Collectors.toList());

            if (!followedUserIds.isEmpty()) {
                // Get recent posts
                List<Post> recentPosts = postRepository.findByClerkUserIdInOrderByCreatedAtDesc(followedUserIds);
                for (Post post : recentPosts) {
                    Map<String, Object> dto = createNotificationDTO(
                            "POST",
                            post.getId(),
                            post.getClerkUserId(),
                            post.getContent(),
                            post.getCreatedAt(),
                            "/post/" + post.getId()
                    );
                    dto.put("isRead", true); // Followed activity stream treated as viewed in feed
                    notifications.add(dto);
                }

                // Get recent farm updates
                List<FarmUpdate> recentUpdates = farmUpdateRepository.findByClerkUserIdInOrderByCreatedAtDesc(followedUserIds);
                for (FarmUpdate update : recentUpdates) {
                    Map<String, Object> dto = createNotificationDTO(
                            "FARM_UPDATE",
                            update.getId(),
                            update.getClerkUserId(),
                            update.getPostText(),
                            update.getCreatedAt(),
                            "/profile/" + update.getClerkUserId()
                    );
                    dto.put("isRead", true);
                    notifications.add(dto);
                }
            }
        } catch (Exception ignored) {}

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

        long unreadCount = 0;
        try {
            unreadCount = notificationRepository.countUnreadByRecipientUserId(currentUserId);
        } catch (Exception ignored) {}

        return ResponseEntity.ok(Map.of("notifications", notifications, "unreadCount", unreadCount));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String currentUserId = resolveCurrentUserId(headerUserId);
        if (currentUserId == null || currentUserId.isEmpty()) {
            return ResponseEntity.ok(Map.of("count", 0));
        }

        long unreadCount = 0;
        try {
            unreadCount = notificationRepository.countUnreadByRecipientUserId(currentUserId);
        } catch (Exception ignored) {}

        return ResponseEntity.ok(Map.of("count", unreadCount));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String currentUserId = resolveCurrentUserId(headerUserId);
        if (currentUserId != null && !currentUserId.isEmpty()) {
            try {
                notificationRepository.markAllAsRead(currentUserId);
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(Map.of("success", true, "count", 0));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String currentUserId = resolveCurrentUserId(headerUserId);
        if (currentUserId != null && !currentUserId.isEmpty()) {
            try {
                notificationRepository.markAsRead(id, currentUserId);
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    private Map<String, Object> createNotificationDTO(String type, String id, String authorId, String message, String timestamp, String link) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", id);
        dto.put("type", type);
        dto.put("message", message);
        dto.put("timestamp", timestamp);
        dto.put("link", link);
        dto.put("isRead", true);
        
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
