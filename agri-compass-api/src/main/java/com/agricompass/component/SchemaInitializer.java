package com.agricompass.component;

import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.FileCopyUtils;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Component
public class SchemaInitializer {

    private final JdbcTemplate jdbcTemplate;

    public SchemaInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void initializeSchema() {
        try {
            System.out.println("⏳ Running manual schema initialization for Turso...");
            ClassPathResource resource = new ClassPathResource("schema.sql");
            if (resource.exists()) {
                String sqlScript = FileCopyUtils.copyToString(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));
                
                // Split by semicolon and execute each statement
                String[] statements = sqlScript.split(";");
                for (String statement : statements) {
                    String trimmed = statement.trim();
                    if (!trimmed.isEmpty()) {
                        jdbcTemplate.execute(trimmed);
                    }
                }
                System.out.println("✅ Manual schema initialization completed successfully.");
            }
        } catch (Exception e) {
            System.err.println("❌ Error during manual schema initialization: " + e.getMessage());
        }
    }
}
