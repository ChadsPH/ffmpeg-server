# ffmpeg-server

A simple Express server for converting m3u8 streams to MP4 using ffmpeg and m3u8-to-mp4. Designed for deployment on Render, Railway, or any Docker-compatible host.

## Features
- `/api/download?url=...` endpoint: Converts a public m3u8 URL to downloadable MP4
- Streams the MP4 file directly to the client
- Cleans up temporary files after download

## Usage

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   node index.js
   ```
3. Access: `http://localhost:3000/api/download?url=<m3u8_url>`

### Deploy on Render
- Use the included Dockerfile for deployment.
- Exposes port 3000 by default.

## Environment Variables
- `PORT` (optional): Port to run the server (default: 3000)

## Requirements
- Node.js 18+
- ffmpeg (installed automatically in Docker build)

## License
MIT
