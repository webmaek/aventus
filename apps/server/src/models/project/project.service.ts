import {
  CreateCommentInput,
  CreateProjectInput,
  UpdateCommentInput,
} from "shared";

import { prisma } from "../../utils/db";
import { getSlug } from "../../utils/getSlug";

export const ProjectService = {
  feed: async (query: {
    limit: number;
    cursor?: string;
    tag?: string;
    query?: string;
  }) => {
    const { limit, cursor, tag } = query;

    const projects = await prisma.project.findMany({
      where: {
        title: {
          contains: query.query,
        },
        tags: {
          some: {
            name: tag,
          },
        },
      },
      include: {
        tags: true,
        likes: true,
        comments: true,
        bookmarks: true,
        _count: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            bio: true,
            location: true,
            websiteUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit + 1,
      cursor: cursor ? { id: parseInt(cursor) } : undefined,
    });

    let nextCursor: number | undefined = undefined;

    if (projects.length > limit) {
      const nextItem = projects.pop() as (typeof projects)[number];

      nextCursor = nextItem.id;
    }

    return {
      projects,
      nextCursor,
    };
  },

  findAll: async (query?: { tag: string }) => {
    const projects = await prisma.project.findMany({
      where: {
        tags: {
          some: {
            name: query?.tag,
          },
        },
      },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            bio: true,
            location: true,
            websiteUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        likes: true,
        bookmarks: true,
        _count: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.project.count({
      where: {
        tags: {
          some: {
            name: query?.tag,
          },
        },
      },
      select: {
        _all: true,
      },
    });

    return {
      data: projects,
      meta: {
        total,
      },
    };
  },

  findOne: async (slug: string) => {
    const project = await prisma.project.findUnique({
      where: {
        slug,
      },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            bio: true,
            location: true,
            websiteUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        likes: true,
        bookmarks: true,
        _count: true,
      },
    });

    return project;
  },

  getProjectStats: async (slug: string) => {
    const project = await prisma.project.findUnique({
      where: {
        slug,
      },
      select: {
        likes: true,
        bookmarks: true,
        _count: {
          select: {
            comments: true,
            likes: true,
            bookmarks: true,
          },
        },
      },
    });

    return project;
  },

  createOne: async (input: CreateProjectInput & { userId: number }) => {
    const tagsIds = input.tags.map(Number);

    const tags = await prisma.tag.findMany({
      where: {
        id: {
          in: tagsIds,
        },
      },
    });

    const project = await prisma.project.create({
      data: {
        title: input.title,
        slug: getSlug(input.title),
        description: input.description,
        content: input.content,
        tags: {
          connect: tags.map((tag) => ({ id: tag.id })),
        },
        user: {
          connect: {
            id: input.userId,
          },
        },
      },
      include: {
        tags: true,
        likes: true,
        bookmarks: true,
      },
    });

    return project;
  },

  updateOne: async (input: CreateProjectInput & { slug: string }) => {
    const tagsIds = input.tags.map(Number);

    const tags = await prisma.tag.findMany({
      where: {
        id: {
          in: tagsIds,
        },
      },
    });

    const project = await prisma.project.update({
      where: {
        slug: input.slug,
      },
      data: {
        title: input.title,
        description: input.description,
        content: input.content,
        tags: {
          connect: tags.map((tag) => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
        likes: true,
        bookmarks: true,
      },
    });

    return project;
  },

  deleteOne: async (slug: string) => {
    const project = await prisma.project.delete({
      where: {
        slug,
      },
    });

    return project;
  },

  getUsersProjects: async (userId: number) => {
    const projects = await prisma.project.findMany({
      where: {
        userId,
      },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            bio: true,
            location: true,
            websiteUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        likes: true,
        bookmarks: true,
        _count: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return projects;
  },

  findOneComment: async (id: string) => {
    const comment = await prisma.comment.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        user: true,
      },
    });

    return comment;
  },

  createComment: async (
    input: CreateCommentInput & { userId: number; slug: string }
  ) => {
    const comment = await prisma.comment.create({
      data: {
        content: input.content,
        user: {
          connect: {
            id: input.userId,
          },
        },
        project: {
          connect: {
            slug: input.slug,
          },
        },
      },
    });

    return comment;
  },

  updateComment: async (input: UpdateCommentInput & { id: string }) => {
    const { id, ...rest } = input;

    const comment = await prisma.comment.update({
      where: {
        id: Number(id),
      },
      data: {
        ...rest,
      },
    });

    return comment;
  },

  deleteComment: async (id: string) => {
    const comment = await prisma.comment.delete({
      where: {
        id: Number(id),
      },
    });

    return comment;
  },

  getComments: async (slug: string) => {
    const comments = await prisma.comment.findMany({
      where: {
        project: {
          slug,
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return comments;
  },

  likeProject: async (slug: string, userId: number) => {
    const project = await prisma.project.findUnique({
      where: {
        slug,
      },
      include: {
        likes: true,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const isLiked = project.likes.find((like) => like.userId === userId);

    if (isLiked) {
      const like = await prisma.like.delete({
        where: {
          id: isLiked.id,
        },
      });

      return like;
    } else {
      const like = await prisma.like.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          project: {
            connect: {
              slug,
            },
          },
        },
      });

      return like;
    }
  },

  bookmarkProject: async (slug: string, userId: number) => {
    const project = await prisma.project.findUnique({
      where: {
        slug,
      },
      include: {
        bookmarks: true,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const isBookmarked = project.bookmarks.find(
      (bookmark) => bookmark.userId === userId
    );

    if (isBookmarked) {
      const bookmark = await prisma.bookmark.delete({
        where: {
          id: isBookmarked.id,
        },
      });

      return bookmark;
    } else {
      const bookmark = await prisma.bookmark.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          project: {
            connect: {
              slug,
            },
          },
        },
      });

      return bookmark;
    }
  },

  getBookmarkedProjects: async (userId: number) => {
    const projects = await prisma.project.findMany({
      where: {
        bookmarks: {
          some: {
            userId,
          },
        },
      },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            bio: true,
            location: true,
            websiteUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        likes: true,
        bookmarks: true,
        _count: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return projects;
  },
};
