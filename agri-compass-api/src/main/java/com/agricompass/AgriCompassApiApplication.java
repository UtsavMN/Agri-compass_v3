package com.agricompass;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class AgriCompassApiApplication {
    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(AgriCompassApiApplication.class, args);
    }

    private static void loadDotEnv() {
        try {
            // Check potential .env paths relative to current execution context
            String[] paths = {".env", "agri-compass-api/.env", "../.env"};
            for (String p : paths) {
                if (Files.exists(Paths.get(p))) {
                    List<String> lines = Files.readAllLines(Paths.get(p));
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            // Strip surrounding quotes if present
                            if (value.startsWith("\"") && value.endsWith("\"")) {
                                value = value.substring(1, value.length() - 1);
                            } else if (value.startsWith("'") && value.endsWith("'")) {
                                value = value.substring(1, value.length() - 1);
                            }
                            System.setProperty(key, value);
                        }
                    }
                    System.out.println("Loaded environment variables from: " + Paths.get(p).toAbsolutePath());
                    break;
                }
            }
        } catch (IOException e) {
            System.err.println("Could not load .env file: " + e.getMessage());
        }
    }
}
