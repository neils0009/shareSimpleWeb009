require('dotenv').config();
const {
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential
} = require("@azure/storage-blob");

const mygetSecret = require('./azureInit');

async function mygenerateSAS(blobName) {
  const accountKeySecret = "AZUREACCOUNTKEY";

  console.log("🔐 Fetching account key from Key Vault...");
  const accountKey = await mygetSecret(accountKeySecret); // ✅ Await here directly

  if (!accountKey) {
    throw new Error("❌ Failed to retrieve account key from Key Vault.");
  }

  const accountName = process.env.ACCOUNT_NAME;
  const containerName = process.env.CONTAINER_NAME;

  if (!accountName || !containerName) {
    throw new Error("❌ ACCOUNT_NAME or CONTAINER_NAME environment variable not set.");
  }

  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

  const sasOptions = {
    containerName,
    blobName,
    permissions: BlobSASPermissions.parse("r"),
    startsOn: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    expiresOn: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
  };

  const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

  const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;

  console.log("✅ SAS URL:", sasUrl);

  return sasUrl;
}

module.exports = mygenerateSAS;
