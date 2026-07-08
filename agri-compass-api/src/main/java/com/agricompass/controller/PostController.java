package com.agricompass.controller;

import com.agricompass.entity.Comment;
import com.agricompass.entity.Post;
import com.agricompass.entity.PostLike;
import com.agricompass.repository.CommentRepository;
import com.agricompass.repository.FollowRepository;
import com.agricompass.repository.PostLikeRepository;
import com.agricompass.repository.PostRepository;
import com.agricompass.repository.UserProfileRepository;
import com.agricompass.service.UserService;
import com.agricompass.dto.CommentResponseDTO;
import com.agricompass.dto.UserSummaryDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/posts", "/api/community"})
@SuppressWarnings("unchecked")
public class PostController {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final UserProfileRepository profileRepository;
    private final UserService userService;
    private final FollowRepository followRepository;

    public PostController(PostRepository postRepository, PostLikeRepository postLikeRepository, CommentRepository commentRepository, UserProfileRepository profileRepository, UserService userService, FollowRepository followRepository) {
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.commentRepository = commentRepository;
        this.profileRepository = profileRepository;
        this.userService = userService;
        this.followRepository = followRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getPosts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {

        String query = (q != null && !q.trim().isEmpty()) ? q : "";
        String loc = (location != null && !location.trim().isEmpty()) ? location : "";
        String requestedUser = userId != null ? userId : user;
        String userIdFilter = (requestedUser != null && !requestedUser.trim().isEmpty()) ? requestedUser : "";

        String currentUserId = userService.syncUser(null).getId();
        List<String> followedIds = followRepository.findByFollowerId(currentUserId)
                .stream().map(f -> f.getFollowingId()).toList();
        if (followedIds.isEmpty()) {
            followedIds = List.of("dummy_id_no_match");
        }
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(Math.max(0, page - 1), limit);
        org.springframework.data.domain.Page<Post> postsPage = postRepository.findWithFilters(query, loc, userIdFilter, pageable);

        List<String> postIds = postsPage.getContent().stream().map(Post::getId).distinct().toList();
        
        Map<String, Long> tmpLikeCounts = new HashMap<>();
        Map<String, Long> tmpCommentCounts = new HashMap<>();
        Set<String> tmpLikedByMe = new HashSet<>();
        
        if (!postIds.isEmpty()) {
            tmpLikeCounts = postLikeRepository.countByPostIds(postIds).stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));
            
            tmpCommentCounts = commentRepository.countByPostIds(postIds).stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));
                
            if (currentUserId != null) {
                tmpLikedByMe.addAll(postLikeRepository.findLikedPostIds(postIds, currentUserId));
            }
        }
        
        final Map<String, Long> likeCounts = tmpLikeCounts;
        final Map<String, Long> commentCounts = tmpCommentCounts;
        final Set<String> likedByMe = tmpLikedByMe;

        List<String> userIds = postsPage.getContent().stream().map(Post::getUserId).distinct().toList();
        List<com.agricompass.entity.UserProfile> profiles = profileRepository.findAllById(userIds);
        Map<String, com.agricompass.entity.UserProfile> profileMap = profiles.stream()
                .collect(Collectors.toMap(com.agricompass.entity.UserProfile::getId, p -> p));

        List<Map<String, Object>> result = postsPage.map(post -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", post.getId());
            dto.put("user_id", post.getUserId());
            dto.put("title", post.getTitle());
            dto.put("body", post.getBody());
            dto.put("content", post.getBody());
            dto.put("location", post.getLocation());
            
            dto.put("images", post.getImages());
            dto.put("video_url", post.getVideoUrl());
            dto.put("kn_caption", post.getKnCaption());
            dto.put("created_at", post.getCreatedAt() != null ? post.getCreatedAt().toString() : null);
            dto.put("updated_at", post.getUpdatedAt() != null ? post.getUpdatedAt().toString() : null);

            long likes = likeCounts.getOrDefault(post.getId(), 0L);
            long comments = commentCounts.getOrDefault(post.getId(), 0L);

            dto.put("_count", Map.of("likes", likes, "comments", comments));
            dto.put("likes_count", likes);
            dto.put("comments_count", comments);
            List<String> cropTags = post.getCropTags();
            dto.put("category", (cropTags != null && !cropTags.isEmpty()) ? cropTags.get(0) : "General");

            dto.put("isLiked", likedByMe.contains(post.getId()));

            com.agricompass.entity.UserProfile p = profileMap.get(post.getUserId());
            dto.put("user", userDtoFromProfile(post.getUserId(), p));

            return dto;
        }).getContent();

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Map<String, Object> body) {
        String userId = userService.syncUser(null).getId();

        String bodyContent = body.get("body") != null ? (String) body.get("body") : (String) body.get("content");
        String category = (String) body.get("category");
        
        com.agricompass.entity.UserProfile userProfile = profileRepository.findByIdIgnoreCase(userId).orElse(null);
        String location = (userProfile != null && userProfile.getDistrict() != null && !userProfile.getDistrict().isEmpty()) 
                ? userProfile.getDistrict() 
                : (String) body.get("location");

        Post post = Post.builder()
            .userId(userId)
            .body(bodyContent)
            .location(location)
            .build();
        if (category != null) {
            post.setCategory(category);
        }
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
        
        dto.put("images", post.getImages());
        dto.put("video_url", post.getVideoUrl());
        dto.put("kn_caption", post.getKnCaption());
        dto.put("created_at", post.getCreatedAt() != null ? post.getCreatedAt().toString() : null);
        
        dto.put("likes_count", postLikeRepository.countByPostId(post.getId()));
        dto.put("isLiked", currentUserId != null &&
            postLikeRepository.findByPostIdAndClerkUserId(post.getId(), currentUserId).isPresent());
        
        dto.put("user", userDtoFromProfile(post.getUserId(), post.getUserProfile()));
        
        List<Map<String, Object>> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(id).stream().map(comment -> {
            Map<String, Object> c = new HashMap<>();
            c.put("id", comment.getId());
            c.put("content", comment.getContent());
            c.put("user_id", comment.getClerkUserId());
            c.put("created_at", comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : null);
            com.agricompass.entity.UserProfile commentProfile = profileRepository.findById(comment.getClerkUserId()).orElse(null);
            c.put("user", userDtoFromProfile(comment.getClerkUserId(), commentProfile));
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
        
        Optional<PostLike> existing = postLikeRepository.findByPostIdAndClerkUserId(id, userId);
        if (existing.isPresent()) {
            postLikeRepository.delete(existing.get());
            return ResponseEntity.ok(Map.of("liked", false, "count", postLikeRepository.countByPostId(id)));
        } else {
            postLikeRepository.save(new PostLike(id, userId));
            return ResponseEntity.ok(Map.of("liked", true, "count", postLikeRepository.countByPostId(id)));
        }
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable String id) {
        List<Comment> commentList = commentRepository.findByPostIdOrderByCreatedAtDesc(id);

        List<String> authorIds = commentList.stream()
            .map(Comment::getClerkUserId).distinct().toList();
            
        Map<String, com.agricompass.entity.UserProfile> profiles = profileRepository.findAllById(authorIds)
            .stream().collect(Collectors.toMap(com.agricompass.entity.UserProfile::getId, p -> p));

        List<CommentResponseDTO> comments = commentList.stream().map(comment -> {
            com.agricompass.entity.UserProfile commentProfile = profiles.get(comment.getClerkUserId());
            Map<String, Object> userMap = userDtoFromProfile(comment.getClerkUserId(), commentProfile);
            UserSummaryDTO userDto = new UserSummaryDTO(
                (String) userMap.get("id"),
                (String) userMap.get("username"),
                (String) userMap.get("avatar_url")
            );
            return new CommentResponseDTO(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : null,
                userDto
            );
        }).toList();
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(@PathVariable String id, @RequestBody Map<String, String> body) {
        String userId = userService.syncUser(null).getId();
        Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        
        Comment comment = new Comment();
        comment.setPostId(post.getId());
        comment.setUserId(userId);
        comment.setContent(body.get("content"));
        comment = commentRepository.save(comment);

        // Fetch user profile properly for response
        com.agricompass.entity.UserProfile userProfile = profileRepository.findById(userId).orElse(null);
        Map<String, Object> userMap = userDtoFromProfile(userId, userProfile);
        UserSummaryDTO userDto = new UserSummaryDTO(
            (String) userMap.get("id"),
            (String) userMap.get("username"),
            (String) userMap.get("avatar_url")
        );
        
        CommentResponseDTO response = new CommentResponseDTO(
            comment.getId(),
            comment.getContent(),
            comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : null,
            userDto
        );
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        String currentUserId = userService.syncUser(null).getId();
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getUserId().equals(currentUserId)) {
            return ResponseEntity.status(403).build();
        }
        postRepository.delete(post);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> userDtoFromProfile(String userId, com.agricompass.entity.UserProfile p) {
        if (p == null) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", userId);
            map.put("fullName", "Farmer");
            map.put("full_name", "Farmer");
            map.put("username", "farmer");
            map.put("avatar_url", "https://api.dicebear.com/7.x/avataaars/svg?seed=farmer");
            return map;
        }
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        String displayName = p.getFullName() != null ? p.getFullName() : p.getUsername();
        map.put("fullName", displayName);
        map.put("full_name", displayName);
        map.put("username", p.getUsername());
        String avatarUrl = p.getAvatarUrl() != null ? p.getAvatarUrl() : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + p.getUsername();
        map.put("avatar_url", avatarUrl);
        return map;
    }

    private Map<String, Object> userDto(String userId) {
        return (Map<String, Object>) profileRepository.findById(userId)
            .map(p -> userDtoFromProfile(userId, p))
            .orElseGet(() -> userDtoFromProfile(userId, null));
    }

    private List<Map<String, Object>> paginate(List<Map<String, Object>> list, Integer page, Integer limit) {
        if (page == null || limit == null) return list;
        int from = (page - 1) * limit;
        if (from >= list.size()) return Collections.emptyList();
        int to = Math.min(from + limit, list.size());
        return list.subList(from, to);
    }
}
