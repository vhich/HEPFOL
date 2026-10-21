import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import dotenv from "dotenv";
import Fastify from "fastify";
import { webhookRoutes } from "./routes/email_webhook";
import { uploadRoutes } from "./routes/upload";
import { youtubeRoutes } from "./routes/youtube";

dotenv.config();

const server = Fastify({
  logger: true,
});

// Register plugins
await server.register(cors, {
  origin: true,
});

await server.register(multipart, {
  limits: {
    fileSize: 30 * 1024 * 1024,
  },
});
export const MAX_DURATION: number = 600;

// Health check route
server.get("/health", async (request, reply) => {
  return { status: "ok", service: "hepfol-backend" };
});

server.server.timeout = 600000; // 10 minutes (in milliseconds)
server.server.keepAliveTimeout = 65000; // 65 seconds
server.server.headersTimeout = 66000; // 66 seconds

await server.register(webhookRoutes);
await server.register(uploadRoutes);
await server.register(youtubeRoutes);
// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`Hepfol backend running at http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
