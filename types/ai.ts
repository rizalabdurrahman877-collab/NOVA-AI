export type AIMode =
  | "general"
  | "coding"
  | "reasoning"
  | "writing"
  | "multimodal";
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
