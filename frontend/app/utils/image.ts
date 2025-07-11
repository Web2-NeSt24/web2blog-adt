import { makeAuthenticatedRequest } from "./auth";

// Helper functions
const fileToBase64 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const base64url: string = await new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(new Blob([buffer]));
  });
  return base64url.slice(base64url.indexOf(',') + 1);
};

export async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const base64Data = await fileToBase64(file);
    const fileType = file.type.split("/")[1].toUpperCase();

    const response = await makeAuthenticatedRequest("/api/image/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: fileType, data: base64Data }),
    });

    if (response.ok) {
      const result = await response.json();
      return result.id;
    }
  } catch (err) {
    console.log("Failed to upload image. Please try again.");
    return null
  }
};
