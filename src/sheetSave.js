import { google } from "googleapis";
import keys from "../credentials.json" with { type: "json" };
import uploadedVideos from "../logs/upload-history.json" with { type: "json" };
import axios from "axios";
import dotenv from "dotenv"

dotenv.config();

const getViewsFromYouTubeUrl = async (url) => {
  const apiKey = process.env.YT_API_KEY; 
  const videoId = extractVideoId(url);
  
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    const items = response.data.items;

    if (items && items.length > 0) {
      const viewCount = items[0].statistics.viewCount;
      return viewCount;
    }

    throw new Error("Video not found in API response");
  } catch (error) {
    console.error(`Error fetching video data: ${error.message}`);
    if (error.response) {
      console.error(`API Error status: ${error.response.status}`);
      console.error(`API Error data:`, error.response.data);
    }
    throw error;
  }
};

const extractVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    } else if (urlObj.hostname === "youtube.com" || urlObj.hostname === "www.youtube.com") {
      return urlObj.searchParams.get("v");
    }
  } catch {
    return null;
  }
};


const extractUploadedVideosHistory = async () => {
    const formattedData = [];
    
    for (const { title, timestamp, youtubeUrl } of uploadedVideos) {
      try {
        const formattedDate = new Date(timestamp).toLocaleString();
        const views = await getViewsFromYouTubeUrl(youtubeUrl);
        formattedData.push([title, formattedDate, views, youtubeUrl]);
        console.log(`✅ Successfully processed: ${title}`);
      } catch (error) {
        console.log(`❌ Failed to process ${title}: ${error.message}`);
        const formattedDate = new Date(timestamp).toLocaleString();
        formattedData.push([title, formattedDate, "N/A", youtubeUrl]);
      }
    }
  
    return formattedData;
  };
  

async function addToSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: keys,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = "1BIvTK9ITHMIAH-vqdKcteI9YKR_CSl4d9kULA0tOs-4";
  const range = "Sheet1!A1";

  const values = await extractUploadedVideosHistory();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    resource: {
      values,
    },
  });

  console.log("Data appended!", values);
}

addToSheet();

