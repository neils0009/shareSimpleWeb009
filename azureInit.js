require('dotenv').config();
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");



async function mygetSecret(secretName) 
{
    const keyVaultName = process.env.KEY_VAULT_NAME;

    if (!keyVaultName) 
    {
        throw new Error("Environment variable 'KEY_VAULT_NAME' is not set.");
    }

    console.log(`Key Vault name is ${keyVaultName}`);


    const vaultUrl = `https://${keyVaultName}.vault.azure.net`;

    const credential = new DefaultAzureCredential();
    const secretClient = new SecretClient(vaultUrl, credential);

    try 
    {
        console.log(`Fetching storage connection string from Key Vault...Neil for ${secretName}`);
        const secret = await secretClient.getSecret(secretName);
        console.log(`returning the key....neil ${secret.value}`);
        return secret.value;
    } catch (err) 
    {
        console.log(`Error retrieving secret '${secretName}':`, err.message);
        return null;
    }

}

// Export the modules
module.exports = mygetSecret;
