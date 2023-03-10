import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateUserInput,
  JwtPayloadUser,
  LoginUserInput,
  ParamsWithId,
  UpdateUserProfileInput,
} from "shared";

import { ProjectService } from "../project/project.service";
import { UserService } from "./user.service";

export const UserController = {
  findAll: async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const users = await UserService.findAll();

      return reply.code(200).send(users);
    } catch (err: unknown) {
      return reply.send(err);
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
      const user = await UserService.createOne(body);

      return reply.code(201).send(user);
    } catch (err: unknown) {
      return reply.send(err);
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
      const user = await UserService.findById(parseInt(id));

      if (!user) {
        return reply.code(404).send({ message: "User not found" });
      }

      await UserService.deleteOne(parseInt(id));

      return reply.code(204).send();
    } catch (err: unknown) {
      return reply.send(err);
    }
  },

  updateUserDetails: async (
    request: FastifyRequest<{ Body: UpdateUserProfileInput }>,
    reply: FastifyReply
  ) => {
    const body = request.body;

    try {
      const userId = request.user.id;

      const user = await UserService.updateUserDetails({
        ...body,
        userId,
      });

      return reply.code(200).send(user);
    } catch (err: unknown) {
      return reply.send(err);
    }
  },

  deleteUserAccount: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.user;

      await UserService.deleteOne(id);

      return reply
        .clearCookie(process.env.COOKIE_NAME as string, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          domain: undefined,
          path: "/",
        })
        .code(204)
        .send();
    } catch (err: unknown) {
      return reply.send(err);
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

      const isPasswordValid = await UserService.comparePassword(
        body.password,
        user.password
      );

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
      return reply.send(err);
    }
  },

  logout: async (_request: FastifyRequest, reply: FastifyReply) => {
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

  getUserDetails: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const accessToken = request.cookies[process.env.COOKIE_NAME as string];

      if (!accessToken) {
        return reply.code(200).send(null);
      }

      const userPayload = request.jwt.verify<JwtPayloadUser>(accessToken);

      if (!userPayload) {
        return reply.code(200).send(null);
      }

      const user = await UserService.getUserDetails(userPayload.id);

      return reply.code(200).send(user);
    } catch (err: unknown) {
      return reply.send(err);
    }
  },

  getUserProjects: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user;

      const projects = await ProjectService.getUsersProjects(user.id);

      return reply.code(200).send(projects);
    } catch (err: unknown) {
      return reply.send(err);
    }
  },

  getBookmarkedProjects: async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const userId = request.user.id;

    try {
      const projects = await ProjectService.getBookmarkedProjects(userId);

      return reply.code(200).send(projects);
    } catch (err: unknown) {
      return reply.send(err);
    }
  },
};
