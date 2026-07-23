import { api } from "../Config/Api";

export const uploadToCloudinary = async (
  file: File,
  folder: string = "products",
  onProgress?: (percent: number) => void
): Promise<string> => {
  if (!file) {
    throw new Error("No file selected");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post(
    `/api/uploads/image?folder=${folder}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        }
      },
    }
  );

  return response.data.secureUrl;
};
