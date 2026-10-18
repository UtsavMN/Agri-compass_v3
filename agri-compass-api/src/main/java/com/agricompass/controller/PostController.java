package com.agricompass.controller;

import com.agricompass.entity.Comment;
import com.agricompass.entity.Notification;
import com.agricompass.entity.Post;
import com.agricompass.entity.PostLike;
import com.agricompass.entity.PostBookmark;
import com.agricompass.repository.CommentRepository;
import com.agricompass.repository.FollowRepository;
import com.agricompass.repository.NotificationRepository;
import com.agricompass.repository.PostLikeRepository;
import com.agricompass.repository.PostBookmarkRepository;
import com.agricompass.repository.PostRepository;
import com.agricompass.repository.UserProfileRepository;
import com.agricompass.service.UserService;
import com.agricompass.dto.CommentResponseDTO;
import com.agricompass.dto.UserSummaryDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/posts", "/api/community"})
@SuppressWarnings("unchecked")
public class PostController {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostBookmarkRepository postBookmarkRepository;
    private final CommentRepository commentRepository;
    private final UserProfileRepository profileRepository;
    private final UserService userService;
    private final FollowRepository followRepository;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public PostController(
            PostRepository postRepository,
            PostLikeRepository postLikeRepository,
            PostBookmarkRepository postBookmarkRepository,
            CommentRepository commentRepository,
            UserProfileRepository profileRepository,
            UserService userService,
            FollowRepository followRepository,
            NotificationRepository notificationRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.postBookmarkRepository = postBookmarkRepository;
        this.commentRepository = commentRepository;
        this.profileRepository = profileRepository;
        this.userService = userService;
        this.followRepository = followRepository;
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    private String resolveUserId(String headerUserId) {
        try {
            com.agricompass.entity.UserProfile p = userService.syncUser(null);
            if (p != null && p.getId() != null) return p.getId();
        } catch (Exception ignored) {}
        if (headerUserId != null && !headerUserId.trim().isEmpty()) {
            return headerUserId.trim();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getPosts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {

        String query = (q != null && !q.trim().isEmpty()) ? q : "";
        String loc = (location != null && !location.trim().isEmpty()) ? location : "";
        String requestedUser = userId != null ? userId : user;
        String userIdFilter = (requestedUser != null && !requestedUser.trim().isEmpty()) ? requestedUser : "";

        String currentUserId = resolveUserId(headerUserId);
        List<String> followedIds = List.of("dummy_id_no_match");
        if (currentUserId != null) {
            List<String> userFollowed = followRepository.findByFollowerId(currentUserId)
                    .stream().map(f -> f.getFollowingId()).toList();
            if (!userFollowed.isEmpty()) {
                followedIds = userFollowed;
            }
        }
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(Math.max(0, page - 1), limit);
        org.springframework.data.domain.Page<Post> postsPage = postRepository.findWithFilters(query, loc, userIdFilter, pageable);

        List<String> postIds = postsPage.getContent().stream().map(Post::getId).distinct().toList();
        
        Map<String, Long> tmpLikeCounts = new HashMap<>();
        Map<String, Long> tmpCommentCounts = new HashMap<>();
        Set<String> tmpLikedByMe = new HashSet<>();
        Set<String> tmpBookmarkedByMe = new HashSet<>();
        
        if (!postIds.isEmpty()) {
            tmpLikeCounts = postLikeRepository.countByPostIds(postIds).stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));
            
            tmpCommentCounts = commentRepository.countByPostIds(postIds).stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));
                
            if (currentUserId != null) {
                tmpLikedByMe.addAll(postLikeRepository.findLikedPostIds(postIds, currentUserId));
                tmpBookmarkedByMe.addAll(postBookmarkRepository.findBookmarkedPostIds(postIds, currentUserId));
            }
        }
        
        final Map<String, Long> likeCounts = tmpLikeCounts;
        final Map<String, Long> commentCounts = tmpCommentCounts;
        final Set<String> likedByMe = tmpLikedByMe;
        final Set<String> bookmarkedByMe = tmpBookmarkedByMe;

