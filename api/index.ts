import { app, initServer } from "../server";

export default async function handler(req: any, res: any) {
  try {
    await initServer();
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Serverless Function Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      details: err?.message || String(err),
    });
  }
}
