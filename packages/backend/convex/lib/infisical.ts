import { InfisicalSDK } from "@infisical/sdk";

const clientId = "ad3b41c5-00f7-4336-9cd3-8f79dfe76126";
const clientSecret = "8ac0b58ed04e5b9aa14b9bd65260e6c02d2a0ff2314514da2b05ef7e8589ea21";

if (!clientId || !clientSecret) {
    console.log(clientId)
  throw new Error("Nahi hai");
}

const client = new InfisicalSDK();

/**
 * A reusable, authenticated Infisical client.
 * It uses an async IIFE (Immediately Invoked Function Expression) 
 * to authenticate on startup.
 */
let authenticatedClient: InfisicalSDK;

export const getInfisicalClient = async (): Promise<InfisicalSDK> => {
  if (!authenticatedClient) {
    try {
      // Authenticate using Universal Auth (Client ID/Secret)
      await client.auth().universalAuth.login({
        clientId: clientId,
        clientSecret: clientSecret
      });
      authenticatedClient = client;
    } catch (error) {
      console.error("Failed to authenticate with Infisical:", error);
      throw error;
    }
  }
  return authenticatedClient;
};