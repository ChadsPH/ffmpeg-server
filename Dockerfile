# Use official Node.js image
FROM node:18-slim

# Install ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
