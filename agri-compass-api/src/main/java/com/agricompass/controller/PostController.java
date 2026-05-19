package com.agricompass.controller;

import com.agricompass.entity.Comment;
import com.agricompass.entity.Post;
import com.agricompass.entity.PostLike;
import com.agricompass.repository.CommentRepository;
import com.agricompass.repository.PostLikeRepository;
import com.agricompass.repository.PostRepository;
import com.agricompass.repository.UserProfileRepository;
import com.agricompass.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping({"/api/posts", "/api/community"})
@SuppressWarnings("unchecked")
public class PostController {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final UserProfileRepository profileRepository;
    private final UserService userService;

    public PostController(PostRepository postRepository, PostLikeRepository postLikeRepository, CommentRepository commentRepository, UserProfileRepository profileRepository, UserService userService) {
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.commentRepository = commentRepository;
        this.profileRepository = profileRepository;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getPosts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer limit) {

        String query = (q != null && !q.trim().isEmpty()) ? q : null;
        String loc = (location != null && !location.trim().isEmpty()) ? location : null;
        String requestedUser = userId != null ? userId : user;
        String userIdFilter = (requestedUser != null && !requestedUser.trim().isEmpty()) ? requestedUser : null;

        String currentUserId = userService.syncUser(null).getId();
        List<Post> posts = postRepository.findWithFilters(query, loc, userIdFilter);

        List<Map<String, Object>> allPosts = posts.stream().map(post -> {
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
            dto.put("likes_count", postLikeRepository.countByPostId(post.getId()));
            dto.put("comments_count", commentRepository.countByPostId(post.getId()));
            dto.put("category", post.getCropTags() != null ? post.getCropTags() : "General");

            dto.put("isLiked", currentUserId != null &&
                postLikeRepository.findByPostIdAndUserId(post.getId(), currentUserId).isPresent());

            dto.put("user", userDto(post.getUserId()));

            return dto;
        }).toList();

        List<Map<String, Object>> result = paginate(allPosts, page, limit);
        return ResponseEntity.ok(result);
    }

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
            .body((String) body.get("body") != null ? (String) body.get("body") : (String) body.get("content"))
            .location((String) body.get("location"))
            .images(imagesJson)
            .videoUrl((String) body.get("video_url"))
            .cropTags((String) body.get("category"))
            .build();
        return ResponseEntity.ok(postRepository.save(post));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPost(@PathVariable String id) {
        String currentUserId = userService.syncUser(null).getId();
        Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        
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
        
        dto.put("likes_count", postLikeRepository.countByPostId(post.getId()));
        dto.put("isLiked", currentUserId != null &&
            postLikeRepository.findByPostIdAndUserId(post.getId(), currentUserId).isPresent());
        
        dto.put("user", userDto(post.getUserId()));
        
        List<Map<String, Object>> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(id).stream().map(comment -> {
            Map<String, Object> c = new HashMap<>();
            c.put("id", comment.getId());
            c.put("content", comment.getContent());
            c.put("user_id", comment.getUserId());
            c.put("created_at", comment.getCreatedAt());
            c.put("user", userDto(comment.getUserId()));
            return c;
        }).toList();
        
        dto.put("comments", comments);
        dto.put("comments_count", comments.size());

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable String id) {
        String userId = userService.syncUser(null).getId();
        Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        
        Optional<PostLike> existing = postLikeRepository.findByPostIdAndUserId(id, userId);
        if (existing.isPresent()) {
            postLikeRepository.delete(existing.get());
            return ResponseEntity.ok(Map.of("liked", false, "count", postLikeRepository.countByPostId(id)));
        } else {
            postLikeRepository.save(PostLike.builder().post(post).userId(userId).build());
            return ResponseEntity.ok(Map.of("liked", true, "count", postLikeRepository.countByPostId(id)));
        }
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable String id, @RequestBody Map<String, String> body) {
        String userId = userService.syncUser(null).getId();
        Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        
        Comment comment = Comment.builder()
            .post(post)
            .userId(userId)
            .content(body.get("content"))
            .build();
        return ResponseEntity.ok(commentRepository.save(comment));
    }

    private Map<String, Object> userDto(String userId) {
        return (Map<String, Object>) profileRepository.findById(userId)
            .map(p -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", p.getId());
                map.put("fullName", p.getFullName() != null ? p.getFullName() : p.getUsername());
                map.put("username", p.getUsername());
                map.put("avatar_url", p.getAvatarUrl() != null ? p.getAvatarUrl() : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + p.getUsername());
                return map;
            })
            .orElseGet(() -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", userId);
                map.put("fullName", "Farmer");
                map.put("username", "farmer");
                return map;
            });
    }

    private List<Map<String, Object>> paginate(List<Map<String, Object>> list, Integer page, Integer limit) {
        if (page == null || limit == null) return list;
        int from = (page - 1) * limit;
        if (from >= list.size()) return Collections.emptyList();
        int to = Math.min(from + limit, list.size());
        return list.subList(from, to);
    }
}
