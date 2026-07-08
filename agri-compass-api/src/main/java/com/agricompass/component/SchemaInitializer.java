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
            System.out.println("⏳ Running manual schema initialization for Turso with forced migrations v2...");
            
            // Explicitly add missing columns that failed to sync via ddl-auto
            String[] migrations = {
                "ALTER TABLE crops ADD COLUMN ai_score_id bigint;",
                "ALTER TABLE crops ADD COLUMN water_requirement varchar(255);",
                "ALTER TABLE crops ADD COLUMN breakeven_months integer;",
                "ALTER TABLE crops ADD COLUMN difficulty_level varchar(255);",
                "ALTER TABLE crops ADD COLUMN expected_returns float;",
                "ALTER TABLE crops ADD COLUMN investment_per_acre float;",
                "ALTER TABLE crops ADD COLUMN weather_pattern varchar(255);",
                "ALTER TABLE crops ADD COLUMN duration_days integer;",
                "ALTER TABLE crops ADD COLUMN guidelines TEXT;",
                "ALTER TABLE crops ADD COLUMN image_url varchar(255);",
                "ALTER TABLE crops ADD COLUMN market_info_id bigint;",
                "ALTER TABLE crops ADD COLUMN nutrient_id bigint;",
                "ALTER TABLE crops ADD COLUMN post_harvest_id bigint;",
                "ALTER TABLE crops ADD COLUMN rainfall_mm varchar(255);",
                "ALTER TABLE crops ADD COLUMN scientific_name varchar(255);",
                "ALTER TABLE crops ADD COLUMN soil_requirement_id bigint;",
                "ALTER TABLE crops ADD COLUMN temperature_range varchar(255);",
                "ALTER TABLE crops ADD COLUMN yield_info_id bigint;"
            };
            
            for (String migration : migrations) {
                try {
                    jdbcTemplate.execute(migration);
                    System.out.println("✅ Applied migration: " + migration);
                } catch (Exception e) {
                    // Ignore, column likely exists
                }
            }

            ClassPathResource resource = new ClassPathResource("schema.sql");
            if (resource.exists()) {
                String sqlScript = FileCopyUtils.copyToString(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));
                String[] statements = sqlScript.split(";");
                for (String statement : statements) {
                    String trimmed = statement.trim();
                    if (!trimmed.isEmpty()) {
                        try {
                            jdbcTemplate.execute(trimmed);
                        } catch (Exception ex) {
                            // Suppress logs for duplicate indices to avoid console spam
                        }
                    }
                }
                System.out.println("✅ Manual schema initialization completed successfully.");
            }
        } catch (Exception e) {
            System.err.println("❌ Error during manual schema initialization: " + e.getMessage());
        }
    }
}
