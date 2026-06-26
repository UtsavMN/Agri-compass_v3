package com.agricompass.controller;

import com.agricompass.entity.Conversation;
import com.agricompass.entity.Message;
import com.agricompass.repository.ConversationRepository;
import com.agricompass.repository.MessageRepository;
import com.agricompass.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageController(MessageRepository messageRepository, ConversationRepository conversationRepository, UserService userService, SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userService = userService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/{convId}")
    public ResponseEntity<List<Map<String, Object>>> getMessages(@PathVariable String convId) {
        String currentUserId = userService.syncUser(null).getId();
        
        Conversation c = conversationRepository.findById(convId).orElse(null);
        if (c == null || (!c.getParticipantOne().equals(currentUserId) && !c.getParticipantTwo().equals(currentUserId))) {
            return ResponseEntity.status(403).build();
        }

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(convId);
        List<Map<String, Object>> result = messages.stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("senderId", m.getSenderId());
            map.put("content", m.getContent());
            map.put("createdAt", m.getCreatedAt());
            map.put("isRead", m.getReadAt() != null);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/{convId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String convId) {
        String currentUserId = userService.syncUser(null).getId();
        List<Message> unread = messageRepository.findByConversationIdOrderByCreatedAtAsc(convId).stream()
                .filter(m -> m.getReadAt() == null && !m.getSenderId().equals(currentUserId))
                .collect(Collectors.toList());
        
        String now = LocalDateTime.now().toString();
        unread.forEach(m -> {
            m.setReadAt(now);
            messageRepository.save(m);
        });

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{convId}")
    public ResponseEntity<Map<String, Object>> sendMessage(@PathVariable String convId, @RequestBody Map<String, String> body) {
        String currentUserId = userService.syncUser(null).getId();
        
        Conversation c = conversationRepository.findById(convId).orElseThrow(() -> new RuntimeException("Not found"));
        
        Message m = new Message();
        m.setConversationId(convId);
        m.setSenderId(currentUserId);
        m.setContent(body.get("content"));
        m = messageRepository.save(m);
        
        // Notify via WebSocket
        String otherUserId = c.getParticipantOne().equals(currentUserId) ? c.getParticipantTwo() : c.getParticipantOne();
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", m.getId());
        payload.put("senderId", m.getSenderId());
        payload.put("content", m.getContent());
        payload.put("createdAt", m.getCreatedAt());
        payload.put("conversationId", convId);
        
        messagingTemplate.convertAndSend("/topic/messages." + otherUserId, payload);

        return ResponseEntity.ok(payload);
    }
}
