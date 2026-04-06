import express from "express";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3000;

// Allow your Vercel site to call this
app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  // Allow your Vercel domain and localhost for dev
  const allowed = [
    process.env.ALLOWED_ORIGIN || "",
    "http://localhost:5173",
    "http://localhost:3000",
  ];
  if (allowed.some(o => o && origin.startsWith(o)) || !origin) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/download", async (req, res) => {
  const { url, referer, filename } = req.query;

  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "Invalid or missing m3u8 URL." });
  }

  const safeFilename = filename
    ? filename.replace(/[^a-zA-Z0-9.\-_]/g, "_")
    : "video.mp4";

  const tempDir = os.tmpdir();
  const outPath = path.join(tempDir, `animehub_${Date.now()}.mp4`);
  const useReferer = referer ? decodeURIComponent(referer) : "https://megacloud.blog/";

  console.log("[ffmpeg] Download request:", url);
  console.log("[ffmpeg] Referer:", useReferer);
  console.log("[ffmpeg] Output:", outPath);

  try {
    // Use ffmpeg directly — handles HLS, sets referer header, converts to MP4
    const ffmpegCmd = [
      "ffmpeg",
      `-headers "Referer: ${useReferer}\r\nUser-Agent: Mozilla/5.0"`,
      `-i "${url}"`,
      "-c copy",        // no re-encode, just remux — fast
      "-bsf:a aac_adtstoasc",
      "-movflags faststart",
      `-y "${outPath}"`,
    ].join(" ");

    await execAsync(ffmpegCmd, { timeout: 300000 }); // 5 min max

    if (!fs.existsSync(outPath)) {
      throw new Error("ffmpeg did not produce an output file.");
    }

    const stat = fs.statSync(outPath);
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);

    const stream = fs.createReadStream(outPath);
    stream.pipe(res);
    stream.on("close", () => fs.unlink(outPath, () => {}));
    stream.on("error", (err) => {
      console.error("[ffmpeg] Stream error:", err);
      if (!res.headersSent) res.status(500).end();
    });

  } catch (err) {
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    console.error("[ffmpeg] Failed:", err.message);
    res.status(500).json({ error: "Conversion failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`ffmpeg-server running on port ${PORT}`);
});
