FROM maven:3.9.4-eclipse-temurin-17-alpine as build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src src

# Build the application using pure Maven (bypassing wrapper issues)
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
