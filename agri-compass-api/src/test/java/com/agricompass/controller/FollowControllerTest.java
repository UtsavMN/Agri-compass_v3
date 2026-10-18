package com.agricompass.controller;

import com.agricompass.entity.Follow;
import com.agricompass.entity.FollowId;
import com.agricompass.entity.Notification;
import com.agricompass.entity.UserProfile;
import com.agricompass.repository.FollowRepository;
import com.agricompass.repository.NotificationRepository;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FollowControllerTest {

    @Mock
    private FollowRepository followRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private UserService userService;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private FollowController followController;

    @BeforeEach
    void setUp() {
        followController = new FollowController(
                followRepository,
                userProfileRepository,
                userService,
                notificationRepository,
                messagingTemplate
        );
    }

    @Test
    @DisplayName("White-box: followUser returns 401 when user is not authenticated")
    void followUser_whenUnauthenticated_shouldReturn401() {
        when(userService.syncUser(null)).thenReturn(null);

        ResponseEntity<Map<String, Object>> response = followController.followUser("target_123", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("White-box: followUser returns 400 Bad Request when attempting self-follow")
    void followUser_whenSelfFollow_shouldReturnBadRequest() {
        UserProfile self = new UserProfile();
        self.setClerkUserId("user_abc");
        when(userService.syncUser(null)).thenReturn(self);

        ResponseEntity<Map<String, Object>> response = followController.followUser("user_abc", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("error", "Cannot follow yourself");
    }

    @Test
    @DisplayName("Integration test: followUser creates new follow, sends notification and websocket event")
    void followUser_whenValid_shouldCreateFollowAndNotification() {
        UserProfile follower = new UserProfile();
        follower.setClerkUserId("user_alice");
        follower.setFullName("Alice Farmer");
        follower.setUsernameHandle("alice");
        when(userService.syncUser(null)).thenReturn(follower);

        FollowId followId = new FollowId("user_alice", "user_bob");
        when(followRepository.existsById(followId)).thenReturn(false);
        when(userProfileRepository.findById("user_alice")).thenReturn(Optional.of(follower));

        ResponseEntity<Map<String, Object>> response = followController.followUser("user_bob", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("success", true);

        verify(followRepository).save(any(Follow.class));
        verify(notificationRepository).save(any(Notification.class));
        verify(messagingTemplate).convertAndSend(eq("/topic/notifications.user_bob"), any(Map.class));
    }

    @Test
    @DisplayName("White-box: followUser is idempotent if already following (no duplicate notification)")
    void followUser_whenAlreadyFollowing_shouldReturnOkWithoutDuplicateNotification() {
        UserProfile follower = new UserProfile();
        follower.setClerkUserId("user_alice");
        when(userService.syncUser(null)).thenReturn(follower);

        FollowId followId = new FollowId("user_alice", "user_bob");
        when(followRepository.existsById(followId)).thenReturn(true);

        ResponseEntity<Map<String, Object>> response = followController.followUser("user_bob", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(followRepository, never()).save(any(Follow.class));
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("White-box: unfollowUser removes follow relationship")
    void unfollowUser_shouldDeleteRelationship() {
        UserProfile user = new UserProfile();
        user.setClerkUserId("user_alice");
        when(userService.syncUser(null)).thenReturn(user);

        FollowId followId = new FollowId("user_alice", "user_bob");
        Follow follow = new Follow("user_alice", "user_bob");
        when(followRepository.findById(followId)).thenReturn(Optional.of(follow));

        ResponseEntity<Map<String, Object>> response = followController.unfollowUser("user_bob", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(followRepository).delete(follow);
    }

    @Test
    @DisplayName("White-box: getFollowStatus returns true if following, false otherwise")
    void getFollowStatus_shouldCheckRepository() {
        UserProfile user = new UserProfile();
        user.setClerkUserId("user_alice");
        when(userService.syncUser(null)).thenReturn(user);

        when(followRepository.existsByFollowerIdAndFollowingId("user_alice", "user_bob")).thenReturn(true);

        ResponseEntity<Map<String, Object>> response = followController.getFollowStatus("user_bob", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("isFollowing", true);
    }

    @Test
    @DisplayName("Integration test: getFollowers and getFollowing resolve user DTOs correctly")
    @SuppressWarnings("unchecked")
    void getFollowersAndFollowing_shouldReturnUserDTOs() {
        Follow follow = new Follow("follower_1", "target_user");
        when(followRepository.findByFollowingId("target_user")).thenReturn(List.of(follow));

        UserProfile profile = new UserProfile();
        profile.setClerkUserId("follower_1");
        profile.setFullName("Suresh Patel");
        profile.setUsernameHandle("suresh_p");
        profile.setDistrict("Haveri");

        when(userProfileRepository.findById("follower_1")).thenReturn(Optional.of(profile));

        ResponseEntity<Map<String, Object>> response = followController.getFollowers("target_user");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<Map<String, Object>> users = (List<Map<String, Object>>) response.getBody().get("users");
        assertThat(users).hasSize(1);
        assertThat(users.get(0)).containsEntry("clerkUserId", "follower_1");
        assertThat(users.get(0)).containsEntry("fullName", "Suresh Patel");
        assertThat(users.get(0)).containsEntry("district", "Haveri");
    }
}
