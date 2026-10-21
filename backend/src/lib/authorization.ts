import { FastifyReply, FastifyRequest } from "fastify";
import { supabase } from "../lib/supabase";

export const verifiedUser = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply
        .code(401)
        .send({ success: false, error: "Missing auth token." });
    }
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return reply.code(401).send({ success: false, error: "Unauthorized." });
    }
    return user;
  } catch (error) {
    throw new Error("Unauthorised user");
  }
};
