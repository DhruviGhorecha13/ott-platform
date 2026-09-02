#!/usr/bin/env node
// Generates a short (6s), silent, locally-rendered MP4 "preview clip" for
// every title in data/movies.json, so the Play button has something real
// to play — entirely offline, via ffmpeg, no internet or licensed footage
// involved. Run with: node scripts/generateVideos.js
// (requires ffmpeg on PATH — already present in most dev setups; if not,
// install it or skip this step, the app still works without videos, the
// Play button will just 404 on the video file.)

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "data", "movies.json");
const videosDir = path.join(__dirname, "..", "public", "videos");
const tmpDir = path.join(__dirname, "..", "public", ".tmp-titles");

fs.mkdirSync(videosDir, { recursive: true });
fs.mkdirSync(tmpDir, { recursive: true });

const { titles } = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

const PALETTES = {
  1: "0x7C2D12", 2: "0x134E4A", 3: "0x831843", 4: "0x713F12", 5: "0x1E293B",
  6: "0x1E1B4B", 7: "0x064E3B", 8: "0x4C1D95", 9: "0x78350F", 10: "0x18181B",
  11: "0x312E81", 12: "0x111827", 13: "0x831843", 14: "0x0C4A6E", 15: "0x14532D",
  16: "0x1C1917", 17: "0x292524", 18: "0x1E3A8A", 19: "0x581C87",
};

const FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
const DURATION = 6;

let ok = 0;
let failed = 0;

for (const t of titles) {
  if (t.real_media) continue; // real trimmed clips already in place, never overwrite
  const color = PALETTES[t.genre_ids[0]] || "0x1E1B4B";
  const outPath = path.join(videosDir, `${t.id}.mp4`);
  const titleFile = path.join(tmpDir, `${t.id}.txt`);
  const subFile = path.join(tmpDir, `${t.id}-sub.txt`);

  fs.writeFileSync(titleFile, t.title);
  fs.writeFileSync(subFile, "StreamHub Preview \u2014 Offline Demo Clip");

  const vf = [
    `drawtext=textfile='${titleFile}':fontfile='${FONT}':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=(h-text_h)/2-20`,
    `drawtext=textfile='${subFile}':fontfile='${FONT}':fontcolor=white@0.65:fontsize=20:x=(w-text_w)/2:y=(h-text_h)/2+40`,
    `fade=t=in:st=0:d=1`,
    `fade=t=out:st=${DURATION - 1}:d=1`,
  ].join(",");

  const cmd = [
    "ffmpeg -y -loglevel error",
    `-f lavfi -i "color=c=${color}:s=640x360:d=${DURATION}:r=24"`,
    `-vf "${vf}"`,
    "-c:v libx264 -pix_fmt yuv420p -movflags +faststart",
    `-t ${DURATION}`,
    `"${outPath}"`,
  ].join(" ");

  try {
    execSync(cmd, { stdio: ["ignore", "ignore", "pipe"] });
    ok++;
  } catch (err) {
    console.error(`Failed for "${t.title}":`, err.stderr?.toString() || err.message);
    failed++;
  }
}

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log(`Generated ${ok} video clips${failed ? `, ${failed} failed` : ""}.`);
