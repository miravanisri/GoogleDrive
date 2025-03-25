const { google } = require("googleapis");
const fs = require("fs");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);

async function uploadToDrive(authToken, title, content) {
  oauth2Client.setCredentials({ access_token: authToken });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const fileMetadata = { name: `${title}.doc`, mimeType: "application/vnd.google-apps.document" };

  const media = { mimeType: "text/plain", body: content };

  const file = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: "id",
  });

  return file.data.id;
}

module.exports = { uploadToDrive };
