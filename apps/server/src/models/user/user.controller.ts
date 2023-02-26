import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserInput, LoginUserInput, ParamsWithId } from "shared/schemas";

import { UserService } from "./user.service";

export const UserController = {
  findAll: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const users = await UserService.findAll();

      return reply.code(200).send(users);
    } catch (err: unknown) {
      reply.send(err);
    }
  },

  createOne: async (
    request: FastifyRequest<{
      Body: CreateUserInput;
    }>,
    reply: FastifyReply
  ) => {
    const body = request.body;

    try {
      if (body.password !== body.confirmPassword) {
        return reply.code(401).send({ message: "Passwords do not match" });
      }

      const user = await UserService.createOne(body);

      return reply.code(201).send(user);
    } catch (err: unknown) {
      reply.send(err);
    }
  },

  deleteOne: async (
    request: FastifyRequest<{
      Params: ParamsWithId;
    }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;

    try {
      const user = await UserService.findById(id);

      if (!user) {
        return reply.code(404).send({ message: "User not found" });
      }

      await UserService.deleteOne(id);

      return reply.code(204).send();
    } catch (err: unknown) {
      reply.send(err);
    }
  },

  deleteUserAccount: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.user;

      await UserService.deleteOne(String(id));

      return reply.code(204).send();
    } catch (err: unknown) {
      reply.send(err);
    }
  },

  login: async (
    request: FastifyRequest<{
      Body: LoginUserInput;
    }>,
    reply: FastifyReply
  ) => {
    const body = request.body;

    try {
      const user = await UserService.findUserByEmail(body.email);

      if (!user) {
        return reply.code(404).send({ message: "User not found" });
      }

      const isPasswordValid = await UserService.comparePassword(body.password, user.password);

      if (!isPasswordValid) {
        return reply.code(401).send({ message: "Invalid password" });
      }

      const { id, name, email, avatar, role } = user;

      const accessToken = request.jwt.sign({ id, name, email, avatar, role });

      return reply
        .setCookie(process.env.COOKIE_NAME as string, accessToken, {
          maxAge: 1000 * 60 * 60 * 24 * 30,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          domain: undefined,
          path: "/",
        })
        .code(200)
        .send({ accessToken });
    } catch (err: unknown) {
      reply.send(err);
    }
  },

  logout: async (request: FastifyRequest, reply: FastifyReply) => {
    return reply
      .clearCookie(process.env.COOKIE_NAME as string, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        domain: undefined,
        path: "/",
      })
      .code(200)
      .send({ success: true });
  },

  me: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await request.jwtVerify();

      if (!user) {
        return reply.code(200).send(null);
      }

      return reply.code(200).send(user);
    } catch (err: unknown) {
      reply.send(err);
    }
  },
};
