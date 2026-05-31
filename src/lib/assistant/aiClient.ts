export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

const GROQ_MODEL = "llama-3.3-70b-versatile";
const XAI_MODEL = "grok-2-1212";

function resolveApiKey(): string | undefined {
  return (
    import.meta.env.VITE_GROQ_API_KEY ||
    import.meta.env.VITE_GROK_API_KEY ||
    undefined
  );
}

function isGroqKey(key: string): boolean {
  return key.startsWith("gsk_");
}

function chatCompletionsUrl(key: string): string {
  if (import.meta.env.DEV) {
    return isGroqKey(key)
      ? "/api/groq/openai/v1/chat/completions"
      : "/api/xai/v1/chat/completions";
  }
  return isGroqKey(key)
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://api.x.ai/v1/chat/completions";
}

function authHeaders(key: string): HeadersInit {
  if (import.meta.env.DEV) {
    return { "Content-Type": "application/json" };
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };
}

function modelForKey(key: string): string {
  return isGroqKey(key) ? GROQ_MODEL : XAI_MODEL;
}

export async function sendAssistantChat(messages: ChatMessage[]): Promise<string> {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    throw new Error(
      "Assistant API key missing. Add VITE_GROQ_API_KEY (or VITE_GROK_API_KEY) to your .env file.",
    );
  }

  const response = await fetch(chatCompletionsUrl(apiKey), {
    method: "POST",
    headers: authHeaders(apiKey),
    body: JSON.stringify({
      model: modelForKey(apiKey),
      messages,
      temperature: 0.4,
      max_tokens: 600,
    }),
  });

  const data = (await response.json()) as ChatCompletionResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Assistant request failed (${response.status})`);
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Assistant returned an empty response.");
  }

  return content;
}
