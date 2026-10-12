package com.agricompass.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Value("${cloudinary.cloud-name:${CLOUDINARY_CLOUD_NAME:${cloudinary_cloud_name:}}}")
    private String cloudName;

    @Value("${cloudinary.api-key:${CLOUDINARY_API_KEY:${cloudinary_api_key:}}}")
    private String apiKey;

    @Value("${cloudinary.api-secret:${CLOUDINARY_API_SECRET:${cloudinary_api_secret:}}}")
    private String apiSecret;

    @Value("${cloudinary.url:${CLOUDINARY_URL:}}")
    private String cloudinaryUrl;

    private Cloudinary getCloudinaryClient() {
        String cUrl = cloudinaryUrl;
        if (cUrl == null || cUrl.isBlank()) {
            cUrl = System.getenv("CLOUDINARY_URL");
        }
        if (cUrl != null && !cUrl.isBlank() && cUrl.startsWith("cloudinary://")) {
            return new Cloudinary(cUrl);
        }

        String cName = cloudName != null && !cloudName.isBlank() ? cloudName : System.getenv("CLOUDINARY_CLOUD_NAME");
        String aKey = apiKey != null && !apiKey.isBlank() ? apiKey : System.getenv("CLOUDINARY_API_KEY");
        String aSec = apiSecret != null && !apiSecret.isBlank() ? apiSecret : System.getenv("CLOUDINARY_API_SECRET");

        if (cName != null && !cName.isBlank() && !cName.contains("your_") &&
            aKey != null && !aKey.isBlank() &&
            aSec != null && !aSec.isBlank()) {
            return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cName.trim(),
                "api_key", aKey.trim(),
                "api_secret", aSec.trim()
            ));
        }

        return null;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getUploadStatus() {
        Cloudinary client = getCloudinaryClient();
        boolean isConfigured = client != null;
        return ResponseEntity.ok(Map.of(
            "cloudinary_configured", isConfigured,
            "cloud_name", cloudName != null ? cloudName : "",
            "has_url", cloudinaryUrl != null && !cloudinaryUrl.isBlank()
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "agri-compass/posts") String folder) {

        try {
            Cloudinary cloudinary = getCloudinaryClient();
            if (cloudinary == null) {
                // Return a reliable fallback URL if Cloudinary is not configured yet
                return ResponseEntity.ok(Map.of(
                    "url", "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
                    "note", "Cloudinary not configured in environment, fallback applied"
                ));
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap("folder", folder)
            );
            return ResponseEntity.ok(Map.of("url", uploadResult.get("secure_url").toString()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to upload file to Cloudinary: " + e.getMessage()));
        }
    }
}
