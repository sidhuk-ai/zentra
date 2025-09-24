# 🧠 Zentra — B2B AI SaaS Support Platform

Zentra is a modular, scalable AI-powered support platform designed for B2B SaaS companies. Built with a modern monorepo architecture, it streamlines customer support workflows using intelligent automation, real-time error tracking, and seamless authentication.

## 🚀 Features

- 🤖 AI-driven support automation for faster resolution
- 🔐 Secure authentication via Clerk and Convex
- 📦 Monorepo structure powered by TurboRepo
- 📊 Real-time error monitoring with Sentry
- 🎨 Shared UI components using `shadcn/ui`
- 💨 TailwindCSS integration for rapid styling
- 🧩 Modular architecture for apps and packages

## 🏗️ Tech Stack

| Layer         | Technology                     |
|--------------|---------------------------------|
| Frontend     | React, TailwindCSS, shadcn/ui   |
| Backend      | Convex, Clerk                   |
| Monitoring   | Sentry                          |
| Tooling      | TurboRepo, pnpm, ESLint         |
| Language     | TypeScript                      |

## 📁 Monorepo Structure
```
zentra/
├── apps/                  # Application layer
│   └── web/               # Main frontend app (React + TailwindCSS)
├── packages/              # Shared packages
│   └── ui/                # Reusable UI components (shadcn/ui)
├── .vscode/               # Editor configuration
├── .eslintrc.js           # Linting rules
├── pnpm-workspace.yaml    # Workspace config for pnpm
├── turbo.json             # TurboRepo pipeline config
└── README.md              # Project overview
```

## 🛠️ Getting Started

### Prerequisites

- Node.js ≥ 18.x
- pnpm ≥ 8.x

### Installation

```bash
pnpm install
```

### Running the App

```bash
pnpm dev
```

### Adding UI Components

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

## 📉 Error Monitoring

Sentry is integrated across the app for real-time error tracking. Configure your DSN in the environment variables.

## 📦 Package Management

This repo uses pnpm with workspace support. All dependencies are managed centrally.

## 🤝 Contributing

We welcome contributions! Please follow the conventional commit format and open a PR with a clear description.
