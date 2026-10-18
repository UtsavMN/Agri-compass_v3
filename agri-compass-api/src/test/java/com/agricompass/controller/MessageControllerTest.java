package com.agricompass.controller;

import com.agricompass.entity.Conversation;
import com.agricompass.entity.Message;
import com.agricompass.repository.ConversationRepository;
import com.agricompass.repository.MessageRepository;
import com.agricompass.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MessageControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private UserService userService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MessageController controller = new MessageController(
                messageRepository,
                conversationRepository,
                userService,
                messagingTemplate
        );
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("GET /api/messages/{convId} returns 401 when unauthenticated")
    void getMessages_unauthenticated_returns401() throws Exception {
        when(userService.syncUser(null)).thenReturn(null);

        mockMvc.perform(get("/api/messages/c-123"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/messages/{convId} returns 404 when conversation does not exist")
    void getMessages_conversationNotFound_returns404() throws Exception {
        when(userService.syncUser(null)).thenReturn(null);
        when(conversationRepository.findById("c-unknown")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/messages/c-unknown")
                        .header("X-User-Id", "user_1"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/messages/{convId} returns 403 when user is not a participant")
    void getMessages_notParticipant_returns403() throws Exception {
        Conversation c = new Conversation();
        c.setId("c-123");
        c.setParticipantOne("user_alice");
        c.setParticipantTwo("user_bob");

        when(userService.syncUser(null)).thenReturn(null);
        when(conversationRepository.findById("c-123")).thenReturn(Optional.of(c));

        mockMvc.perform(get("/api/messages/c-123")
                        .header("X-User-Id", "user_eve_imposter"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/messages/{convId} returns message list with read flags for authorized participant")
    void getMessages_authorized_returnsList() throws Exception {
        Conversation c = new Conversation();
        c.setId("c-123");
        c.setParticipantOne("user_alice");
        c.setParticipantTwo("user_bob");

        Message m1 = new Message();
        m1.setId("m-1");
        m1.setConversationId("c-123");
        m1.setSenderId("user_bob");
        m1.setContent("Hello Alice, how are your crops?");
        m1.setCreatedAt("2026-10-18T10:00:00Z");
        m1.setReadAt(null);

        Message m2 = new Message();
        m2.setId("m-2");
        m2.setConversationId("c-123");
        m2.setSenderId("user_alice");
        m2.setContent("Harvest is looking good!");
        m2.setCreatedAt("2026-10-18T10:05:00Z");
        m2.setReadAt("2026-10-18T10:06:00Z");

        when(userService.syncUser(null)).thenReturn(null);
        when(conversationRepository.findById("c-123")).thenReturn(Optional.of(c));
        when(messageRepository.findByConversationIdOrderByCreatedAtAsc("c-123")).thenReturn(List.of(m1, m2));

        mockMvc.perform(get("/api/messages/c-123")
                        .header("X-User-Id", "user_alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("m-1"))
                .andExpect(jsonPath("$[0].senderId").value("user_bob"))
                .andExpect(jsonPath("$[0].content").value("Hello Alice, how are your crops?"))
                .andExpect(jsonPath("$[0].isRead").value(false))
                .andExpect(jsonPath("$[1].id").value("m-2"))
                .andExpect(jsonPath("$[1].senderId").value("user_alice"))
                .andExpect(jsonPath("$[1].isRead").value(true));
    }

    @Test
    @DisplayName("POST /api/messages/{convId}/read returns 401 when unauthenticated")
    void markAsRead_unauthenticated_returns401() throws Exception {
        when(userService.syncUser(null)).thenReturn(null);

        mockMvc.perform(post("/api/messages/c-123/read"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/messages/{convId}/read returns 404 when conversation not found")
    void markAsRead_notFound_returns404() throws Exception {
        when(userService.syncUser(null)).thenReturn(null);
        when(conversationRepository.findById("c-missing")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/messages/c-missing/read")
                        .header("X-User-Id", "user_alice"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/messages/{convId}/read returns 403 when user is not participant")
    void markAsRead_notParticipant_returns403() throws Exception {
        Conversation c = new Conversation();
        c.setId("c-123");
        c.setParticipantOne("user_alice");
        c.setParticipantTwo("user_bob");

        when(userService.syncUser(null)).thenReturn(null);
        when(conversationRepository.findById("c-123")).thenReturn(Optional.of(c));

        mockMvc.perform(post("/api/messages/c-123/read")
                        .header("X-User-Id", "user_intruder"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/messages/{convId}/read marks incoming unread messages as read and returns count")
    void markAsRead_authorized_marksRead() throws Exception {
        Conversation c = new Conversation();
        c.setId("c-123");
        c.setParticipantOne("user_alice");
        c.setParticipantTwo("user_bob");

        Message unreadFromBob = new Message();
        unreadFromBob.setId("m-unread");
        unreadFromBob.setConversationId("c-123");
        unreadFromBob.setSenderId("user_bob");
        unreadFromBob.setReadAt(null);

        when(userService.syncUser(null)).thenReturn(null);
        when(conversationRepository.findById("c-123")).thenReturn(Optional.of(c));
        when(messageRepository.findByConversationIdOrderByCreatedAtAsc("c-123")).thenReturn(List.of(unreadFromBob));
        when(conversationRepository.findByParticipant("user_alice")).thenReturn(List.of(c));
        when(messageRepository.countByConversationIdAndReadAtIsNullAndSenderIdNot("c-123", "user_alice")).thenReturn(0);

        mockMvc.perform(post("/api/messages/c-123/read")
                        .header("X-User-Id", "user_alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.count").value(0));

        verify(messageRepository).save(unreadFromBob);
        assertNotNull(unreadFromBob.getReadAt());
    }

    @Test
    @DisplayName("POST /api/messages/{convId} returns 401 when unauthenticated")
    void sendMessage_unauthenticated_returns401() throws Exception {
        when(userService.syncUser(null)).thenReturn(null);

        mockMvc.perform(post("/api/messages/c-123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("content", "Hello!"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/messages/{convId} returns 404 when conversation not found")
    void sendMessage_notFound_returns404() throws Exception {
        when(userService.syncUser(null)).thenReturn(null);
        when(conversationRepository.findById("c-missing")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/messages/c-missing")
                        .header("X-User-Id", "user_alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("content", "Hello!"))))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/messages/{convId} returns 403 when user is not participant")
    void sendMessage_notParticipant_returns403() throws Exception {
        Conversation c = new Conversation();
        c.setId("c-123");
        c.setParticipantOne("user_alice");
        c.setParticipantTwo("user_bob");

        when(userService.syncUser(null)).thenReturn(null);
        when(conversationRepository.findById("c-123")).thenReturn(Optional.of(c));

        mockMvc.perform(post("/api/messages/c-123")
                        .header("X-User-Id", "user_intruder")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("content", "Hello!"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/messages/{convId} returns 400 when message content is blank or missing")
    void sendMessage_blankContent_returns400() throws Exception {
        Conversation c = new Conversation();
        c.setId("c-123");
        c.setParticipantOne("user_alice");
        c.setParticipantTwo("user_bob");

        when(userService.syncUser(null)).thenReturn(null);
        when(conversationRepository.findById("c-123")).thenReturn(Optional.of(c));

        mockMvc.perform(post("/api/messages/c-123")
                        .header("X-User-Id", "user_alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("content", "   "))))
                .andExpect(status().isBadRequest());

        verify(messageRepository, never()).save(any());
        verify(messagingTemplate, never()).convertAndSend(any(String.class), any(Object.class));
    }

    @Test
    @DisplayName("POST /api/messages/{convId} saves message and dispatches WebSocket notification to other participant")
    void sendMessage_authorized_persistsAndBroadcasts() throws Exception {
        Conversation c = new Conversation();
        c.setId("c-123");
        c.setParticipantOne("user_alice");
        c.setParticipantTwo("user_bob");

        when(userService.syncUser(null)).thenReturn(null);
        when(conversationRepository.findById("c-123")).thenReturn(Optional.of(c));
        when(messageRepository.save(any(Message.class))).thenAnswer(inv -> {
            Message m = inv.getArgument(0);
            m.setId("m-generated-999");
            m.setCreatedAt("2026-10-18T10:15:00Z");
            return m;
        });

        mockMvc.perform(post("/api/messages/c-123")
                        .header("X-User-Id", "user_alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("content", "Can you send the tomato prices?"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("m-generated-999"))
                .andExpect(jsonPath("$.senderId").value("user_alice"))
                .andExpect(jsonPath("$.content").value("Can you send the tomato prices?"))
                .andExpect(jsonPath("$.conversationId").value("c-123"));

        ArgumentCaptor<String> destCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map<String, Object>> payloadCaptor = ArgumentCaptor.forClass(Map.class);
        verify(messagingTemplate).convertAndSend(destCaptor.capture(), payloadCaptor.capture());

        assertEquals("/topic/messages.user_bob", destCaptor.getValue());
        assertEquals("Can you send the tomato prices?", payloadCaptor.getValue().get("content"));
    }
}
