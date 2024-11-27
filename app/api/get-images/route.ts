import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const imagesDirectory = path.join(process.cwd(), "public/captured_images");

  try {
    const files = fs.readdirSync(imagesDirectory);

    // Filter for only image files
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );

    // Generate URLs for each image in `public/captured_images`
    const imagePaths = imageFiles
      .sort((a, b) => b.localeCompare(a)) // Sort in descending order by name
      .map((file) => `/captured_images/${file}`);

    return NextResponse.json(imagePaths);
  } catch (error) {
    console.error("Error reading images:", error);
    return NextResponse.json(
      { error: "Failed to load images" },
      { status: 500 }
    );
  }
}
