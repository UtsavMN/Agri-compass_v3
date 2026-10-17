package com.agricompass.repository;

import com.agricompass.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientUserId = :recipientUserId AND (n.isRead = false OR n.isRead IS NULL)")
    long countUnreadByRecipientUserId(@Param("recipientUserId") String recipientUserId);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientUserId = :recipientUserId AND (n.isRead = false OR n.isRead IS NULL)")
    int markAllAsRead(@Param("recipientUserId") String recipientUserId);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id AND n.recipientUserId = :recipientUserId")
    int markAsRead(@Param("id") String id, @Param("recipientUserId") String recipientUserId);
}

