import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { DocumentType } from "@prisma/client";

export const projectRouter = createTRPCRouter({
  // 创建新项目
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await ctx.db.project.create({
          data: {
            name: input.name,
            description: input.description,
            userId: ctx.session.user.id,
          },
        });

        return project;
      } catch (error) {
        throw new Error(
          `创建项目失败: ${error instanceof Error ? error.message : "未知错误"}`,
        );
      }
    }),

  // 保存或更新文档
  saveDocument: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        type: z.nativeEnum(DocumentType),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 检查项目是否属于当前用户
      const project = await ctx.db.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.session.user.id,
        },
      });

      if (!project) {
        throw new Error("未找到项目或无权限");
      }

      // 查找是否已有同类型文档
      const existingDoc = await ctx.db.document.findFirst({
        where: {
          projectId: input.projectId,
          type: input.type,
        },
      });

      if (existingDoc) {
        // 更新现有文档
        return ctx.db.document.update({
          where: { id: existingDoc.id },
          data: { content: input.content, updatedAt: new Date() },
        });
      } else {
        // 创建新文档
        return ctx.db.document.create({
          data: {
            type: input.type,
            content: input.content,
            projectId: input.projectId,
          },
        });
      }
    }),

  // 保存代码文件
  saveCodeFile: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        filename: z.string(),
        fileType: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 验证项目所有权
      const project = await ctx.db.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.session.user.id,
        },
      });

      if (!project) {
        throw new Error("未找到项目或无权限");
      }

      // 查找是否已有同名文件
      const existingFile = await ctx.db.codeFile.findFirst({
        where: {
          projectId: input.projectId,
          filename: input.filename,
          isLatest: true,
        },
      });

      if (existingFile) {
        // 将旧版本标记为非最新
        await ctx.db.codeFile.update({
          where: { id: existingFile.id },
          data: { isLatest: false },
        });

        // 创建新版本
        return ctx.db.codeFile.create({
          data: {
            filename: input.filename,
            fileType: input.fileType,
            content: input.content,
            projectId: input.projectId,
            versionNum: existingFile.versionNum + 1,
          },
        });
      } else {
        // 创建新文件
        return ctx.db.codeFile.create({
          data: {
            filename: input.filename,
            fileType: input.fileType,
            content: input.content,
            projectId: input.projectId,
          },
        });
      }
    }),

  // 获取用户的项目列表
  getUserProjects: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }),

  // 获取项目详情
  getProjectById: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.session.user.id,
        },
      });

      if (!project) {
        throw new Error("未找到项目或无权限");
      }

      return project;
    }),

  // 获取项目文档
  getProjectDocuments: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // 验证项目所有权
      const project = await ctx.db.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.session.user.id,
        },
      });

      if (!project) {
        throw new Error("未找到项目或无权限");
      }

      return ctx.db.document.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }),

  // 获取项目代码文件
  getProjectCodeFiles: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // 验证项目所有权
      const project = await ctx.db.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.session.user.id,
        },
      });

      if (!project) {
        throw new Error("未找到项目或无权限");
      }

      return ctx.db.codeFile.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: [
          {
            filename: "asc",
          },
          {
            versionNum: "desc",
          },
        ],
      });
    }),
});
