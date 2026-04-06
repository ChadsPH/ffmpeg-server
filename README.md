# ffmpeg-server

Render deployment for AnimeHub mobile downloads.

## Deploy on Render

1. Push this folder to a GitHub repo (can be separate from your main site)
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Set these options:
   - **Environment**: Docker
   - **Branch**: main
   - **Plan**: Free (or Starter for no sleep)
5. Add this Environment Variable:
   - `ALLOWED_ORIGIN` = `https://your-site.vercel.app`
6. Click Deploy

## API

### GET /api/download
Downloads and converts an HLS stream to MP4.

**Query params:**
- `url` — the m3u8 URL (required)
- `referer` — the referer header to send (optional, defaults to megacloud.blog)
- `filename` — output filename (optional, defaults to video.mp4)

**Example:**
```
GET /api/download?url=https://...master.m3u8&referer=https://megacloud.blog/&filename=Naruto-EP1-1080p.mp4
```

### GET /health
Returns `{ "status": "ok" }` — use this to wake the server before downloading.
