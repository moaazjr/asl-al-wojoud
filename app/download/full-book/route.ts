import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_SOURCE_URL =
  "https://zenodo.org/records/21855464/files/%D8%A3%D8%B5%D9%84%20%D8%A7%D9%84%D9%88%D8%AC%D9%88%D8%AF%20.pdf?download=1";

const SOURCE_URL = process.env.FULL_BOOK_PDF_URL?.trim() || DEFAULT_SOURCE_URL;

export async function GET() {
  return NextResponse.redirect(SOURCE_URL, 307);
}
