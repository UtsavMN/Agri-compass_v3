package com.agricompass.config;

import com.agricompass.entity.Post;
import com.agricompass.entity.UserProfile;
import com.agricompass.repository.PostRepository;
import com.agricompass.repository.UserProfileRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

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
        if (userProfileRepository.count() <= 1) {
            seedUsers();
        }
        if (postRepository.count() == 0) {
            seedPosts();
        }
    }

    private void seedUsers() {
        UserProfile u1 = new UserProfile();
        u1.setClerkUserId("mock_user_1");
        u1.setFullName("Ramesh Gowda");
        u1.setUsernameHandle("ramesh_g");
        u1.setDistrict("Mandya");
        u1.setProfilePictureUrl("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150");
        u1.setOnboardingCompleted(1);

        UserProfile u2 = new UserProfile();
        u2.setClerkUserId("mock_user_2");
        u2.setFullName("Suresh Patil");
        u2.setUsernameHandle("suresh_patil");
        u2.setDistrict("Belagavi");
        u2.setProfilePictureUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150");
        u2.setOnboardingCompleted(1);

        UserProfile u3 = new UserProfile();
        u3.setClerkUserId("mock_user_3");
        u3.setFullName("Lakshmi Devi");
        u3.setUsernameHandle("lakshmi_d");
        u3.setDistrict("Mysuru");
        u3.setProfilePictureUrl("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150");
        u3.setOnboardingCompleted(1);

        userProfileRepository.saveAll(List.of(u1, u2, u3));
        System.out.println("Seeded mock users.");
    }

    private void seedPosts() {
        Post p1 = new Post();
        p1.setId(UUID.randomUUID().toString());
        p1.setClerkUserId("mock_user_1");
        p1.setContent("Harvested my sugarcane today. The yield is much better than last year despite the erratic rains!");

        Post p2 = new Post();
        p2.setId(UUID.randomUUID().toString());
        p2.setClerkUserId("mock_user_3");
        p2.setContent("Can anyone recommend a good organic pesticide for tomato blight? I'm trying to avoid chemicals this season.");

        Post p3 = new Post();
        p3.setId(UUID.randomUUID().toString());
        p3.setClerkUserId("mock_user_2");
        p3.setContent("Mandi prices for onion in Belagavi are looking good today. Thinking of selling half my stock.");
        
        postRepository.saveAll(List.of(p1, p2, p3));
        System.out.println("Seeded mock posts.");
    }
}
