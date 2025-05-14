const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = require("@azure/storage-blob");

function mygenerateSAS (blobName)
{
    // Azure Storage account credentials
    const accountName = process.env.ACCOUNT_NAME;
    const accountKey = process.env.AZURE_ACCOUNT_KEY;
    const containerName = process.env.CONTAINER_NAME;


    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    // SAS options
    const sasOptions = {
    containerName,
    blobName,
    permissions: BlobSASPermissions.parse("r"), // read-only
    startsOn: new Date(new Date().valueOf() - 5 * 60 * 1000), // 5 min back
    expiresOn: new Date(new Date().valueOf() + 60 * 60 * 1000) // 60 minutes from now
    };

    // Generate SAS token
    const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

    // SAS URL
    const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;

    console.log("SAS URL:", sasUrl);

    return(sasUrl);
    
}

// export the modules
module.exports = mygenerateSAS;
