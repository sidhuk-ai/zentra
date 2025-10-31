// src/secret-operations.ts (Corrected Version)

import { getInfisicalClient } from './infisical'; // Adjust path if needed

// --- Configuration ---
const projectId = "ce418dfe-ae22-436b-a442-32e182a6dc57";
const environment = 'dev'; // Change to 'staging', 'prod', etc. as needed
const secretPath = '/';     // Use the root path for all secrets

if (!projectId) {
  throw new Error("INFISICAL_PROJECT_ID is not set in environment variables.");
}

// --- Function to GET a Secret ---

/**
 * Gets a single secret by its name.
 * Tries to parse the secret as JSON. If it fails, returns the raw string.
 * Returns undefined if the secret is not found.
 */
export async function getSecret(secretName: string): Promise<any | undefined> {
  try {
    const client = await getInfisicalClient();

    const secret = await client.secrets().getSecret({
      projectId: projectId,
      environment: environment,
      secretName: secretName // Use the full string as the name
    });

    const secretValue = secret.secretValue;

    try {
      // Try to parse the value as JSON
      return JSON.parse(secretValue);
    } catch (e) {
      // If it's not valid JSON, just return the raw string
      return secretValue;
    }

  } catch (error) {
    // *FIXED*: Reliably check for the 404 error
    if (error instanceof Error && error.message.includes("StatusCode=404")) {
      console.warn(`Secret "${secretName}" at path "${secretPath}" not found.`);
      return undefined;
    } else {
      console.error(`Error fetching secret "${secretName}":`, error);
      throw error;
    }
  }
}

// --- Function to CREATE or UPDATE a Secret ---

/**
 * Creates a secret if it doesn't exist, or updates it if it does.
 * Automatically stringifies objects/arrays/numbers into JSON.
 */
export async function createOrUpdateSecret(secretName: string, secretValue: any): Promise<{ action: 'created' | 'updated' | 'error', secretId?: string }> {
  
  let valueToStore: string;
  if (typeof secretValue === 'string') {
    valueToStore = secretValue;
  } else {
    // If it's an object, array, number, etc., stringify it
    valueToStore = JSON.stringify(secretValue);
  }

  try {
    const client = await getInfisicalClient();

    // Try to get the secret first to see if it exists
    const existingSecret = await client.secrets().getSecret({
      projectId: projectId,
      environment: environment,
      secretName: secretName // Use the full string as the name
    }).catch((error:any) => {
      // *FIXED*: Reliably check for the 404 error
      if (error instanceof Error && error.message.includes("StatusCode=404")) {
        return null; // This is expected, it means we need to create it
      }
      // If it's a different error, re-throw it
      throw error;
    });

    if (existingSecret) {
      // --- Secret exists, UPDATE it ---
      const updatedSecret = await client.secrets().updateSecret(secretName, {
        projectId: projectId,
        environment: environment,
        secretValue: valueToStore
      });
      console.log(`Successfully updated secret: ${secretName}`);
      return { action: 'updated', secretId: updatedSecret.secret.id };
    } else {
      // --- Secret does not exist, CREATE it ---
      const newSecret = await client.secrets().createSecret(secretName, {
        projectId: projectId,
        environment: environment,
        secretValue: valueToStore
      });
      console.log(`Successfully created secret: ${secretName}`);
      return { action: 'created', secretId: newSecret.secret.id };
    }
  } catch (error) {
    console.error(`Error creating or updating secret "${secretName}":`, error);
    return { action: 'error' };
  }
}