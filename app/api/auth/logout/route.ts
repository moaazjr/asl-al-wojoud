import { destroySession } from "@/lib/server-auth";
import { json } from "@/lib/api-helpers";

export async function POST() {
  await destroySession();
  return json({ ok: true });
}
