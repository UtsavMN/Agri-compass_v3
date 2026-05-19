package com.agricompass.dto;

public class AuthDTOs {

    public static class LoginRequest {
        private String usernameOrEmail;
        private String password;

        public String getUsernameOrEmail() { return usernameOrEmail; }
        public void setUsernameOrEmail(String usernameOrEmail) { this.usernameOrEmail = usernameOrEmail; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class SignupRequest {
        private String username;
        private String email;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class JwtResponse {
        private String token;
        private String id;
        private String username;
        private String email;
        private String district;

        public JwtResponse() {}

        public JwtResponse(String token, String id, String username, String email, String district) {
            this.token = token;
            this.id = id;
            this.username = username;
            this.email = email;
            this.district = district;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }

        public static JwtResponseBuilder builder() {
            return new JwtResponseBuilder();
        }

        public static class JwtResponseBuilder {
            private String token;
            private String id;
            private String username;
            private String email;
            private String district;

            public JwtResponseBuilder token(String token) { this.token = token; return this; }
            public JwtResponseBuilder id(String id) { this.id = id; return this; }
            public JwtResponseBuilder username(String username) { this.username = username; return this; }
            public JwtResponseBuilder email(String email) { this.email = email; return this; }
            public JwtResponseBuilder district(String district) { this.district = district; return this; }

            public JwtResponse build() {
                return new JwtResponse(token, id, username, email, district);
            }
        }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class ForgotPasswordRequest {
        private String email;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class ResetPasswordRequest {
        private String token;
        private String newPassword;

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
