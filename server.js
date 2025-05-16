require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential
} = require("@azure/storage-blob");

const mygenerateSAS = require('./generateSAS');
const mygetSecret = require('./azureInit');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 3000;
const storageConnectionSecretName = "AZURESTORAGECONNECTIONSTRING";
const containerName = process.env.CONTAINER_NAME;

let containerClient; // Will be initialized after we get the secret

// Async initialization
(async () => {
  try {
    console.log("🔐 Calling the secret function...");
    const connectionString = await mygetSecret(storageConnectionSecretName);

    if (!connectionString) {
      throw new Error("❌ Storage connection string is null or undefined");
    }

    console.log("✅ Got the connection string from Key Vault.");

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    containerClient = blobServiceClient.getContainerClient(containerName);

    // Configure Express
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static('public'));

    // Routes
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

        const sasUrl = await mygenerateSAS(blobName);
        res.render('success', { sasUrl });

      } catch (error) {
        console.error(error);
        res.status(500).send('❌ Failed to upload file.');
      }
    });

    // Start the server **after** initialization
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to initialize app:", err.message);
    process.exit(1);
  }
})();
