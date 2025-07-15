import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "../output/thumbnails");
const BACKGROUNDS_DIR = path.join(__dirname, "../thumbnailsBackgrounds");

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function compressBackgroundImages(targetSizeKB = 500) {
  const files = fs
    .readdirSync(BACKGROUNDS_DIR)
    .filter((f) => f.endsWith(".png"));
  for (const file of files) {
    const filePath = path.join(BACKGROUNDS_DIR, file);
    const stats = fs.statSync(filePath);
    if (stats.size / 1024 > targetSizeKB) {
      // Compress image
      const compressedPath = filePath.replace(".png", "-compressed.png");
      await sharp(filePath)
        .resize(1280, 720, { fit: "inside", withoutEnlargement: true })
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(compressedPath);
      const compressedStats = fs.statSync(compressedPath);
      if (compressedStats.size < stats.size) {
        fs.renameSync(compressedPath, filePath);
        console.log(
          `Compressed ${file} to ${(compressedStats.size / 1024).toFixed(1)}KB`
        );
      } else {
        fs.unlinkSync(compressedPath);
      }
    }
  }
}

if (process.env.NODE_ENV !== "production") {
  compressBackgroundImages().catch(console.error);
}

export async function generateThumbnail(title, outputDir = OUTPUT_DIR) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputPath = path.join(outputDir, `thumbnail-${timestamp}.png`);

    // Get all background images
    const backgroundFiles = fs
      .readdirSync(BACKGROUNDS_DIR)
      .filter((file) => file.startsWith("background") && file.endsWith(".png"));

    if (backgroundFiles.length === 0) {
      throw new Error(
        "No background images found in thumbnailsBackgrounds directory"
      );
    }

    // Randomly select a background
    const randomBackground =
      backgroundFiles[Math.floor(Math.random() * backgroundFiles.length)];
    const backgroundPath = path.join(BACKGROUNDS_DIR, randomBackground);

    // Create the image with the selected background and blur it
    let image = sharp(backgroundPath)
      .resize(1280, 720, { fit: "cover" }) // always 1280x720, cropping if needed
      .blur(10);

    // Prepare SVG text with gradient fill, strong black border, and shadow
    // Split title into lines if too long (max 20 chars per line for example)
    const maxCharsPerLine = 20;
    const words = title.split(" ");
    let lines = [];
    let currentLine = "";
    for (const word of words) {
      if ((currentLine + " " + word).trim().length > maxCharsPerLine) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine += " " + word;
      }
    }
    if (currentLine) lines.push(currentLine.trim());

    // Calculate vertical position for centering
    const lineHeight = 140;
    const totalTextHeight = lines.length * lineHeight;
    const startY = 360 - totalTextHeight / 2 + lineHeight / 2;

    const textSvg = `
            <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="titleGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#f7f4af"/>
                        <stop offset="100%" stop-color="#df8000"/>
                    </linearGradient>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="black" flood-opacity="1"/>
                    </filter>
                </defs>
                <g filter="url(#shadow)">
                    ${lines
                      .map(
                        (line, i) => `
                        <text x="50%" y="${
                          startY + i * lineHeight
                        }" font-family="Noto Sans Arabic, Arial, sans-serif" font-size="180" font-weight="900" fill="url(#titleGradient)" stroke="#000" stroke-width="10" paint-order="stroke" text-anchor="middle" dominant-baseline="middle">${line}</text>
                    `
                      )
                      .join("")}
                </g>
            </svg>
        `;

    const textOverlay = await sharp(Buffer.from(textSvg)).png().toBuffer();

    // Apply composites in sequence
    await image
      .composite([
        {
          input: textOverlay,
          top: 0,
          left: 0,
          blend: "over",
        },
      ])
      .png()
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    throw error;
  }
}

// Test function to generate thumbnails for sample titles
export async function testGenerateThumbnails() {
  const TEST_OUTPUT_DIR = path.join(__dirname, "../output/test_thumbnails");
  if (!fs.existsSync(TEST_OUTPUT_DIR)) {
    fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
  }
  const sampleTitles = [
    "Learn JavaScript Fast",
    "أفضل طرق تعلم البرمجة",
    "10 Tips for YouTube Growth",
    "كيف تصبح مبرمج محترف",
    "Ultimate Guide to AI Tools",
    "دليلك الشامل للذكاء الاصطناعي",
  ];

  for (const title of sampleTitles) {
    try {
      const result = await generateThumbnail(title, TEST_OUTPUT_DIR);
      console.log("Generated test thumbnail:", result);
    } catch (err) {
      console.error("Test thumbnail failed for title:", title, err);
    }
  }
}
