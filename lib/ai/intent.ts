export type AIIntent =
  | "chat"
  | "generate_image"
  | "edit_image"
  | "enhance_image";

export function detectAIIntent(text: string): AIIntent {
  const value = text.toLowerCase();

  const generateWords = [
    "buat gambar",
    "buatkan gambar",
    "generate gambar",
    "gambar",
    "create image",
    "generate image",
    "buat ilustrasi",
    "buat poster",
    "buat desain",
  ];

  const editWords = [
    "ubah gambar",
    "edit gambar",
    "ganti background",
    "hapus background",
    "hapus objek",
    "ganti objek",
    "ubah warna",
  ];

  const enhanceWords = [
    "tingkatkan kualitas",
    "perbaiki kualitas",
    "jernihkan gambar",
    "pertajam gambar",
    "upscale",
    "enhance",
    "perjelas gambar",
  ];

  if (enhanceWords.some((x) => value.includes(x))) {
    return "enhance_image";
  }

  if (editWords.some((x) => value.includes(x))) {
    return "edit_image";
  }

  if (generateWords.some((x) => value.includes(x))) {
    return "generate_image";
  }

  return "chat";
}