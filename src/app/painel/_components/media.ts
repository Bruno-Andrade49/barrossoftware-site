"use client";

import { createUploadUrl } from "../actions";

/**
 * Envia um arquivo direto do navegador para o Supabase com uma URL assinada pelo servidor
 * (o arquivo não passa pela Vercel, que limita o corpo das requisições a 4,5 MB).
 */
export async function uploadFile(file: Blob, onProgress?: (pct: number) => void): Promise<string> {
  const ticket = await createUploadUrl(file.type, file.size);
  if (!ticket.ok) throw new Error(ticket.error);

  const body = new FormData();
  body.append("cacheControl", "31536000");
  body.append("", file);

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", ticket.signedUrl);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`O envio falhou (${xhr.status}). Tente de novo.`)));
    xhr.onerror = () => reject(new Error("Sem conexão com o armazenamento. Tente de novo."));
    xhr.send(body);
  });
  return ticket.publicUrl;
}

const canvasBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Não foi possível gerar a capa."))), type, quality),
  );

/**
 * Lê um vídeo local: proporção (largura / altura) e o quadro de 0,1 s em WebP (capa até o vídeo tocar)
 * e em JPG (imagem de compartilhamento, que todo app lê). Tudo no navegador, sem enviar nada antes.
 */
export async function readVideo(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("Este vídeo não abriu no navegador. Exporte em MP4 (H.264) ou WebM."));
    });
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
      video.currentTime = Math.min(0.1, video.duration / 2 || 0);
    });

    const w = video.videoWidth;
    const h = video.videoHeight;
    const scale = Math.min(1, 1600 / w);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);

    const [poster, jpg] = await Promise.all([canvasBlob(canvas, "image/webp", 0.82), canvasBlob(canvas, "image/jpeg", 0.85)]);
    return { aspect: `${w} / ${h}`, poster, jpg, duration: video.duration };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Largura e altura de uma imagem local (a página do case reserva o espaço certo e não pula). */
export async function readImage(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** "Malu Cookies & Café" → "malu-cookies-cafe" */
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
