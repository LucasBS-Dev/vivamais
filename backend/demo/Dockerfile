FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn --batch-mode --no-transfer-progress dependency:go-offline
COPY src ./src
RUN mvn --batch-mode --no-transfer-progress -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-eng && addgroup -S viva && adduser -S viva -G viva && mkdir -p /app/.local/private-files && chown -R viva:viva /app/.local
COPY --from=build --chown=viva:viva /workspace/target/viva-mais-api-0.1.0-SNAPSHOT.jar app.jar
USER viva
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=65.0 -XX:InitialRAMPercentage=20.0 -XX:+ExitOnOutOfMemoryError -Duser.timezone=UTC"
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
