package com.agricompass.repository;

import com.agricompass.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, String> {
    
    @Query("SELECT c FROM Conversation c WHERE (c.participantOne = :userId OR c.participantTwo = :userId)")
    List<Conversation> findByParticipant(@Param("userId") String userId);

    @Query("SELECT c FROM Conversation c WHERE (c.participantOne = :user1 AND c.participantTwo = :user2) OR (c.participantOne = :user2 AND c.participantTwo = :user1)")
    Optional<Conversation> findByParticipants(@Param("user1") String user1, @Param("user2") String user2);
}
