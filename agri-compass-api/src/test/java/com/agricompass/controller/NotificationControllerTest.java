package com.agricompass.controller;

import com.agricompass.entity.Follow;
import com.agricompass.entity.Notification;
import com.agricompass.entity.Post;
import com.agricompass.entity.UserProfile;
import com.agricompass.repository.FarmUpdateRepository;
import com.agricompass.repository.FollowRepository;
import com.agricompass.repository.NotificationRepository;
import com.agricompass.repository.PostRepository;
import com.agricompass.repository.UserProfileRepository;
import com.agricompass.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    @Mock
    private FollowRepository followRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private FarmUpdateRepository farmUpdateRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private UserService userService;

    @Mock
    private NotificationRepository notificationRepository;

    private NotificationController notificationController;

    @BeforeEach
    void setUp() {
        notificationController = new NotificationController(
                followRepository,
                postRepository,
                farmUpdateRepository,
                userProfileRepository,
                userService,
                notificationRepository
        );
    }

    @Test
    @DisplayName("Unit test: getNotifications returns empty list when user is unauthenticated")
    void getNotifications_whenUnauthenticated_shouldReturnEmpty() {
        when(userService.syncUser(null)).thenReturn(null);

        ResponseEntity<Map<String, Object>> response = notificationController.getNotifications(null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat((List<?>) response.getBody().get("notifications")).isEmpty();
        assertThat(response.getBody().get("unreadCount")).isEqualTo(0);
    }

    @Test
    @DisplayName("White-box: getNotifications merges direct notifications, resolves author info, and counts unread")
    @SuppressWarnings("unchecked")
    void getNotifications_withDirectNotifications_shouldReturnMappedList() {
        UserProfile user = new UserProfile();
        user.setClerkUserId("user_ravi");
        when(userService.syncUser(null)).thenReturn(user);

        Notification n1 = new Notification();
        n1.setId("notif-1");
        n1.setType("LIKE");
        n1.setMessage("Farmer Ramesh liked your post");
        n1.setRecipientUserId("user_ravi");
        n1.setSenderUserId("user_ramesh");
        n1.setAuthorName("Farmer Ramesh");
        n1.setCreatedAt(Instant.now().toString());
        n1.setIsRead(false);

        when(notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc("user_ravi"))
                .thenReturn(List.of(n1));
        when(followRepository.findByFollowerId("user_ravi"))
                .thenReturn(Collections.emptyList());
        when(notificationRepository.countUnreadByRecipientUserId("user_ravi"))
                .thenReturn(1L);

        ResponseEntity<Map<String, Object>> response = notificationController.getNotifications(null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<Map<String, Object>> notifs = (List<Map<String, Object>>) response.getBody().get("notifications");
        assertThat(notifs).hasSize(1);
        assertThat(notifs.get(0).get("id")).isEqualTo("notif-1");
        assertThat(notifs.get(0).get("message")).isEqualTo("Farmer Ramesh liked your post");
        assertThat(notifs.get(0).get("isRead")).isEqualTo(false);
        assertThat(response.getBody().get("unreadCount")).isEqualTo(1L);
    }

    @Test
    @DisplayName("White-box: getNotifications integrates followed users activity stream")
    @SuppressWarnings("unchecked")
    void getNotifications_withFollowedUsers_shouldIncludeRecentPosts() {
        UserProfile currentUser = new UserProfile();
        currentUser.setClerkUserId("user_me");
        when(userService.syncUser(null)).thenReturn(currentUser);

        Follow follow = new Follow("user_me", "user_guru");
        when(followRepository.findByFollowerId("user_me")).thenReturn(List.of(follow));

        Post post = new Post();
        post.setId("post-99");
        post.setClerkUserId("user_guru");
        post.setContent("Harvested 20 quintals of organic ragi today!");
        post.setCreatedAt(Instant.now().toString());

        UserProfile guruProfile = new UserProfile();
        guruProfile.setClerkUserId("user_guru");
        guruProfile.setFullName("Guru Swamy");
        guruProfile.setProfilePictureUrl("https://example.com/guru.png");

        when(postRepository.findByClerkUserIdInOrderByCreatedAtDesc(List.of("user_guru")))
                .thenReturn(List.of(post));
        when(farmUpdateRepository.findByClerkUserIdInOrderByCreatedAtDesc(List.of("user_guru")))
                .thenReturn(Collections.emptyList());
        when(userProfileRepository.findById("user_guru")).thenReturn(Optional.of(guruProfile));
        when(notificationRepository.countUnreadByRecipientUserId("user_me")).thenReturn(0L);

        ResponseEntity<Map<String, Object>> response = notificationController.getNotifications(null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<Map<String, Object>> notifs = (List<Map<String, Object>>) response.getBody().get("notifications");
        assertThat(notifs).hasSize(1);
        assertThat(notifs.get(0).get("type")).isEqualTo("POST");
        assertThat(notifs.get(0).get("authorName")).isEqualTo("Guru Swamy");
        assertThat(notifs.get(0).get("authorAvatar")).isEqualTo("https://example.com/guru.png");
    }

    @Test
    @DisplayName("Unit test: getUnreadCount returns accurate unread count for authenticated user")
    void getUnreadCount_shouldReturnCount() {
        UserProfile user = new UserProfile();
        user.setClerkUserId("user_100");
        when(userService.syncUser(null)).thenReturn(user);
        when(notificationRepository.countUnreadByRecipientUserId("user_100")).thenReturn(5L);

        ResponseEntity<Map<String, Object>> response = notificationController.getUnreadCount(null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("count", 5L);
    }

    @Test
    @DisplayName("Unit test: markAllAsRead calls repository markAllAsRead")
    void markAllAsRead_shouldTriggerRepositoryMethod() {
        UserProfile user = new UserProfile();
        user.setClerkUserId("user_200");
        when(userService.syncUser(null)).thenReturn(user);

        ResponseEntity<Map<String, Object>> response = notificationController.markAllAsRead(null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("success", true);
        assertThat(response.getBody()).containsEntry("count", 0);
        verify(notificationRepository).markAllAsRead("user_200");
    }

    @Test
    @DisplayName("Unit test: markAsRead updates single notification")
    void markAsRead_shouldTriggerSingleNotificationUpdate() {
        UserProfile user = new UserProfile();
        user.setClerkUserId("user_300");
        when(userService.syncUser(null)).thenReturn(user);

        ResponseEntity<Map<String, Object>> response = notificationController.markAsRead("notif-abc", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("success", true);
        verify(notificationRepository).markAsRead("notif-abc", "user_300");
    }
}
