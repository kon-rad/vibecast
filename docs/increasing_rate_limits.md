# How to Increase Gemini API Rate Limits

The `429 Resource Exhausted` error means you have hit the default quota for the Gemini API. To increase these limits, you generally need to move from the Free tier to the Pay-as-you-go tier (Blaze plan) in Google Cloud.

## Steps to Increase Quota

1.  **Google Cloud Console**
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Select the project associated with your `API_KEY`.

2.  **Enable Billing**
    *   Navigate to **Billing** in the main menu.
    *   Link a billing account (credit card) to your project.
    *   Switching to "Pay-as-you-go" usually unlocks significantly higher Rate Limits (RPM/TPM) compared to the free tier.

3.  **Check Quotas via IAM & Admin**
    *   Go to **IAM & Admin** > **Quotas & System Limits**.
    *   Filter by **Service**: `Generative Language API`.
    *   Look for metrics like "Generate content requests per minute per project".
    *   If you see an "Edit Quotas" button, you can request an increase.

4.  **Vertex AI (Alternative)**
    *   If you are using Google AI Studio (API Key), you are using the consumer endpoint.
    *   For enterprise-scale quotas, consider migrating to **Vertex AI** on Google Cloud.
    *   Vertex AI generally offers higher, production-ready quotas but requires a different SDK setup (`@google-cloud/vertexai`).

## Gemini 3 Pro Preview specifics
*   **Preview Models**: Often have stricter, fixed limits that cannot be increased initially until the model enters General Availability (GA).
*   **Rate Limits**: Check the [Official Gemini Models Documentation](https://ai.google.dev/gemini-api/docs/models/gemini) for the latest specific limits on Preview models.
