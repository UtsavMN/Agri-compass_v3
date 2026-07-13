package com.agricompass.controller;

import com.agricompass.entity.Conversation;
import com.agricompass.entity.Message;
import com.agricompass.entity.UserProfile;
import com.agricompass.repository.ConversationRepository;
import com.agricompass.repository.MessageRepository;
import com.agricompass.repository.UserProfileRepository;
import com.agricompass.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserService userService;

    public ConversationController(ConversationRepository conversationRepository, MessageRepository messageRepository, UserProfileRepository userProfileRepository, UserService userService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userProfileRepository = userProfileRepository;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getConversations() {
        String currentUserId = userService.syncUser(null).getId();
        List<Conversation> conversations = conversationRepository.findByParticipant(currentUserId);
        
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Batch fetch all user profiles to prevent N+1 query issue
        List<String> otherUserIds = conversations.stream()
                .map(c -> c.getParticipantOne().equals(currentUserId) ? c.getParticipantTwo() : c.getParticipantOne())
                .collect(java.util.stream.Collectors.toList());
        
        List<UserProfile> profiles = userProfileRepository.findAllById(otherUserIds);
        Map<String, UserProfile> profileMap = new HashMap<>();
        for (UserProfile p : profiles) {
            profileMap.put(p.getId(), p);
        }

        for (Conversation c : conversations) {
            String otherUserId = c.getParticipantOne().equals(currentUserId) ? c.getParticipantTwo() : c.getParticipantOne();
            UserProfile otherProfile = profileMap.get(otherUserId);
            
            Message latestMessage = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(c.getId());
            
            int unreadCount = messageRepository.countByConversationIdAndReadAtIsNullAndSenderIdNot(c.getId(), currentUserId);
            
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", otherUserId);
            userMap.put("fullName", otherProfile != null && otherProfile.getFullName() != null ? otherProfile.getFullName() : (otherProfile != null ? otherProfile.getUsername() : "Unknown"));
            userMap.put("profilePictureUrl", otherProfile != null ? otherProfile.getAvatarUrl() : null);
            map.put("otherUser", userMap);
            
            map.put("latestMessage", latestMessage != null ? latestMessage.getContent() : "");
            map.put("updatedAt", latestMessage != null && latestMessage.getCreatedAt() != null ? latestMessage.getCreatedAt() : (c.getCreatedAt() != null ? c.getCreatedAt() : null));
            map.put("unreadCount", unreadCount);
            
            result.add(map);
        }
        
        result.sort((a, b) -> {
            Object t1Obj = a.get("updatedAt");
            Object t2Obj = b.get("updatedAt");
            String t1 = t1Obj != null ? t1Obj.toString() : null;
            String t2 = t2Obj != null ? t2Obj.toString() : null;
            
            if (t1 == null && t2 == null) return 0;
            if (t1 == null) return 1;
            if (t2 == null) return -1;
            return t2.compareTo(t1);
        });
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getOrCreateConversation(@PathVariable String userId) {
        String currentUserId = userService.syncUser(null).getId();
        Conversation c = conversationRepository.findByParticipants(currentUserId, userId).orElseGet(() -> {
            Conversation newConv = new Conversation();
            newConv.setParticipantOne(currentUserId);
            newConv.setParticipantTwo(userId);
            return conversationRepository.save(newConv);
        });
        
        Map<String, Object> map = new HashMap<>();
        map.put("id", c.getId());
        return ResponseEntity.ok(map);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount() {
        String currentUserId = userService.syncUser(null).getId();
        List<Conversation> conversations = conversationRepository.findByParticipant(currentUserId);
        int totalUnread = 0;
        for (Conversation c : conversations) {
            totalUnread += messageRepository.countByConversationIdAndReadAtIsNullAndSenderIdNot(c.getId(), currentUserId);
        }
        return ResponseEntity.ok(Map.of("count", totalUnread));
    }
}
