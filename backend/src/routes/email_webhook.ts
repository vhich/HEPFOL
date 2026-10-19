import { FastifyInstance } from "fastify";
import { sendWelcomeEmail } from "../services/email.js";

export async function webhookRoutes(fastify: FastifyInstance) {
  fastify.post("/webhooks/supabase-user-signup", async (request, reply) => {
    const payload = request.body as {
      type: "INSERT";
      table: string;
      record: {
        id: string;
        email: string;
      };
    };

    // Verify it's an insertion on the users table
    if (payload.type === "INSERT" && payload.record?.email) {
      const { email } = payload.record;
      console.log(`New user detected via Supabase webhook: ${email}`);

      // Trigger Resend onboarding welcome email
      const result = await sendWelcomeEmail(email);

      if (!result.success) {
        return reply.code(500).send({ error: "Failed to send welcome email" });
      }

      return reply
        .code(200)
        .send({ success: true, message: "Welcome email sent." });
    }

    return reply.code(200).send({ message: "Event ignored" });
  });
}
