import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const REGISTRY_PATH = path.join(process.cwd(), "src", "data", "feeds", "feeds-registry.json");

export async function GET() {
  try {
    let feeds = [];
    if (fs.existsSync(REGISTRY_PATH)) {
      const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
      feeds = JSON.parse(raw);
    }
    return NextResponse.json({ success: true, feeds });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
