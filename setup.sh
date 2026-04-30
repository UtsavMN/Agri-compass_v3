#!/bin/bash

echo "=========================================================="
echo "🌱 Agri-Compass Setup Script (Linux / Mac)"
echo "=========================================================="
echo ""

# Check for Java 17
if type -p java; then
    _java=java
elif [[ -n "$JAVA_HOME" ]] && [[ -x "$JAVA_HOME/bin/java" ]];  then
    _java="$JAVA_HOME/bin/java"
else
    echo "❌ Java is not installed. Please install Java 17."
    exit 1
fi

if [[ "$_java" ]]; then
    version=$("$_java" -version 2>&1 | awk -F '"' '/version/ {print $2}')
    if [[ "$version" == "17"* ]]; then
        echo "✅ Java 17 detected: $version"
    else
        echo "⚠️ Warning: Java 17 is recommended. Detected version: $version"
    fi
fi

# Check for Node.js
if type -p node; then
    node_version=$(node -v)
    echo "✅ Node.js detected: $node_version"
else
    echo "❌ Node.js is not installed. Please install Node.js."
    exit 1
fi

echo ""
echo "📦 Installing Frontend Dependencies..."
npm install

echo ""
echo "🚀 Starting Agri-Compass..."

# Trap CTRL+C to kill both background processes
trap "kill 0" SIGINT

echo "Starting Frontend on port 5173..."
npm run dev &

echo "Starting Spring Boot Backend on port 8080..."
cd agri-compass-api
chmod +x mvnw
./mvnw spring-boot:run

# Wait for all background jobs to finish
wait
