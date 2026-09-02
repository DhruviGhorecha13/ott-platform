// One-time generator: creates a poster (2:3) and backdrop (16:9) SVG for
// every title in data/movies.json, styled by genre. Run with:
//   node scripts/generateImages.js
// Regenerate any time data/movies.json changes.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "data", "movies.json");
const postersDir = path.join(__dirname, "..", "public", "images", "posters");
const backdropsDir = path.join(__dirname, "..", "public", "images", "backdrops");

fs.mkdirSync(postersDir, { recursive: true });
fs.mkdirSync(backdropsDir, { recursive: true });

const { titles, genres } = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
const genreName = (id) => genres.find((g) => g.id === id)?.name || "";

// A distinct duotone gradient per genre id, so the catalog reads as
// color-coded by mood rather than one flat placeholder look.
const PALETTES = {
  1: ["#7C2D12", "#EA580C"], // Action - burnt orange
  2: ["#134E4A", "#14B8A6"], // Adventure - teal
  3: ["#831843", "#EC4899"], // Animation - pink
  4: ["#713F12", "#EAB308"], // Comedy - gold
  5: ["#1E293B", "#475569"], // Crime - slate
  6: ["#1E1B4B", "#6366F1"], // Drama - indigo
  7: ["#064E3B", "#10B981"], // Family - green
  8: ["#4C1D95", "#A855F7"], // Fantasy - violet
  9: ["#78350F", "#D97706"], // History - amber
  10: ["#18181B", "#DC2626"], // Horror - black/red
  11: ["#312E81", "#818CF8"], // Music - periwinkle
  12: ["#111827", "#4B5563"], // Mystery - charcoal
  13: ["#831843", "#F472B6"], // Romance - rose
  14: ["#0C4A6E", "#0EA5E9"], // Sci-Fi - blue
  15: ["#14532D", "#22C55E"], // Sport - green
  16: ["#1C1917", "#B91C1C"], // Thriller - deep red
  17: ["#292524", "#78716C"], // War - stone
  18: ["#1E3A8A", "#3B82F6"], // Biography - blue
  19: ["#581C87", "#C084FC"], // Musical - purple
};

const escXml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Break a title into up to 3 lines that fit a ~200px-wide poster.
function wrapTitle(title, maxCharsPerLine = 14, maxLines = 3) {
  const words = title.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length === maxLines - 1) {
      // last line gets whatever remains, truncated if needed
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

function posterSVG(item) {
  const [c1, c2] = PALETTES[item.genre_ids[0]] || ["#1E1B4B", "#6366F1"];
  const lines = wrapTitle(item.title, 13, 4);
  const startY = 225 - (lines.length - 1) * 16;
  const genreLabel = genreName(item.genre_ids[0]).toUpperCase();

  const textLines = lines
    .map(
      (line, i) =>
        `<text x="150" y="${startY + i * 32}" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#ffffff" text-anchor="middle">${escXml(
          line
        )}</text>`
    )
    .join("\n    ");

  return `<svg width="300" height="450" viewBox="0 0 300 450" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" fill="url(#g)"/>
  <circle cx="255" cy="45" r="70" fill="#ffffff" opacity="0.06"/>
  <circle cx="40" cy="410" r="90" fill="#000000" opacity="0.12"/>
  <text x="150" y="60" font-family="Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="#ffffff" opacity="0.75" text-anchor="middle">${escXml(
    genreLabel
  )}</text>
  ${textLines}
  <text x="150" y="400" font-family="Arial, sans-serif" font-size="13" fill="#ffffff" opacity="0.7" text-anchor="middle">★ ${item.vote_average.toFixed(
    1
  )}</text>
  <text x="150" y="422" font-family="Arial, sans-serif" font-size="12" fill="#ffffff" opacity="0.55" text-anchor="middle">${escXml(
    (item.release_date || "").slice(0, 4)
  )}</text>
</svg>`;
}

function backdropSVG(item) {
  const [c1, c2] = PALETTES[item.genre_ids[0]] || ["#1E1B4B", "#6366F1"];
  const genreLabel = item.genre_ids
    .map((id) => genreName(id))
    .filter(Boolean)
    .join("  ·  ");

  return `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#0A0B14" stop-opacity="0.95"/>
      <stop offset="60%" stop-color="#0A0B14" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0A0B14" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#g)"/>
  <circle cx="1120" cy="120" r="220" fill="#ffffff" opacity="0.05"/>
  <circle cx="120" cy="650" r="260" fill="#000000" opacity="0.15"/>
  <rect width="1280" height="720" fill="url(#fade)"/>
  <text x="64" y="600" font-family="Arial, sans-serif" font-size="56" font-weight="800" fill="#ffffff">${escXml(
    item.title
  )}</text>
  <text x="66" y="640" font-family="Arial, sans-serif" font-size="20" font-weight="600" letter-spacing="1" fill="#ffffff" opacity="0.8">${escXml(
    genreLabel.toUpperCase()
  )}</text>
</svg>`;
}

let count = 0;
for (const item of titles) {
  if (item.real_media) continue; // real posters/backdrops already in place, never overwrite
  fs.writeFileSync(path.join(postersDir, `${item.id}.svg`), posterSVG(item));
  fs.writeFileSync(path.join(backdropsDir, `${item.id}.svg`), backdropSVG(item));
  count++;
}

console.log(`Generated ${count} posters and ${count} backdrops (skipped ${titles.length - count} real-media titles).`);
