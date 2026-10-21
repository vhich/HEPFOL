import { FastifyReply, FastifyRequest } from "fastify";
import { supabase } from "../lib/supabase";

export const checkAuthorization = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
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
};

export const verifiedUser = async (request: FastifyRequest) => {
  const authHeader = request.headers.authorization;
  const token = authHeader && authHeader.replace("Bearer ", "");
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  return user;
};
