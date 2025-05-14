const express = require('express');
const multer = require('multer');
const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = require("@azure/storage-blob");
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const mygenerateSAS = require('./generateSAS');

const PORT = process.env.PORT || 3000;

// Azure Blob Setup
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.CONTAINER_NAME;

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const blobName = req.file.originalname;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

   const sasUrl = mygenerateSAS(blobName);

   // res.send(`✅ File uploaded to Azure Blob Storage: ${blobName}`);

    //res.send(`URL to download the blob : ${sasUrl}`);
    //res.json({sasUrl});

    res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>File Uploaded</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #f9f9f9;
        padding: 40px;
        color: #333;
      }
      .container {
        background: #fff;
        border-radius: 8px;
        padding: 20px 30px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        max-width: 600px;
        margin: auto;
        text-align: center;
      }
      a {
        color: #0066cc;
        text-decoration: none;
        font-weight: bold;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>✅ File Uploaded Successfully</h1>
      <p>Here is the link to download the file:</p>
      <p><a href="${sasUrl}" target="_blank">Blob Download URL</a></p>
      <p><em>Note: This link will be valid for the next 1 hour.</em></p>
    </div>
  </body>
  </html>
`);


  } catch (error) {
    console.error(error);
    res.status(500).send('❌ Failed to upload file.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
