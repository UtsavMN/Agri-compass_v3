package com.agricompass.controller;

import com.agricompass.entity.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class MessageController {

    private final SimpMessagingTemplate messagingTemplate;

    public MessageController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Message chatMessage) {
        // Here you would save the message to the DB
        // messageRepository.save(chatMessage);
        
        // Find recipient from conversation or pass recipientId in payload
        // For simplicity assuming there is a way to get recipientId, maybe from a DTO
        // string recipientId = ...
        
        // messagingTemplate.convertAndSendToUser(recipientId, "/queue/messages", chatMessage);
    }
}
