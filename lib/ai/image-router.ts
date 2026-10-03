import { generateImage } from "./image";

export async function generateAIImage(
  action: "generate" | "edit" | "enhance",
  prompt: string,
  image?: string
) {
  if (action === "generate") {
    return generateImage(prompt);
  }

  if (!image) {
    throw new Error("Gambar diperlukan untuk fitur ini.");
  }

  return generateImage(
    `${action === "enhance"
      ? "Enhance and improve this image while preserving the original content."
      : "Edit this image according to the user's request."
    }

    User request:
    ${prompt}
  `);
}