import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import JSZip from "jszip";
import ImageKit from "imagekit";

import config from "@/lib/config";

export const runtime = "nodejs";

const {
  env: {
    imagekit: { publicKey, privateKey, urlEndpoint },
  },
} = config;

const imagekit = new ImageKit({
  publicKey,
  privateKey,
  urlEndpoint,
});

const s3Client = new S3Client({
  endpoint: process.env.BACKBLAZE_ENDPOINT!,
  region: process.env.BACKBLAZE_REGION!,
  credentials: {
    accessKeyId: process.env.BACKBLAZE_KEY_ID!,
    secretAccessKey: process.env.BACKBLAZE_APPLICATION_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const id = formData.get("id")?.toString();
    const manifestText = formData.get("manifest")?.toString();

    const cover = formData.get("cover");
    const pdf = formData.get("pdf");

    if (!id) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 },
      );
    }

    if (!manifestText) {
      return NextResponse.json(
        { error: "Manifest is required" },
        { status: 400 },
      );
    }

    if (!(cover instanceof File)) {
      return NextResponse.json(
        { error: "Cover image is required" },
        { status: 400 },
      );
    }

    if (!(pdf instanceof File)) {
      return NextResponse.json(
        { error: "PDF file is required" },
        { status: 400 },
      );
    }

    let manifest: Record<string, unknown>;

    try {
      manifest = JSON.parse(manifestText);
    } catch {
      return NextResponse.json(
        { error: "Invalid manifest JSON" },
        { status: 400 },
      );
    }

    manifest.id = id;
    manifest.files = {
      cover: "cover.jpg",
      pdf: "book.pdf",
    };

    const coverBuffer = Buffer.from(await cover.arrayBuffer());

    const pdfBuffer = Buffer.from(await pdf.arrayBuffer());

    /*
     * 1. Upload cover to ImageKit
     */
    const imageResult = await imagekit.upload({
      file: coverBuffer,
      fileName: `${id}.jpg`,
      folder: "/books/covers",
      useUniqueFileName: false,
    });

    if (!imageResult.url) {
      throw new Error("ImageKit upload succeeded but no URL was returned");
    }

    const coverUrl = imageResult.url;

    console.log("[BOOK PACKAGE] ImageKit:", coverUrl);

    /*
     * 2. Create ZIP
     */
    const zip = new JSZip();

    zip.file("manifest.json", JSON.stringify(manifest, null, 2));

    zip.file("cover.jpg", coverBuffer);
    zip.file("book.pdf", pdfBuffer);

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });

    /*
     * 3. Upload ZIP to Backblaze
     */
    const fileKey = `${id}.zip`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
        Key: fileKey,
        Body: zipBuffer,
        ContentType: "application/zip",
        ContentLength: zipBuffer.length,
      }),
    );

    const packageUrl =
      `${process.env.BACKBLAZE_ENDPOINT}/` +
      `${process.env.BACKBLAZE_BUCKET_NAME}/` +
      fileKey;

    console.log("[BOOK PACKAGE] Backblaze:", packageUrl);

    return NextResponse.json({
      success: true,
      id,
      coverUrl,
      packageUrl,
      fileKey,
    });
  } catch (error) {
    console.error("[BOOK PACKAGE] Failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create book package",
      },
      { status: 500 },
    );
  }
}
