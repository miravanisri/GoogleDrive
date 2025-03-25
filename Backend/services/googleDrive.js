const { google } = require("googleapis");
const stream = require("stream");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);
async function verifyToken(authToken) {
  if (!authToken) {
    console.error("❌ Error: Missing access token.");
    throw new Error("Missing access token");
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: authToken });

  try {
    const userInfo = await google.oauth2("v2").userinfo.get({ auth: oauth2Client });
    console.log("✅ Token is valid for user:", userInfo.data.email);
    return true; // Token is valid
  } catch (error) {
    console.error("❌ Invalid Token:", error.message);
    return false; // Token is invalid or expired
  }
}

async function uploadToDrive(authToken, title, content) {
  if (!authToken) {
    console.error("❌ Error: Missing access token.");
    throw new Error("Missing access token");
  }

  console.log("✅ Using Auth Token:", authToken); // Log the token
// verifyToken(authToken);
  oauth2Client.setCredentials({ access_token: authToken });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    const fileMetadata = { name: `${title}.doc`, mimeType: "application/vnd.google-apps.document" };
    const media = { mimeType: "text/plain", body: content };

    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id",
    });

    console.log("✅ File uploaded successfully, ID:", file.data.id);
    return file.data.id;
  } catch (error) {
    console.error("❌ Error uploading file to Google Drive:", error);
    throw error;
  }
}


module.exports = { uploadToDrive };