        List<String> userIds = postsPage.getContent().stream().map(Post::getUserId).distinct().toList();
        List<com.agricompass.entity.UserProfile> profiles = profileRepository.findAllById(userIds);
        Map<String, com.agricompass.entity.UserProfile> profileMap = profiles.stream()
                .collect(Collectors.toMap(com.agricompass.entity.UserProfile::getId, p -> p));

        final String finalUserId = currentUserId;
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
            dto.put("crop_tag", post.getCropTag());
            dto.put("mandi_price", post.getMandiPrice());
            dto.put("poll", parsePoll(post.getPollJson(), finalUserId));

            dto.put("isLiked", likedByMe.contains(post.getId()));
            dto.put("isBookmarked", bookmarkedByMe.contains(post.getId()));

            com.agricompass.entity.UserProfile p = profileMap.get(post.getUserId());
            dto.put("user", userDtoFromProfile(post.getUserId(), p));

            return dto;
        }).getContent();

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Map<String, Object> body) {
        String userId = null;
        try {
            com.agricompass.entity.UserProfile p = userService.syncUser(null);
            if (p != null) userId = p.getId();
        } catch (Exception ignored) {}

        if (userId == null || userId.trim().isEmpty()) {
            if (body.get("userId") != null) userId = String.valueOf(body.get("userId")).trim();
            else if (body.get("user_id") != null) userId = String.valueOf(body.get("user_id")).trim();
            else userId = "farmer_anonymous";
        }

        String bodyContent = body.get("body") != null ? (String) body.get("body") : (String) body.get("content");
        String category = (String) body.get("category");
        
        com.agricompass.entity.UserProfile userProfile = profileRepository.findByIdIgnoreCase(userId).orElse(null);
        String location = (userProfile != null && userProfile.getDistrict() != null && !userProfile.getDistrict().isEmpty()) 
                ? userProfile.getDistrict() 
                : (String) body.get("location");

        List<String> imagesList = new ArrayList<>();
        Object imagesObj = body.get("images");
        if (imagesObj instanceof List<?>) {
            for (Object item : (List<?>) imagesObj) {
                if (item != null && !item.toString().isBlank()) {
                    imagesList.add(item.toString().trim());
                }
            }
        } else if (imagesObj instanceof String && !((String) imagesObj).isBlank()) {
            imagesList.add(((String) imagesObj).trim());
        }

        if (body.get("imageUrl") != null && !body.get("imageUrl").toString().isBlank()) {
            String img = body.get("imageUrl").toString().trim();
            if (!imagesList.contains(img)) imagesList.add(img);
        } else if (body.get("image_url") != null && !body.get("image_url").toString().isBlank()) {
            String img = body.get("image_url").toString().trim();
            if (!imagesList.contains(img)) imagesList.add(img);
        }

        Post post = Post.builder()
            .userId(userId)
            .body(bodyContent)
            .location(location)
            .images(imagesList)
            .build();

        if (category != null) {
            post.setCategory(category);
        }
        post.setImages(imagesList);

        if (body.get("crop_tag") != null && !body.get("crop_tag").toString().isBlank()) {
            post.setCropTag(body.get("crop_tag").toString().trim());
        } else if (body.get("cropTag") != null && !body.get("cropTag").toString().isBlank()) {
            post.setCropTag(body.get("cropTag").toString().trim());
        }

        if (body.get("mandi_price") != null && !body.get("mandi_price").toString().isBlank()) {
            post.setMandiPrice(body.get("mandi_price").toString().trim());
        } else if (body.get("mandiPrice") != null && !body.get("mandiPrice").toString().isBlank()) {
            post.setMandiPrice(body.get("mandiPrice").toString().trim());
        }

        if (body.get("poll") != null) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                post.setPollJson(mapper.writeValueAsString(body.get("poll")));
            } catch (Exception ignored) {}
        } else if (body.get("poll_json") != null && !body.get("poll_json").toString().isBlank()) {
            post.setPollJson(body.get("poll_json").toString().trim());
        }

        return ResponseEntity.ok(postRepository.save(post));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPost(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String currentUserId = resolveUserId(headerUserId);
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
        dto.put("isBookmarked", currentUserId != null &&
            postBookmarkRepository.findByPostIdAndClerkUserId(post.getId(), currentUserId).isPresent());
        dto.put("crop_tag", post.getCropTag());
        dto.put("mandi_price", post.getMandiPrice());
        dto.put("poll", parsePoll(post.getPollJson(), currentUserId));
        
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
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String userId = resolveUserId(headerUserId);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        
        Optional<PostLike> existing = postLikeRepository.findByPostIdAndClerkUserId(id, userId);
        if (existing.isPresent()) {
            postLikeRepository.delete(existing.get());
            return ResponseEntity.ok(Map.of("liked", false, "count", postLikeRepository.countByPostId(id)));
        } else {
            postLikeRepository.save(new PostLike(id, userId));

            // Notify post author if not self-like
            if (post.getUserId() != null && !post.getUserId().equals(userId)) {
                try {
                    com.agricompass.entity.UserProfile liker = profileRepository.findById(userId).orElse(null);
                    String likerName = liker != null && liker.getFullName() != null ? liker.getFullName() : (liker != null ? liker.getUsername() : "A farmer");
                    String likerAvatar = liker != null ? liker.getAvatarUrl() : null;
                    String preview = post.getBody() != null ? (post.getBody().length() > 50 ? post.getBody().substring(0, 47) + "..." : post.getBody()) : "your post";

                    Notification n = new Notification();
                    n.setRecipientUserId(post.getUserId());
                    n.setSenderUserId(userId);
                    n.setAuthorName(likerName);
                    n.setAuthorAvatar(likerAvatar);
                    n.setType("LIKE");
                    n.setMessage(likerName + " liked your post: \"" + preview + "\"");
                    n.setLink("/community?postId=" + post.getId());
                    n.setIsRead(false);
                    notificationRepository.save(n);

                    if (messagingTemplate != null) {
                        Map<String, Object> payload = new HashMap<>();
                        payload.put("id", n.getId());
                        payload.put("type", n.getType());
                        payload.put("message", n.getMessage());
                        payload.put("timestamp", n.getCreatedAt());
                        payload.put("link", n.getLink());
                        payload.put("authorName", n.getAuthorName());
                        payload.put("authorAvatar", n.getAuthorAvatar());
                        payload.put("senderUserId", n.getSenderUserId());
                        payload.put("isRead", false);
                        messagingTemplate.convertAndSend("/topic/notifications." + post.getUserId(), payload);
                    }
                } catch (Exception ignored) {}
            }

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
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable String id, 
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String userId = resolveUserId(headerUserId);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        
        Comment comment = new Comment();
        comment.setPostId(post.getId());
        comment.setUserId(userId);
        String commentContent = body.get("content");
        comment.setContent(commentContent);
        comment = commentRepository.save(comment);

        // Fetch user profile properly for response
        com.agricompass.entity.UserProfile userProfile = profileRepository.findById(userId).orElse(null);
        Map<String, Object> userMap = userDtoFromProfile(userId, userProfile);
        UserSummaryDTO userDto = new UserSummaryDTO(
            (String) userMap.get("id"),
            (String) userMap.get("username"),
            (String) userMap.get("avatar_url")
        );

        // Notify post author if not self-comment
        if (post.getUserId() != null && !post.getUserId().equals(userId)) {
            try {
                String commenterName = (String) userMap.get("fullName");
                String commenterAvatar = (String) userMap.get("avatar_url");
                String preview = commentContent != null ? (commentContent.length() > 50 ? commentContent.substring(0, 47) + "..." : commentContent) : "";

                Notification n = new Notification();
                n.setRecipientUserId(post.getUserId());
                n.setSenderUserId(userId);
                n.setAuthorName(commenterName);
                n.setAuthorAvatar(commenterAvatar);
                n.setType("COMMENT");
                n.setMessage(commenterName + " commented: \"" + preview + "\"");
                n.setLink("/community?postId=" + post.getId());
                n.setIsRead(false);
                notificationRepository.save(n);

                if (messagingTemplate != null) {
                    Map<String, Object> payload = new HashMap<>();
                    payload.put("id", n.getId());
                    payload.put("type", n.getType());
                    payload.put("message", n.getMessage());
                    payload.put("timestamp", n.getCreatedAt());
                    payload.put("link", n.getLink());
                    payload.put("authorName", n.getAuthorName());
                    payload.put("authorAvatar", n.getAuthorAvatar());
                    payload.put("senderUserId", n.getSenderUserId());
                    payload.put("isRead", false);
                    messagingTemplate.convertAndSend("/topic/notifications." + post.getUserId(), payload);
                }
            } catch (Exception ignored) {}
        }
        
        CommentResponseDTO response = new CommentResponseDTO(
            comment.getId(),
            comment.getContent(),
            comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : null,
            userDto
        );
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Void> deletePost(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String currentUserId = resolveUserId(headerUserId);
        if (currentUserId == null) return ResponseEntity.status(401).build();
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getUserId().equals(currentUserId)) {
            return ResponseEntity.status(403).build();
        }
        
        // Delete related records to prevent foreign key constraint violations
        commentRepository.deleteByPostId(id);
        postLikeRepository.deleteByPostId(id);
        postBookmarkRepository.deleteByPostId(id);
        
        postRepository.delete(post);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<Map<String, Object>> toggleBookmark(
            @PathVariable String id,
            @RequestParam(required = false) String userId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String currentUserId = resolveUserId(headerUserId);
        if (currentUserId == null && userId != null && !userId.isBlank()) {
            currentUserId = userId.trim();
        }
        if (currentUserId == null || currentUserId.isBlank()) {
            currentUserId = "farmer_anonymous";
        }

        Optional<PostBookmark> existing = postBookmarkRepository.findByPostIdAndClerkUserId(id, currentUserId);
        boolean bookmarked;
        if (existing.isPresent()) {
            postBookmarkRepository.deleteByPostIdAndClerkUserId(id, currentUserId);
            bookmarked = false;
        } else {
            postBookmarkRepository.save(new PostBookmark(id, currentUserId));
            bookmarked = true;
        }

        return ResponseEntity.ok(Map.of("bookmarked", bookmarked, "postId", id));
    }

    @GetMapping("/bookmarked")
    public ResponseEntity<List<Map<String, Object>>> getBookmarkedPosts(
            @RequestParam(required = false) String userId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String currentUserId = resolveUserId(headerUserId);
        if (currentUserId == null && userId != null && !userId.isBlank()) {
            currentUserId = userId.trim();
        }
        if (currentUserId == null || currentUserId.isBlank()) {
            currentUserId = "farmer_anonymous";
        }

        List<String> bookmarkedPostIds = postBookmarkRepository.findPostIdsByClerkUserId(currentUserId);
        if (bookmarkedPostIds == null || bookmarkedPostIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<Post> posts = postRepository.findAllById(bookmarkedPostIds);
        Map<String, Post> postMap = posts.stream().collect(Collectors.toMap(Post::getId, p -> p, (a, b) -> a));
        List<Post> orderedPosts = bookmarkedPostIds.stream()
                .map(postMap::get)
                .filter(Objects::nonNull)
                .toList();

        List<String> postIds = orderedPosts.stream().map(Post::getId).distinct().toList();
        Map<String, Long> likeCounts = postLikeRepository.countByPostIds(postIds).stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));
        Map<String, Long> commentCounts = commentRepository.countByPostIds(postIds).stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));
        Set<String> likedByMe = new HashSet<>(postLikeRepository.findLikedPostIds(postIds, currentUserId));

        List<String> userIds = orderedPosts.stream().map(Post::getUserId).distinct().toList();
        List<com.agricompass.entity.UserProfile> profiles = profileRepository.findAllById(userIds);
        Map<String, com.agricompass.entity.UserProfile> profileMap = profiles.stream()
                .collect(Collectors.toMap(com.agricompass.entity.UserProfile::getId, p -> p, (a, b) -> a));

        final String finalUserId = currentUserId;
        List<Map<String, Object>> result = orderedPosts.stream().map(post -> {
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
            dto.put("crop_tag", post.getCropTag());
            dto.put("mandi_price", post.getMandiPrice());
            dto.put("poll", parsePoll(post.getPollJson(), finalUserId));

            dto.put("isLiked", likedByMe.contains(post.getId()));
            dto.put("isBookmarked", true);

            com.agricompass.entity.UserProfile p = profileMap.get(post.getUserId());
            dto.put("user", userDtoFromProfile(post.getUserId(), p));

            return dto;
        }).toList();

        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/poll/vote")
    public ResponseEntity<?> votePoll(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(required = false, name = "optionId") String optIdParam,
            @RequestParam(required = false) String userId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String currentUserId = resolveUserId(headerUserId);
        if (currentUserId == null && body != null && body.get("userId") != null) {
            currentUserId = String.valueOf(body.get("userId")).trim();
        } else if (currentUserId == null && userId != null && !userId.isBlank()) {
            currentUserId = userId.trim();
        }
        if (currentUserId == null || currentUserId.isBlank()) {
            currentUserId = "farmer_anonymous";
        }

        String optionId = (body != null && body.get("optionId") != null)
                ? String.valueOf(body.get("optionId")).trim()
                : (optIdParam != null ? optIdParam.trim() : null);
        if (optionId == null || optionId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "optionId is required"));
        }

        Post post = postRepository.findById(id).orElse(null);
        if (post == null || post.getPollJson() == null || post.getPollJson().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Poll not found on this post"));
        }

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> pollMap = mapper.readValue(post.getPollJson(), Map.class);
            Map<String, String> userVotes = (Map<String, String>) pollMap.computeIfAbsent("user_votes", k -> new HashMap<String, String>());
            String previousVote = userVotes.get(currentUserId);

            List<Map<String, Object>> options = (List<Map<String, Object>>) pollMap.get("options");
            if (options != null) {
                if (previousVote != null && !previousVote.equals(optionId)) {
                    for (Map<String, Object> opt : options) {
                        if (previousVote.equals(String.valueOf(opt.get("id")))) {
                            Number count = (Number) opt.getOrDefault("votes", 0);
                            opt.put("votes", Math.max(0, (count != null ? count.intValue() : 0) - 1));
                        }
                    }
                }

                if (!optionId.equals(previousVote)) {
                    for (Map<String, Object> opt : options) {
                        if (optionId.equals(String.valueOf(opt.get("id")))) {
                            Number count = (Number) opt.getOrDefault("votes", 0);
                            opt.put("votes", (count != null ? count.intValue() : 0) + 1);
                        }
                    }
                    userVotes.put(currentUserId, optionId);
                }
            }

            post.setPollJson(mapper.writeValueAsString(pollMap));
            postRepository.save(post);

            return ResponseEntity.ok(parsePoll(post.getPollJson(), currentUserId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to register vote"));
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parsePoll(String pollJson, String currentUserId) {
        if (pollJson == null || pollJson.trim().isEmpty() || pollJson.equals("{}")) return null;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> map = mapper.readValue(pollJson, Map.class);
            Map<String, String> userVotes = (Map<String, String>) map.getOrDefault("user_votes", new HashMap<>());
            String myVote = currentUserId != null ? userVotes.get(currentUserId) : null;
            map.put("user_voted_option_id", myVote);
            map.put("has_voted", myVote != null);

            List<Map<String, Object>> options = (List<Map<String, Object>>) map.get("options");
            int total = 0;
            if (options != null) {
                for (Map<String, Object> opt : options) {
                    Number votes = (Number) opt.getOrDefault("votes", 0);
                    total += (votes != null ? votes.intValue() : 0);
                }
                for (Map<String, Object> opt : options) {
                    Number votes = (Number) opt.getOrDefault("votes", 0);
                    int v = votes != null ? votes.intValue() : 0;
                    int pct = total > 0 ? (int) Math.round((v * 100.0) / total) : 0;
                    opt.put("percentage", pct);
                }
            }
            map.put("total_votes", total);
            Map<String, Object> safeMap = new HashMap<>(map);
            safeMap.remove("user_votes");
            return safeMap;
        } catch (Exception e) {
            return null;
        }
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
