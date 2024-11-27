import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

export async function POST() {
  const pythonPath = path.resolve("C://Python312//python");  // Correct Python executable path
  const scriptPath = path.resolve("C://smart safety//20241113//mask_detect_capture//detect_capture.py");  // Correct script path

  return new Promise((resolve) => {
    // Surround the paths with quotes to handle spaces in the file path
    exec(`"${pythonPath}" "${scriptPath}"`, (error, stdout, stderr) => {
      console.log(`Script output: ${stdout}`);
      resolve(
        NextResponse.json(
          { message: "Script ran successfully", output: stdout },
          { status: 200 }
        )
      );
    });
  });
}
