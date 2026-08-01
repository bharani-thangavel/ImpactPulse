import { app, initServer } from "../server.js";

export default async function handler(req: any, res: any) {
  try {
    await initServer();
    if (req.url && !req.url.startsWith("/api")) {
      req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
    }
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Serverless Function Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      details: err?.message || String(err),
    });
  }
}
