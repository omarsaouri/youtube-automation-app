import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "../output/subtitles");

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper function to format time in SRT format (HH:MM:SS,mmm)
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")},${milliseconds
    .toString()
    .padStart(3, "0")}`;
}

// Helper function to split text into subtitle chunks
function splitTextIntoSubtitles(
  text,
  maxCharsPerLine = 50,
  maxLinesPerSubtitle = 2
) {
  const sentences = text
    .split(/[.!?؟]/)
    .filter((sentence) => sentence.trim().length > 0);
  const subtitles = [];
  let currentSubtitle = "";
  let currentLineCount = 0;

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    // If adding this sentence would exceed the line limit, start a new subtitle
    if (
      currentSubtitle &&
      (currentLineCount >= maxLinesPerSubtitle ||
        (currentSubtitle + " " + trimmedSentence).length >
          maxCharsPerLine * maxLinesPerSubtitle)
    ) {
      subtitles.push(currentSubtitle.trim());
      currentSubtitle = trimmedSentence;
      currentLineCount = 1;
    } else {
      if (currentSubtitle) {
        currentSubtitle += " " + trimmedSentence;
      } else {
        currentSubtitle = trimmedSentence;
      }
      currentLineCount = Math.ceil(currentSubtitle.length / maxCharsPerLine);
    }
  }

  // Add the last subtitle if it exists
  if (currentSubtitle.trim()) {
    subtitles.push(currentSubtitle.trim());
  }

  return subtitles;
}

export async function generateSubtitles(storyPath, audioDuration) {
  try {
    // Read the story content
    const storyContent = fs.readFileSync(storyPath, "utf8");

    // Extract the story content from the file
    const storyMatch = storyContent.match(/القصة:\s*([\s\S]+)/);
    if (!storyMatch) {
      throw new Error("Could not extract story content from the file");
    }

    const storyText = storyMatch[1].trim();

    // Split text into subtitle chunks
    const subtitleChunks = splitTextIntoSubtitles(storyText);

    // Calculate total characters in all chunks
    const totalChars = subtitleChunks.reduce(
      (sum, chunk) => sum + chunk.length,
      0
    );

    // Generate SRT content with proportional timing
    let srtContent = "";
    let currentTime = 0;
    subtitleChunks.forEach((chunk, index) => {
      const chunkDuration = (chunk.length / totalChars) * audioDuration;
      const startTime = currentTime;
      const endTime = currentTime + chunkDuration;

      srtContent += `${index + 1}\n`;
      srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
      srtContent += `${chunk}\n\n`;

      currentTime = endTime;
    });

    // Save SRT file
    const timestamp = path
      .basename(storyPath)
      .replace("story-", "")
      .replace(".txt", "");
    const outputPath = path.join(OUTPUT_DIR, `subtitles-${timestamp}.srt`);
    fs.writeFileSync(outputPath, srtContent, "utf8");

    console.log(`Subtitles generated successfully: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("Error generating subtitles:", error);
    throw error;
  }
}

// For testing purposes
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const storyPath = path.join(
    __dirname,
    "../output/stories",
    process.argv[2] || "story-2025-04-28T19-06-13-415Z.txt"
  );
  const audioDuration = 420; // 7 minutes in seconds
  generateSubtitles(storyPath, audioDuration).catch(console.error);
}
