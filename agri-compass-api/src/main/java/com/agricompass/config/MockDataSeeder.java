package com.agricompass.config;

import com.agricompass.repository.PostRepository;
import com.agricompass.repository.UserProfileRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MockDataSeeder implements CommandLineRunner {

    private final UserProfileRepository userProfileRepository;
    private final PostRepository postRepository;

    public MockDataSeeder(UserProfileRepository userProfileRepository, PostRepository postRepository) {
        this.userProfileRepository = userProfileRepository;
        this.postRepository = postRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Clean up legacy mock users and posts to ensure zero mock data in database
        try {
            List<String> mockIds = List.of("mock_user_1", "mock_user_2", "mock_user_3");
            postRepository.findAll().stream()
                .filter(p -> mockIds.contains(p.getClerkUserId()))
                .forEach(postRepository::delete);

            mockIds.forEach(id -> {
                userProfileRepository.findById(id).ifPresent(userProfileRepository::delete);
            });
        } catch (Exception ignored) {
        }
    }
}
