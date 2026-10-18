package com.agricompass.controller;

import com.agricompass.dto.CommentResponseDTO;
import com.agricompass.entity.Comment;
import com.agricompass.entity.Notification;
import com.agricompass.entity.Post;
import com.agricompass.entity.PostLike;
import com.agricompass.entity.UserProfile;
import com.agricompass.repository.CommentRepository;
import com.agricompass.repository.FollowRepository;
import com.agricompass.repository.NotificationRepository;
import com.agricompass.repository.PostLikeRepository;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostControllerTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private PostLikeRepository postLikeRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserProfileRepository profileRepository;

    @Mock
    private UserService userService;

    @Mock
    private FollowRepository followRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private PostController postController;

    @BeforeEach
    void setUp() {
        postController = new PostController(
                postRepository,
                postLikeRepository,
                commentRepository,
                profileRepository,
                userService,
                followRepository,
                notificationRepository,
                messagingTemplate
        );
    }

    @Test
    @DisplayName("White-box: createPost binds user profile location and formats images list")
    void createPost_shouldPopulateLocationAndImages() {
        UserProfile user = new UserProfile();
        user.setClerkUserId("user_creator");
        user.setDistrict("Shimoga");
        when(userService.syncUser(null)).thenReturn(user);
        when(profileRepository.findByIdIgnoreCase("user_creator")).thenReturn(Optional.of(user));

        when(postRepository.save(any(Post.class))).thenAnswer(inv -> {
            Post p = inv.getArgument(0);
            p.setId("post-new-1");
            return p;
        });

        Map<String, Object> body = new HashMap<>();
        body.put("body", "First organic sugarcane harvest this season!");
        body.put("category", "crops");
        body.put("images", List.of("https://img.test/sugar1.jpg", "https://img.test/sugar2.jpg"));

        ResponseEntity<Post> response = postController.createPost(body);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Post created = response.getBody();
        assertThat(created).isNotNull();
        assertThat(created.getUserId()).isEqualTo("user_creator");
        assertThat(created.getLocation()).isEqualTo("Shimoga");
        assertThat(created.getImages()).contains("https://img.test/sugar1.jpg", "https://img.test/sugar2.jpg");
    }

    @Test
    @DisplayName("Security & White-box: toggleLike rejects unauthenticated user with 401")
    void toggleLike_whenUnauthenticated_shouldReturn401() {
        when(userService.syncUser(null)).thenReturn(null);

        ResponseEntity<Map<String, Object>> response = postController.toggleLike("post-1", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Integration test: toggleLike adds like and sends notification when not previously liked")
    void toggleLike_whenNotLiked_shouldAddLikeAndNotify() {
        UserProfile liker = new UserProfile();
        liker.setClerkUserId("user_liker");
        liker.setFullName("Liker Farmer");
        when(userService.syncUser(null)).thenReturn(liker);

        Post post = Post.builder()
                .userId("author_user")
                .body("Checking soil health")
                .build();
        post.setId("post-target");

        when(postRepository.findById("post-target")).thenReturn(Optional.of(post));
        when(postLikeRepository.findByPostIdAndClerkUserId("post-target", "user_liker")).thenReturn(Optional.empty());
        when(postLikeRepository.countByPostId("post-target")).thenReturn(1L);

        ResponseEntity<Map<String, Object>> response = postController.toggleLike("post-target", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("liked", true);
        assertThat(response.getBody()).containsEntry("count", 1L);
        verify(postLikeRepository).save(any(PostLike.class));
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    @DisplayName("White-box: toggleLike removes like if already liked (unlike action)")
    void toggleLike_whenAlreadyLiked_shouldRemoveLike() {
        UserProfile liker = new UserProfile();
        liker.setClerkUserId("user_liker");
        when(userService.syncUser(null)).thenReturn(liker);

        Post post = Post.builder().userId("author_user").build();
        post.setId("post-target");

        PostLike existingLike = new PostLike("post-target", "user_liker");
        when(postRepository.findById("post-target")).thenReturn(Optional.of(post));
        when(postLikeRepository.findByPostIdAndClerkUserId("post-target", "user_liker")).thenReturn(Optional.of(existingLike));
        when(postLikeRepository.countByPostId("post-target")).thenReturn(0L);

        ResponseEntity<Map<String, Object>> response = postController.toggleLike("post-target", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("liked", false);
        verify(postLikeRepository).delete(existingLike);
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("Integration test: addComment saves comment and notifies post author")
    void addComment_shouldSaveAndNotifyAuthor() {
        UserProfile commenter = new UserProfile();
        commenter.setClerkUserId("user_commenter");
        commenter.setFullName("Commenter Farmer");
        when(userService.syncUser(null)).thenReturn(commenter);

        Post post = Post.builder().userId("author_user").body("Post about tomato price").build();
        post.setId("post-comm");
        when(postRepository.findById("post-comm")).thenReturn(Optional.of(post));

        when(commentRepository.save(any(Comment.class))).thenAnswer(inv -> {
            Comment c = inv.getArgument(0);
            c.setId("comm-101");
            return c;
        });

        Map<String, String> body = Map.of("content", "Great insight on MSP rates!");
        ResponseEntity<CommentResponseDTO> response = postController.addComment("post-comm", body, null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        CommentResponseDTO dto = response.getBody();
        assertThat(dto).isNotNull();
        assertThat(dto.getContent()).isEqualTo("Great insight on MSP rates!");
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    @DisplayName("Security & Authorization: deletePost blocks non-author with 403 Forbidden")
    void deletePost_whenNotAuthor_shouldReturn403() {
        UserProfile intruder = new UserProfile();
        intruder.setClerkUserId("intruder_user");
        when(userService.syncUser(null)).thenReturn(intruder);

        Post post = Post.builder().userId("legit_author").build();
        post.setId("post-protected");
        when(postRepository.findById("post-protected")).thenReturn(Optional.of(post));

        ResponseEntity<Void> response = postController.deletePost("post-protected", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(postRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Security & Cascade: deletePost allows author to delete and removes likes and comments")
    void deletePost_whenAuthor_shouldDeletePostAndCascades() {
        UserProfile author = new UserProfile();
        author.setClerkUserId("legit_author");
        when(userService.syncUser(null)).thenReturn(author);

        Post post = Post.builder().userId("legit_author").build();
        post.setId("post-my");
        when(postRepository.findById("post-my")).thenReturn(Optional.of(post));

        ResponseEntity<Void> response = postController.deletePost("post-my", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(commentRepository).deleteByPostId("post-my");
        verify(postLikeRepository).deleteByPostId("post-my");
        verify(postRepository).delete(post);
    }
}
