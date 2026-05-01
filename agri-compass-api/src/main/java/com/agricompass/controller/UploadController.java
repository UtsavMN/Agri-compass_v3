package com.agricompass.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    // =========================================================================
    // OPTION 1: Local Filesystem (Good for development, use ONLY for local dev)
    // =========================================================================
    private static final String UPLOAD_DIR = "uploads";
    private static final String BASE_URL = "http://localhost:8080/uploads";

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder) {

        try {
            // Create uploads directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR, folder);
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
            String uniqueFilename = UUID.randomUUID() + extension;

            // Save file to disk
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.write(filePath, file.getBytes());

            String fileUrl = BASE_URL + "/" + folder + "/" + uniqueFilename;
            return ResponseEntity.ok(Map.of("url", fileUrl));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    // =========================================================================
    // OPTION 2: AWS S3 (Uncomment and configure for production)
    // =========================================================================
    // @Autowired private software.amazon.awssdk.services.s3.S3Client s3Client;
    // @Value("${aws.s3.bucket-name}") private String bucketName;
    //
    // @PostMapping
    // public ResponseEntity<Map<String, String>> uploadFile(
    //         @RequestParam("file") MultipartFile file,
    //         @RequestParam(value = "folder", defaultValue = "general") String folder) {
    //     try {
    //         String key = folder + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
    //         PutObjectRequest request = PutObjectRequest.builder()
    //             .bucket(bucketName).key(key).contentType(file.getContentType()).build();
    //         s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));
    //         String url = "https://" + bucketName + ".s3.amazonaws.com/" + key;
    //         return ResponseEntity.ok(Map.of("url", url));
    //     } catch (Exception e) {
    //         return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
    //     }
    // }
}
