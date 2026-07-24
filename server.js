/**
 * Local Express Development Server Wrapper
 * For running shiro-api Cloudflare Worker locally in AI Studio Preview on port 3000
 */

import express from "express";
import dotenv from "dotenv";
import worker from "./worker.js";

dotenv.config();

const app = express();
const PORT = 3000;

// Raw body parser to preserve request body for Web Request conversion
app.use(express.raw({ type: "*/*", limit: "10mb" }));

app.all("*all", async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host") || "localhost:3000"}${req.originalUrl}`;
    
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach((v) => headers.append(key, v));
      } else if (val) {
        headers.set(key, val);
      }
    });

    const init = {
      method: req.method,
      headers,
    };

    if (["POST", "PUT", "PATCH"].includes(req.method) && req.body && Buffer.isBuffer(req.body) && req.body.length > 0) {
      init.body = req.body;
    }

    const webRequest = new Request(fullUrl, init);

    // Call Cloudflare Worker fetch handler with process.env
    const workerResponse = await worker.fetch(webRequest, process.env, {});

    res.status(workerResponse.status);
    workerResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const arrayBuffer = await workerResponse.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("Local Server Error:", err);
    res.status(500).json({
      success: false,
      message: err?.message || "Internal Development Server Error",
      code: "DEV_SERVER_ERROR",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[shiro-api] Cloudflare Worker dev server listening on http://0.0.0.0:${PORT}`);
});
