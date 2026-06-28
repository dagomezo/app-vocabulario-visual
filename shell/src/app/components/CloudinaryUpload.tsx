import { useState, useRef } from "react";
import { getUploadSignature } from "../lib/api";
import { Button } from "./ui/button";

interface Props {
  tipo: "image" | "sign";
  onUpload: (url: string) => void;
  currentUrl?: string;
}

const CONFIG = {
  image: {
    label: "imagen",
    accept: "image/jpeg,image/png,image/webp",
    folder: "senasapp/image",
    maxMb: 10,
  },
  sign: {
    label: "seña (video o GIF)",
    accept: "video/mp4,video/webm,image/gif",
    folder: "senasapp/sign",
    maxMb: 30,
  },
};

export default function CloudinaryUpload({ tipo, onUpload, currentUrl }: Props) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(currentUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const config = CONFIG[tipo];

  const handleClick = async () => {
    const archivo = inputRef.current?.files?.[0];
    if (!archivo) return setError("Selecciona un archivo primero");

    const maxBytes = config.maxMb * 1024 * 1024;
    if (archivo.size > maxBytes) {
      return setError(`El archivo no debe superar ${config.maxMb} MB`);
    }

    setSubiendo(true);
    setError("");

    try {
      const sig = await getUploadSignature(config.folder);
      const formData = new FormData();
      formData.append("api_key", sig.api_key);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);
      formData.append("quality", "auto:good");
      formData.append("bitrate", "500k");
      formData.append("file", archivo);

      const xhr = new XMLHttpRequest();
      const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/auto/upload`;

      const url = await new Promise<string>((resolve, reject) => {
        xhr.open("POST", uploadUrl, true);
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status === 200) resolve(data.secure_url || data.url);
            else reject(new Error(data.error?.message || "Error al subir archivo"));
          } catch {
            reject(new Error("Error al procesar respuesta"));
          }
        };
        xhr.onerror = () => reject(new Error("Error de conexión"));
        xhr.send(formData);
      });

      setPreview(url);
      onUpload(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className="border-2 border-[var(--beige-border)] rounded-[16px]"
        >
          {subiendo ? "⏳ Subiendo..." : `📁 Seleccionar ${config.label}`}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={config.accept}
          className="hidden"
          onChange={handleClick}
          disabled={subiendo}
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      {preview && (
        <div className="mt-3">
          {tipo === "image" ? (
            <img
              src={preview}
              alt="preview"
              className="w-24 h-24 object-cover rounded-[12px] border-2 border-[var(--beige-border)]"
            />
          ) : preview.match(/\.gif$/i) ? (
            <img
              src={preview}
              alt="Vista previa GIF"
              className="w-32 rounded-[12px] border-2 border-[var(--beige-border)]"
            />
          ) : (
            <video
              src={preview}
              controls
              className="w-48 rounded-[12px] border-2 border-[var(--beige-border)]"
              style={{ maxHeight: "200px" }}
            />
          )}
        </div>
      )}
    </div>
  );
}
