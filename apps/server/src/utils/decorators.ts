import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { JwtPayloadUser } from "shared";

export async function decorators(server: FastifyInstance) {
  server.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      return await request.jwtVerify();
    } catch (err) {
      return reply.send(err);
    }
  });

  server.decorate("checkAdmin", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await request.jwtVerify<JwtPayloadUser>();

      if (user.role !== "ADMIN") {
        return reply.code(401).send({ message: "Unauthorized" });
      }
      return user;
    } catch (err) {
      return reply.send(err);
    }
  });
}
