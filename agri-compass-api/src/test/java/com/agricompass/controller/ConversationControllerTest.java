package com.agricompass.controller;

import com.agricompass.entity.Conversation;
import com.agricompass.entity.Message;
import com.agricompass.entity.UserProfile;
import com.agricompass.repository.ConversationRepository;
import com.agricompass.repository.MessageRepository;
import com.agricompass.repository.UserProfileRepository;
import com.agricompass.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ConversationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private UserService userService;

    @BeforeEach
    void setUp() {
        ConversationController controller = new ConversationController(
                conversationRepository,
                messageRepository,
                userProfileRepository,
                userService
        );
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("GET /api/conversations returns empty list when unauthenticated")
    void getConversations_unauthenticated_returnsEmptyList() throws Exception {
        when(userService.syncUser(null)).thenReturn(null);

        mockMvc.perform(get("/api/conversations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("GET /api/conversations returns enriched conversations sorted by recency")
    void getConversations_authenticated_returnsEnrichedList() throws Exception {
        Conversation c1 = new Conversation();
        c1.setId("c-1");
        c1.setParticipantOne("user_alice");
        c1.setParticipantTwo("user_bob");

        UserProfile bobProfile = new UserProfile();
        bobProfile.setClerkUserId("user_bob");
        bobProfile.setFullName("Bob Farmer");
        bobProfile.setProfilePictureUrl("https://example.com/bob.jpg");

        Message latestMsg = new Message();
        latestMsg.setId("m-1");
        latestMsg.setConversationId("c-1");
        latestMsg.setContent("See you at the mandi tomorrow");
        latestMsg.setCreatedAt("2026-10-18T11:00:00Z");

        when(userService.syncUser(null)).thenReturn(null);
        when(conversationRepository.findByParticipant("user_alice")).thenReturn(List.of(c1));
        when(userProfileRepository.findAllById(List.of("user_bob"))).thenReturn(List.of(bobProfile));
        when(messageRepository.findTopByConversationIdOrderByCreatedAtDesc("c-1")).thenReturn(latestMsg);
        when(messageRepository.countByConversationIdAndReadAtIsNullAndSenderIdNot("c-1", "user_alice")).thenReturn(2);

        mockMvc.perform(get("/api/conversations")
                        .header("X-User-Id", "user_alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("c-1"))
                .andExpect(jsonPath("$[0].otherUser.id").value("user_bob"))
                .andExpect(jsonPath("$[0].otherUser.fullName").value("Bob Farmer"))
                .andExpect(jsonPath("$[0].latestMessage").value("See you at the mandi tomorrow"))
                .andExpect(jsonPath("$[0].unreadCount").value(2));
    }

    @Test
    @DisplayName("GET /api/conversations/user/{userId} returns 401 when unauthenticated")
    void getOrCreateConversation_unauthenticated_returns401() throws Exception {
        when(userService.syncUser(null)).thenReturn(null);

        mockMvc.perform(get("/api/conversations/user/user_bob"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/conversations/user/{userId} returns 400 when attempting self conversation")
    void getOrCreateConversation_selfConversation_returns400() throws Exception {
        when(userService.syncUser(null)).thenReturn(null);

        mockMvc.perform(get("/api/conversations/user/user_alice")
                        .header("X-User-Id", "user_alice"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/conversations/user/{userId} returns existing conversation if present")
    void getOrCreateConversation_existingConversation_returnsExistingId() throws Exception {
        Conversation c = new Conversation();
        c.setId("c-existing-55");
        c.setParticipantOne("user_alice");
        c.setParticipantTwo("user_bob");

        when(userService.syncUser(null)).thenReturn(null);
        when(conversationRepository.findByParticipants("user_alice", "user_bob"))
                .thenReturn(Optional.of(c));

        mockMvc.perform(get("/api/conversations/user/user_bob")
                        .header("X-User-Id", "user_alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("c-existing-55"));

        verify(conversationRepository, never()).save(any());
    }

    @Test
    @DisplayName("GET /api/conversations/user/{userId} creates new conversation if not present")
    void getOrCreateConversation_newConversation_createsAndReturnsId() throws Exception {
        when(userService.syncUser(null)).thenReturn(null);
        when(conversationRepository.findByParticipants("user_alice", "user_bob"))
                .thenReturn(Optional.empty());

        when(conversationRepository.save(any(Conversation.class))).thenAnswer(inv -> {
            Conversation c = inv.getArgument(0);
            c.setId("c-brand-new");
            return c;
        });

        mockMvc.perform(get("/api/conversations/user/user_bob")
                        .header("X-User-Id", "user_alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("c-brand-new"));

        verify(conversationRepository).save(any(Conversation.class));
    }

    @Test
    @DisplayName("GET /api/conversations/unread-count returns 0 when unauthenticated")
    void getUnreadCount_unauthenticated_returnsZero() throws Exception {
        when(userService.syncUser(null)).thenReturn(null);

        mockMvc.perform(get("/api/conversations/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0));
    }

    @Test
    @DisplayName("GET /api/conversations/unread-count computes total unread across all user conversations")
    void getUnreadCount_authenticated_computesTotal() throws Exception {
        Conversation c1 = new Conversation();
        c1.setId("c-1");
        Conversation c2 = new Conversation();
        c2.setId("c-2");

        when(userService.syncUser(null)).thenReturn(null);
        when(conversationRepository.findByParticipant("user_alice")).thenReturn(List.of(c1, c2));
        when(messageRepository.countByConversationIdAndReadAtIsNullAndSenderIdNot("c-1", "user_alice")).thenReturn(3);
        when(messageRepository.countByConversationIdAndReadAtIsNullAndSenderIdNot("c-2", "user_alice")).thenReturn(4);

        mockMvc.perform(get("/api/conversations/unread-count")
                        .header("X-User-Id", "user_alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(7));
    }
}
