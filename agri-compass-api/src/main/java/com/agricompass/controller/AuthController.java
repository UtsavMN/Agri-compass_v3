package com.agricompass.controller;

import com.agricompass.entity.PasswordResetToken;
import com.agricompass.entity.User;
import com.agricompass.repository.PasswordResetTokenRepository;
import com.agricompass.repository.UserRepository;
import com.agricompass.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@SuppressWarnings("null")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public AuthController(UserRepository userRepository, PasswordResetTokenRepository resetTokenRepository, EmailService emailService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/forgot-password")
    @Transactional
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        Optional<User> user = userRepository.findByEmail(email.trim());
        if (user.isPresent()) {
            String rawToken = UUID.randomUUID().toString() + UUID.randomUUID();
            String tokenHash = hash(rawToken);

            resetTokenRepository.deleteByUser(user.get());
            resetTokenRepository.save(PasswordResetToken.builder()
                    .user(user.get())
                    .tokenHash(tokenHash)
                    .expiresAt(LocalDateTime.now().plusHours(1))
                    .used(false)
                    .build());

            String resetLink = frontendUrl + "/reset-password?token=" + rawToken + "&email=" + email.trim();
            emailService.sendTextEmail(email.trim(), "Agri Compass password reset", "Use this link to reset your password: " + resetLink);
            System.out.println("Password reset link for " + email.trim() + ": " + resetLink);
        }

        return ResponseEntity.ok(Map.of("message", "If this email exists, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");

        if (token == null || token.trim().isEmpty() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token and new password are required"));
        }

        PasswordResetToken resetToken = resetTokenRepository.findByTokenHash(hash(token))
                .orElseThrow(() -> new RuntimeException("Invalid or expired password reset token"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired password reset token"));
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("Unable to hash token", e);
        }
    }
}