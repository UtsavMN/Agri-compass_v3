package com.agricompass.repository;

import com.agricompass.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId);
}
