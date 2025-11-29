import { NextRequest, NextResponse } from "next/server";

// Debug endpoint to check OAuth flow state
export async function GET(req: NextRequest) {
  const cookies = req.cookies;
  const searchParams = req.nextUrl.searchParams;
  const provider = searchParams.get("provider") || "google";
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    provider,
    cookies: {
      codeVerifier: cookies.get(`pkce_verifier_${provider}`)?.value ? "present" : "missing",
      state: cookies.get(`oauth_state_${provider}`)?.value ? "present" : "missing",
      callbackUrl: cookies.get(`mobile_callback_${provider}`)?.value || "not set",
    },
    request: {
      url: req.url,
      pathname: req.nextUrl.pathname,
      searchParams: Object.fromEntries(searchParams.entries()),
      headers: {
        host: req.headers.get("host"),
        "x-forwarded-host": req.headers.get("x-forwarded-host"),
        "x-forwarded-proto": req.headers.get("x-forwarded-proto"),
        "user-agent": req.headers.get("user-agent"),
      },
    },
  };
  
  return NextResponse.json(debugInfo, { status: 200 });
}

