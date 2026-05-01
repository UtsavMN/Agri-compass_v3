package com.agricompass.controller;

import com.agricompass.entity.Comment;
import com.agricompass.entity.Post;
import com.agricompass.entity.PostLike;
import com.agricompass.entity.UserProfile;
import com.agricompass.repository.CommentRepository;
import com.agricompass.repository.PostLikeRepository;
import com.agricompass.repository.PostRepository;
import com.agricompass.repository.UserProfileRepository;
import com.agricompass.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping({"/api/posts", "/api/community"})
@RequiredArgsConstructor
public class PostController {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final UserProfileRepository profileRepository;
    private final UserService userService;

    // GET /api/posts
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getPosts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String user) {

        // Normalize empty strings to null for JPA query
        String query = (q != null && !q.trim().isEmpty()) ? q : null;
        String loc = (location != null && !location.trim().isEmpty()) ? location : null;
        String userIdFilter = (user != null && !user.trim().isEmpty()) ? user : null;

        String currentUserId = userService.syncUser(null).getId();
        List<Post> posts = postRepository.findWithFilters(query, loc, userIdFilter);

        List<Map<String, Object>> result = posts.stream().map(post -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", post.getId());
            dto.put("user_id", post.getUserId());
            dto.put("title", post.getTitle());
            dto.put("body", post.getBody());
            dto.put("content", post.getBody());
            dto.put("location", post.getLocation());
            
            ObjectMapper mapper = new ObjectMapper();
            List<String> imageList = new ArrayList<>();
            if (post.getImages() != null && post.getImages().startsWith("[")) {
                try {
                    imageList = mapper.readValue(post.getImages(), List.class);
                } catch (Exception e) {}
            }
            dto.put("images", imageList);
            dto.put("video_url", post.getVideoUrl());
            dto.put("kn_caption", post.getKnCaption());
            dto.put("created_at", post.getCreatedAt() != null ? post.getCreatedAt().toString() : null);
            dto.put("updated_at", post.getUpdatedAt() != null ? post.getUpdatedAt().toString() : null);

            dto.put("_count", Map.of(
                "likes", postLikeRepository.countByPostId(post.getId()),
                "comments", commentRepository.countByPostId(post.getId())
            ));

            dto.put("isLiked", currentUserId != null &&
                postLikeRepository.findByPostIdAndUserId(post.getId(), currentUserId).isPresent());

            Optional<UserProfile> profile = profileRepository.findById(post.getUserId());
            dto.put("user", profile.map(p -> Map.of(
                "id", p.getId(),
                "username", p.getUsername() != null ? p.getUsername() : "",
                "full_name", p.getFullName() != null ? p.getFullName() : "",
                "avatar_url", p.getAvatarUrl() != null ? p.getAvatarUrl() : ""
            )).orElse(Map.of("id", post.getUserId(), "username", "Unknown User")));

            return dto;
        }).toList();

        return ResponseEntity.ok(result);
    }

    // POST /api/posts
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Map<String, Object> body) {
        String userId = userService.syncUser(null).getId();

        ObjectMapper mapper = new ObjectMapper();
        String imagesJson = null;
        if (body.get("images") != null) {
            try {
                imagesJson = mapper.writeValueAsString(body.get("images"));
            } catch (Exception e) {}
        }

        Post post = Post.builder()
            .userId(userId)
            .title((String) body.get("title"))
            .body((String) body.get("body"))
            .location((String) body.get("location"))
            .images(imagesJson)
            .build();

        return ResponseEntity.ok(postRepository.save(post));
    }

    // DELETE /api/posts/:id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUserId().equals(userService.syncUser(null).getId())) {
            return ResponseEntity.status(403).build();
        }

        postRepository.delete(post);
        return ResponseEntity.noContent().build();
    }

    // POST /api/posts/:id/like
    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable String id) {
        String userId = userService.syncUser(null).getId();
        Optional<PostLike> existing = postLikeRepository.findByPostIdAndUserId(id, userId);

        boolean liked;
        if (existing.isPresent()) {
            postLikeRepository.delete(existing.get());
            liked = false;
        } else {
            Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
            PostLike like = PostLike.builder().post(post).userId(userId).build();
            postLikeRepository.save(like);
            liked = true;
        }

        return ResponseEntity.ok(Map.of(
            "liked", liked,
            "likesCount", postLikeRepository.countByPostId(id)
        ));
    }

    // POST /api/posts/:id/comments
    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable String id,
                                              @RequestBody Map<String, String> body) {
        String userId = userService.syncUser(null).getId();
        Post post = postRepository.findById(id).orElseThrow();
        Comment comment = Comment.builder()
                .post(post)
                .userId(userId)
                .content(body.get("content"))
                .build();
        return ResponseEntity.ok(commentRepository.save(comment));
    }

    // GET /api/posts/:id/comments
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Map<String, Object>>> getComments(@PathVariable String id) {
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(id);
        List<Map<String, Object>> result = comments.stream().map(c -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", c.getId());
            dto.put("post_id", id);
            dto.put("user_id", c.getUserId());
            dto.put("content", c.getContent());
            dto.put("created_at", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);

            Optional<UserProfile> profile = profileRepository.findById(c.getUserId());
            dto.put("user", profile.map(p -> Map.of(
                "id", p.getId(),
                "username", p.getUsername() != null ? p.getUsername() : "",
                "full_name", p.getFullName() != null ? p.getFullName() : "",
                "avatar_url", p.getAvatarUrl() != null ? p.getAvatarUrl() : ""
            )).orElse(Map.of("id", c.getUserId(), "username", "Unknown User")));

            return dto;
        }).toList();
        return ResponseEntity.ok(result);
    }

    // GET /api/posts/:id
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPost(@PathVariable String id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        String currentUserId = userService.syncUser(null).getId();
        
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", post.getId());
        dto.put("user_id", post.getUserId());
        dto.put("title", post.getTitle());
        dto.put("body", post.getBody());
        dto.put("content", post.getBody());
        dto.put("location", post.getLocation());
        
        ObjectMapper mapper = new ObjectMapper();
        List<String> imageList = new ArrayList<>();
        if (post.getImages() != null && post.getImages().startsWith("[")) {
            try {
                imageList = mapper.readValue(post.getImages(), List.class);
            } catch (Exception e) {}
        }
        dto.put("images", imageList);
        dto.put("created_at", post.getCreatedAt() != null ? post.getCreatedAt().toString() : null);

        dto.put("_count", Map.of(
            "likes", postLikeRepository.countByPostId(post.getId()),
            "comments", commentRepository.countByPostId(post.getId())
        ));

        dto.put("isLiked", currentUserId != null &&
            postLikeRepository.findByPostIdAndUserId(post.getId(), currentUserId).isPresent());

        Optional<UserProfile> profile = profileRepository.findById(post.getUserId());
        dto.put("user", profile.map(p -> Map.of(
            "id", p.getId(),
            "username", p.getUsername() != null ? p.getUsername() : "",
            "full_name", p.getFullName() != null ? p.getFullName() : "",
            "avatar_url", p.getAvatarUrl() != null ? p.getAvatarUrl() : ""
        )).orElse(Map.of("id", post.getUserId(), "username", "Unknown User")));

        return ResponseEntity.ok(dto);
    }
}
