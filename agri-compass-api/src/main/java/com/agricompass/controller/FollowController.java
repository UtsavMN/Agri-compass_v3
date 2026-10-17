package com.agricompass.controller;

import com.agricompass.entity.Follow;
import com.agricompass.entity.FollowId;
import com.agricompass.entity.Notification;
import com.agricompass.entity.UserProfile;
import com.agricompass.repository.FollowRepository;
import com.agricompass.repository.NotificationRepository;
import com.agricompass.repository.UserProfileRepository;
import com.agricompass.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/follows")
public class FollowController {

    private final FollowRepository followRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserService userService;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public FollowController(
            FollowRepository followRepository,
            UserProfileRepository userProfileRepository,
            UserService userService,
            NotificationRepository notificationRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.followRepository = followRepository;
        this.userProfileRepository = userProfileRepository;
        this.userService = userService;
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    private String resolveUserId(String headerUserId) {
        try {
            UserProfile p = userService.syncUser(null);
            if (p != null && p.getId() != null) return p.getId();
        } catch (Exception ignored) {}
        if (headerUserId != null && !headerUserId.trim().isEmpty()) {
            return headerUserId.trim();
        }
        return null;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> followUser(
            @PathVariable String userId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String currentUserId = resolveUserId(headerUserId);
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }
        if (currentUserId.equals(userId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot follow yourself"));
        }
        
        FollowId followId = new FollowId(currentUserId, userId);
        boolean isNew = false;
        if (!followRepository.existsById(followId)) {
            followRepository.save(new Follow(currentUserId, userId));
            isNew = true;
        }

        if (isNew) {
            try {
                UserProfile follower = userProfileRepository.findById(currentUserId).orElse(null);
                String followerName = follower != null && follower.getFullName() != null 
                        ? follower.getFullName() : (follower != null ? follower.getUsername() : "A farmer");
                String followerAvatar = follower != null ? follower.getAvatarUrl() : null;

                Notification notif = new Notification();
                notif.setRecipientUserId(userId);
                notif.setSenderUserId(currentUserId);
                notif.setAuthorName(followerName);
                notif.setAuthorAvatar(followerAvatar);
                notif.setType("FOLLOW"); // Extensible for private account FOLLOW_REQUEST in future
                notif.setMessage(followerName + " started following you");
                notif.setLink("/profile/" + currentUserId);
                notif.setIsRead(false);
                notificationRepository.save(notif);

                if (messagingTemplate != null) {
                    Map<String, Object> payload = new HashMap<>();
                    payload.put("id", notif.getId());
                    payload.put("type", notif.getType());
                    payload.put("message", notif.getMessage());
                    payload.put("timestamp", notif.getCreatedAt());
                    payload.put("link", notif.getLink());
                    payload.put("authorName", notif.getAuthorName());
                    payload.put("authorAvatar", notif.getAuthorAvatar());
                    payload.put("senderUserId", notif.getSenderUserId());
                    payload.put("isRead", false);
                    messagingTemplate.convertAndSend("/topic/notifications." + userId, payload);
                }
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> unfollowUser(
            @PathVariable String userId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String currentUserId = resolveUserId(headerUserId);
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }
        FollowId followId = new FollowId(currentUserId, userId);
        followRepository.findById(followId).ifPresent(followRepository::delete);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/{userId}/status")
    public ResponseEntity<Map<String, Object>> getFollowStatus(
            @PathVariable String userId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String currentUserId = resolveUserId(headerUserId);
        if (currentUserId == null) {
            return ResponseEntity.ok(Map.of("isFollowing", false));
        }
        boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(currentUserId, userId);
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<Map<String, Object>> getFollowers(@PathVariable String userId) {
        List<Follow> follows = followRepository.findByFollowingId(userId);
        List<Map<String, Object>> users = follows.stream().map(f -> getUserDto(f.getFollowerId())).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("users", users));
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<Map<String, Object>> getFollowing(@PathVariable String userId) {
        List<Follow> follows = followRepository.findByFollowerId(userId);
        List<Map<String, Object>> users = follows.stream().map(f -> getUserDto(f.getFollowingId())).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("users", users));
    }

    private Map<String, Object> getUserDto(String clerkUserId) {
        Map<String, Object> map = new HashMap<>();
        map.put("clerkUserId", clerkUserId);
        userProfileRepository.findById(clerkUserId).ifPresentOrElse(profile -> {
            map.put("fullName", profile.getFullName() != null ? profile.getFullName() : profile.getUsername());
            map.put("usernameHandle", profile.getUsername());
            map.put("district", profile.getDistrict());
            map.put("profilePictureUrl", profile.getAvatarUrl());
        }, () -> {
            map.put("fullName", "Unknown Farmer");
            map.put("usernameHandle", "unknown");
        });
        return map;
    }
}
