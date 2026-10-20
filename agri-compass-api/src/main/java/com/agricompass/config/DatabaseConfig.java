package com.agricompass.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.sql.Connection;
import java.sql.DriverManager;

/**
 * Resilient Database configuration supporting seamless switching between
 * PostgreSQL (Production / Cloud / Render / Neon / Supabase) and
 * SQLite (Local / Embedded High-Availability Fallback).
 *
 * Automatically parses Render's postgres:// URI format and executes pre-flight
 * connectivity checks to prevent deployment crashes when cloud databases hit quota limits.
 */
@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:${DATABASE_URL:${DB_URL:jdbc:sqlite:agri.db}}}")
    private String configuredUrl;

    @Value("${spring.datasource.username:${SPRING_DATASOURCE_USERNAME:${DATABASE_USERNAME:${DB_USERNAME:}}}}")
    private String configuredUsername;

    @Value("${spring.datasource.password:${SPRING_DATASOURCE_PASSWORD:${DATABASE_PASSWORD:${DB_PASSWORD:}}}}")
    private String configuredPassword;

    private boolean isPostgreSqlActive = false;

    @Bean
    @Primary
    public DataSource dataSource() {
        ResolvedConnectionInfo info = resolveConnection(configuredUrl, configuredUsername, configuredPassword);

        if (info.isPostgres) {
            log.info("Testing PostgreSQL connection at {}...", info.jdbcUrl);
            boolean reachable = testPostgresConnection(info.jdbcUrl, info.username, info.password);
            if (reachable) {
                log.info("? Successfully connected to PostgreSQL database. Activating PostgreSQL engine.");
                isPostgreSqlActive = true;
                return createPostgresDataSource(info);
            } else {
                log.warn("?? Primary PostgreSQL database is unreachable, invalid, or quota exceeded. " +
                         "Falling back to embedded SQLite (jdbc:sqlite:agri.db) to ensure 100% deployment uptime.");
            }
        }

        log.info("Activating embedded SQLite database (jdbc:sqlite:agri.db).");
        isPostgreSqlActive = false;
        return createSqliteDataSource();
    }

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer() {
        return properties -> {
            if (isPostgreSqlActive) {
                properties.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
                log.info("Hibernate dialect configured: org.hibernate.dialect.PostgreSQLDialect");
            } else {
                properties.put("hibernate.dialect", "org.hibernate.community.dialect.SQLiteDialect");
                log.info("Hibernate dialect configured: org.hibernate.community.dialect.SQLiteDialect");
            }
        };
    }

    private boolean testPostgresConnection(String jdbcUrl, String user, String password) {
        java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors.newSingleThreadExecutor();
        java.util.concurrent.Future<Boolean> future = executor.submit(() -> {
            try {
                Class.forName("org.postgresql.Driver");
                String urlWithTimeouts = jdbcUrl;
                if (!urlWithTimeouts.contains("connectTimeout")) {
                    urlWithTimeouts += (urlWithTimeouts.contains("?") ? "&" : "?") + "connectTimeout=4&loginTimeout=4&socketTimeout=4";
                }
                try (Connection conn = DriverManager.getConnection(urlWithTimeouts, user, password)) {
                    return conn != null && !conn.isClosed();
                }
            } catch (Exception e) {
                log.warn("PostgreSQL pre-flight connectivity check failed: {}", e.getMessage());
                return false;
            }
        });

        try {
            return future.get(5, java.util.concurrent.TimeUnit.SECONDS);
        } catch (java.util.concurrent.TimeoutException te) {
            future.cancel(true);
            log.warn("PostgreSQL connectivity check timed out after 5 seconds. Falling back to SQLite.");
            return false;
        } catch (Exception e) {
            log.warn("PostgreSQL check interrupted: {}", e.getMessage());
            return false;
        } finally {
            executor.shutdownNow();
        }
    }

    private DataSource createPostgresDataSource(ResolvedConnectionInfo info) {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(info.jdbcUrl);
        config.setDriverClassName("org.postgresql.Driver");
        if (info.username != null && !info.username.isBlank()) {
            config.setUsername(info.username);
        }
        if (info.password != null && !info.password.isBlank()) {
            config.setPassword(info.password);
        }
        config.setMaximumPoolSize(5);
        config.setConnectionTimeout(20000);
        config.setIdleTimeout(300000);
        config.setConnectionTestQuery("SELECT 1");
        config.setPoolName("AgriCompass-Postgres-Pool");
        return new HikariDataSource(config);
    }

    private DataSource createSqliteDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:sqlite:agri.db");
        config.setDriverClassName("org.sqlite.JDBC");
        config.setMaximumPoolSize(1);
        config.setConnectionTimeout(20000);
        config.setConnectionTestQuery("SELECT 1");
        config.setPoolName("AgriCompass-SQLite-Pool");
        return new HikariDataSource(config);
    }

    private ResolvedConnectionInfo resolveConnection(String rawUrl, String user, String pass) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return new ResolvedConnectionInfo("jdbc:sqlite:agri.db", user, pass, false);
        }

        String trimmed = rawUrl.trim();

        // Handle standard postgresql:// or postgres:// URI strings (common in Render, Heroku, Supabase)
        if (trimmed.startsWith("postgres://") || trimmed.startsWith("postgresql://")) {
            try {
                URI uri = URI.create(trimmed);
                String userInfo = uri.getUserInfo();
                String resolvedUser = user;
                String resolvedPass = pass;

                if (userInfo != null && !userInfo.isBlank()) {
                    String[] parts = userInfo.split(":", 2);
                    resolvedUser = parts[0];
                    if (parts.length > 1) {
                        resolvedPass = parts[1];
                    }
                }

                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                String query = uri.getQuery();

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + (query != null ? "?" + query : "");
                return new ResolvedConnectionInfo(jdbcUrl, resolvedUser, resolvedPass, true);
            } catch (Exception e) {
                log.warn("Could not parse postgres URI '{}': {}. Falling back to default SQLite.", trimmed, e.getMessage());
                return new ResolvedConnectionInfo("jdbc:sqlite:agri.db", user, pass, false);
            }
        }

        if (trimmed.startsWith("jdbc:postgresql:")) {
            return new ResolvedConnectionInfo(trimmed, user, pass, true);
        }

        return new ResolvedConnectionInfo(trimmed, user, pass, false);
    }

    private static class ResolvedConnectionInfo {
        final String jdbcUrl;
        final String username;
        final String password;
        final boolean isPostgres;

        ResolvedConnectionInfo(String jdbcUrl, String username, String password, boolean isPostgres) {
            this.jdbcUrl = jdbcUrl;
            this.username = username;
            this.password = password;
            this.isPostgres = isPostgres;
        }
    }
}
