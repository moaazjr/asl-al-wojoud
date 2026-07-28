import { json, getCurrentUser } from "@/lib/api-helpers";

export async function GET() {
  const user = await getCurrentUser();
  return json({ user });
}
