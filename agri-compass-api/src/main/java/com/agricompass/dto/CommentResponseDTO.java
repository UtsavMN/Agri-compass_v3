package com.agricompass.dto;

public class CommentResponseDTO {
    private String id;
    private String content;
    private String createdAt;
    private UserSummaryDTO user;

    public CommentResponseDTO() {}

    public CommentResponseDTO(String id, String content, String createdAt, UserSummaryDTO user) {
        this.id = id;
        this.content = content;
        this.createdAt = createdAt;
        this.user = user;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public UserSummaryDTO getUser() { return user; }
    public void setUser(UserSummaryDTO user) { this.user = user; }
}
