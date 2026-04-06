import express from "express";
import M3U8ToMP4 from "m3u8-to-mp4";
import fs from "fs";
import os from "os";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/download", async (req, res) => {
  const url = req.query.url;
  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "Invalid or missing m3u8 URL." });
  }

  const tempDir = os.tmpdir();
  const outPath = path.join(tempDir, `animehub_${Date.now()}_${Math.floor(Math.random()*10000)}.mp4`);

  try {
    const converter = new M3U8ToMP4();
    await converter.start(url, outPath, {
      ffmpegPath: "ffmpeg"
    });
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');
    const readStream = fs.createReadStream(outPath);
    readStream.pipe(res);
    readStream.on("close", () => {
      fs.unlink(outPath, () => {});
    });
  } catch (err) {
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    res.status(500).json({ error: "m3u8-to-mp4 failed", details: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("ffmpeg-server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
