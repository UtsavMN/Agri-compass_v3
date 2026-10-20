FROM maven:3.9.6-eclipse-temurin-17-alpine as build
WORKDIR /app

# Cache dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build
COPY src src
RUN mvn clean package -DskipTests -Dmaven.test.skip=true

# Run stage - Use Jammy (Ubuntu/glibc) for 100% reliable SQLite native binaries & fast DNS resolution
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose Spring Boot port (Render automatically maps $PORT)
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
