import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hash = searchParams.get("hash");
  const VT_API_KEY = process.env.VIRUSTOTAL_API_KEY || "";

  if (!hash) {
    return NextResponse.json({ error: "No hash provided" }, { status: 400 });
  }

  // DEMO MODE: Intercept known mock hashes so the demo works without a real API key
  if (hash === "e517ab2ff2f2a5510519faaa50aa4984f4abc5dea29797fe585c49505ff72c69") {
    return NextResponse.json({
      found: true,
      stats: { malicious: 42, suspicious: 5, undetected: 10, harmless: 0 },
      permalink: `https://www.virustotal.com/gui/file/${hash}`
    });
  }
  
  if (hash === "a1b2c3d4e5f6a7b8c9d0e1f2") {
    return NextResponse.json({
      found: true,
      stats: { malicious: 0, suspicious: 0, undetected: 20, harmless: 55 },
      permalink: `https://www.virustotal.com/gui/file/${hash}`
    });
  }

  try {
    // Basic sanity-check: a real VT API key is 64 hex chars and NOT a file hash
    // The common mistake is pasting a SHA-256 hash as the API key.
    if (!VT_API_KEY || VT_API_KEY.length < 32) {
      return NextResponse.json({ found: false, vtError: "VIRUSTOTAL_API_KEY not configured in .env.local" });
    }

    const res = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
      headers: { "x-apikey": VT_API_KEY },
      // 8 second timeout
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404) {
      // Not yet in VT database — caller should upload
      return NextResponse.json({ found: false });
    }

    if (res.status === 401 || res.status === 403) {
      // Wrong or revoked API key — return 200 so the client doesn't crash
      return NextResponse.json({
        found: false,
        vtError: `VirusTotal auth failed (HTTP ${res.status}). Check VIRUSTOTAL_API_KEY in .env.local`,
      });
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return NextResponse.json({
        found: false,
        vtError: `VirusTotal API error ${res.status}: ${body.slice(0, 120)}`,
      });
    }

    const data = await res.json();
    const stats = data?.data?.attributes?.last_analysis_stats;
    if (!stats) {
      return NextResponse.json({ found: false, vtError: "Unexpected VT response shape" });
    }

    const permalink = `https://www.virustotal.com/gui/file/${hash}`;
    return NextResponse.json({
      found: true,
      stats: {
        malicious:  stats.malicious  ?? 0,
        suspicious: stats.suspicious ?? 0,
        undetected: stats.undetected ?? 0,
        harmless:   stats.harmless   ?? 0,
      },
      permalink,
    });
  } catch (error: any) {
    // Network error or AbortSignal timeout — never crash the client
    return NextResponse.json({ found: false, vtError: error.message ?? "VT fetch timed out" });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;
    const VT_API_KEY = process.env.VIRUSTOTAL_API_KEY || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Proxy the file upload to VirusTotal API
    const vtFormData = new FormData();
    vtFormData.append("file", file);

    if (!VT_API_KEY || VT_API_KEY.length < 32) {
      return NextResponse.json({ success: false, error: "VIRUSTOTAL_API_KEY not configured" });
    }

    const res = await fetch("https://www.virustotal.com/api/v3/files", {
      method: "POST",
      headers: { "x-apikey": VT_API_KEY },
      body: vtFormData,
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return NextResponse.json({ success: false, error: `VT upload HTTP ${res.status}: ${body.slice(0, 120)}` });
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      id: data.data.id,
      message: "File successfully queued for analysis at VirusTotal",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
