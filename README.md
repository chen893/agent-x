# Agent-X - AI 智能代码生成平台

一个基于 T3 Stack 构建的智能 AI 代码生成平台，集成多个大语言模型，提供从需求分析到代码实现的全流程自动化开发体验。

## ✨ 核心特性

- 🤖 **多 AI 智能体协作**：产品经理 Agent + 软件开发 Agent 协同工作
- 🔄 **全流程自动化**：需求分析 → 架构设计 → 代码生成 → 代码审查
- 🎯 **多模型支持**：集成 OpenAI、DeepSeek、Google、TogetherAI 等主流 LLM
- 💾 **项目持久化**：完整的项目管理和版本控制系统
- 🎨 **实时预览**：支持 HTML/CSS/JS 代码的实时预览和全屏展示
- 🔐 **用户认证**：基于 NextAuth.js 的安全认证系统

## 🛠️ 技术栈

### 前端框架
- **Next.js 15** - React 全栈框架
- **React 19** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS 4** - 原子化 CSS 框架

### 后端技术
- **tRPC** - 端到端类型安全的 API
- **Prisma** - 现代数据库 ORM
- **NextAuth.js** - 身份认证解决方案

### AI 集成
- **AI SDK** - Vercel AI SDK 核心库
- **@ai-sdk/openai** - OpenAI 模型集成
- **@ai-sdk/deepseek** - DeepSeek 模型集成
- **@ai-sdk/google** - Google AI 模型集成
- **@ai-sdk/togetherai** - TogetherAI 模型集成

### 状态管理
- **Zustand** - 轻量级状态管理
- **TanStack Query** - 服务端状态管理

### UI 组件
- **Radix UI** - 无样式组件库
- **Framer Motion** - 动画库
- **Lucide React** - 图标库
- **React Markdown** - Markdown 渲染

## 🏗️ 项目架构
src/
├── app/                    # Next.js App Router
│   ├── api/agents/        # AI Agent API 路由
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   └── CodePreview.tsx   # 代码预览组件
├── hooks/                # 自定义 Hooks
│   └── useAgentCompletion.ts  # AI 完成逻辑
├── server/               # 服务端代码
│   ├── api/             # tRPC API 路由
│   └── core/            # 核心业务逻辑
│       └── agent.ts     # AI Agent 基类
├── store/               # 状态管理
│   └── agent.ts         # Agent 状态存储
└── lib/                 # 工具函数


## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm (推荐)
- 数据库 (PostgreSQL/MySQL/SQLite)

### 安装依赖
```bash
pnpm install

### 环境配置
复制 .env.example 到 .env 并配置以下环境变量：
# 数据库
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# AI 模型 API Keys
OPENAI_API_KEY="your-openai-key"
DEEPSEEK_API_KEY="your-deepseek-key"
GOOGLE_API_KEY="your-google-key"
TOGETHERAI_API_KEY="your-togetherai-key"


### 数据库设置
# 生成 Prisma 客户端
pnpm db:generate

# 推送数据库模式
pnpm db:push

# 或运行迁移
pnpm db:migrate

### 启动开发服务器
pnpm dev

访问 http://localhost:3000 开始使用。

## 📊 数据库模型
### 用户认证
- User - 用户信息
- Account - 第三方账户关联
- Session - 用户会话
- VerificationToken - 验证令牌
### 项目管理
- Project - 项目基本信息
- Document - 项目文档 (需求、架构、代码审查等)
- CodeFile - 代码文件版本管理
## 🤖 AI Agent 系统
### ProductManagerAgent
- 需求分析和产品规划
- PRD (产品需求文档) 生成
- 需求反馈和迭代优化
### SoftwareDeveloper
- 基于需求生成代码
- 支持 HTML/CSS/JavaScript
- 代码续写和修复
- 代码审查和优化建议
## 🎯 核心功能
1. 智能需求分析 ：AI 产品经理分析用户需求，生成详细的 PRD
2. 自动代码生成 ：AI 开发工程师根据需求生成完整的前端代码
3. 实时代码预览 ：支持生成代码的实时预览和全屏展示
4. 项目版本管理 ：完整的项目历史记录和版本控制
5. 代码智能修复 ：AI 驱动的代码问题检测和修复建议
6. 多文件协作 ：支持多文件项目的协同开发

## 📝 开发脚本
# 开发
pnpm dev              # 启动开发服务器 (Turbo 模式)

# 构建
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器
pnpm preview          # 构建并预览

# 代码质量
pnpm lint             # ESLint 检查
pnpm lint:fix         # 自动修复 ESLint 问题
pnpm typecheck        # TypeScript 类型检查
pnpm check            # 运行 lint 和 typecheck

# 格式化
pnpm format:check     # 检查代码格式
pnpm format:write     # 格式化代码

# 数据库
pnpm db:studio        # 打开 Prisma Studio
pnpm db:push          # 推送数据库模式
pnpm db:migrate       # 运行数据库迁移


## 🤝 贡献指南
1. Fork 本仓库
2. 创建特性分支 ( git checkout -b feature/AmazingFeature )
3. 提交更改 ( git commit -m 'Add some AmazingFeature' )
4. 推送到分支 ( git push origin feature/AmazingFeature )
5. 打开 Pull Request
## 📄 许可证
本项目采用 MIT 许可证 - 查看 LICENSE 文件了解详情。

## 🙏 致谢
- T3 Stack - 现代全栈开发脚手架
- Vercel AI SDK - AI 应用开发工具包
- Prisma - 下一代 ORM
- Tailwind CSS - 实用优先的 CSS 框架