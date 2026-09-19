export async function askUma(_input: {
  data: { query: string; panchangContext: string; kundaliContext: string };
}): Promise<{ ok: false; error: string } | { ok: true; text: string }> {
  return { ok: false, error: "offline" };
}
