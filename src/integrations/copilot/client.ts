// src/integrations/copilot/client.ts
export class CopilotClient {
  async generate(prompt: string): Promise<string> {
    // Replace this with your actual API call to OpenAI, Azure OpenAI, or your backend
    const response = await fetch("/api/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    return data.output; // expected to be a JSON string
  }
}
