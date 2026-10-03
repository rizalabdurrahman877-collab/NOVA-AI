const API_KEY = process.env.AI_API_KEY;
const BASE_URL = (
  process.env.AI_BASE_URL || "https://api.openai.com/v1"
).replace(/\/$/, "");

const IMAGE_MODEL =
  process.env.AI_IMAGE_MODEL || "gpt-image-2.5-sunburst";

if (!API_KEY) {
  throw new Error("AI_API_KEY belum diatur.");
}

export async function generateImage(prompt: string) {
  const response = await fetch(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt,
      size: "1024x1024",
      quality: "high",
      n: 1,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Image generation error ${response.status}: ${text.slice(0, 500)}`
    );
  }

  const data = await response.json();

  return {
    image: data.data?.[0]?.b64_json
      ? `data:image/png;base64,${data.data[0].b64_json}`
      : data.data?.[0]?.url || null,
    model: IMAGE_MODEL,
  };
}