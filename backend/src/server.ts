import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import dotenv from "dotenv";
import Fastify from "fastify";
import { webhookRoutes } from "./routes/email_webhook";

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
    fileSize: 500 * 1024 * 1024,
  },
});

// Health check route
server.get("/health", async (request, reply) => {
  return { status: "ok", service: "hepfol-backend" };
});

// Database connection test route
// server.get("/test-db", async (request, reply) => {
//   try {
//     const { data, error } = await supabase.from("users").select("*").limit(1);

//     if (error) {
//       return reply.code(500).send({ success: false, error: error.message });
//     }

//     return {
//       success: true,
//       message: "Successfully connected to Supabase!",
//       data,
//     };
//   } catch (err: any) {
//     return reply.code(500).send({ success: false, error: err.message });
//   }
// });

// File upload route
server.post("/upload", async (request, reply) => {
  const data = await request.file();

  if (!data) {
    return reply.code(400).send({ success: false, error: "No file uploaded." });
  }

  // Allowed MIME types for media repurposing
  const allowedMimeTypes = [
    "audio/mpeg",
    "audio/mp3",
    "video/mp4",
    "image/png",
    "image/jpeg",
  ];

  if (!allowedMimeTypes.includes(data.mimetype)) {
    return reply.code(400).send({
      success: false,
      error: `Invalid file type: ${data.mimetype}. Allowed types: MP3, MP4, PNG, JPEG.`,
    });
  }

  // At this point, the file is validated and ready to be piped to Supabase Storage
  return {
    success: true,
    filename: data.filename,
    mimetype: data.mimetype,
    encoding: data.encoding,
  };
});

await server.register(webhookRoutes);
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
