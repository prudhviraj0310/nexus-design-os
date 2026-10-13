# AWS Production Deployment Guide — Nexus Design OS

This guide details how to deploy Nexus Design OS to production on Amazon Web Services (AWS) using **AWS App Runner** (or **ECS Fargate**) and **Amazon RDS (PostgreSQL)**.

---

## Architecture Overview

```
[ User Browser / Figma ]          [ GitHub / AI MCP Agents ]
            │                                 │
            └───────────────┬─────────────────┘
                            │ (HTTPS / TLS 1.3)
                            ▼
            [ Amazon Route 53 + ACM Certificate ]
                            │
                            ▼
        [ AWS App Runner / Amazon ECS Fargate ]
        └── Docker Container (Next.js 16 + Node.js 22)
            ├── App Router Engine
            ├── Native RS256 JWT Signer (crypto)
            ├── AST Compliance Engine (Babel)
            └── Model Context Protocol (MCP) Server
                            │
                            ▼ (VPC / Encrypted Connection)
            [ Amazon RDS PostgreSQL ]
            └── Managed Postgres Instance
```

---

## Step 1: Provision Managed Database (Amazon RDS)

1. In the AWS Console, navigate to **RDS** $\to$ **Create database**.
2. **Engine:** PostgreSQL 16+.
3. **Template:** Free Tier or Production (db.t4g.micro or db.t4g.small).
4. **Settings:** Set Master username (`postgres`) and Master password.
5. **Connectivity:**
   - Enable Public access (if App Runner is not configured inside a custom VPC) OR configure VPC connector.
   - Note the connection endpoint: `your-cluster.cxxxxxx.us-east-1.rds.amazonaws.com`.
6. **Connection String:**
   ```bash
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@your-cluster.cxxxxxx.us-east-1.rds.amazonaws.com:5432/nexus"
   ```

*When `DATABASE_URL` is set, Nexus Design OS automatically uses high-performance PostgreSQL connection pooling (`pg.Pool`) and runs schema migrations on startup.*

---

## Step 2: Configure Secrets & Environment Variables

Store your production credentials in **AWS Secrets Manager** or **AWS Systems Manager Parameter Store**:

| Variable | Description | Example / Source |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Listening port | `3000` |
| `DATABASE_URL` | RDS connection string | `postgresql://user:pass@rds...:5432/nexus` |
| `GITHUB_APP_ID` | GitHub App ID | From `.data/github-app.json` |
| `GITHUB_APP_PRIVATE_KEY` | RSA Private Key (PEM) | Full private key with `\n` line breaks |
| `GITHUB_CLIENT_ID` | GitHub App OAuth Client ID | From GitHub App settings |
| `GITHUB_CLIENT_SECRET` | GitHub App OAuth Secret | From GitHub App settings |
| `FIGMA_TOKEN` | Figma Personal Access Token | Generated from Figma Security settings |
| `NOVA_ADMIN_PASSWORD` | Single admin password | High-entropy string (min 16 chars) |
| `NOVA_SESSION_SECRET` | Cookie signing HMAC secret | Random string (min 32 chars) |
| `NOVA_API_KEY` | Bearer key for CI/MCP agents | Min 24 characters |
| `NEXT_PUBLIC_APP_URL` | Canonical public HTTPS URL | `https://tokens.yourdomain.com` |

---

## Step 3: Build & Push Docker Image to Amazon ECR

1. Authenticate Docker with Amazon ECR:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   ```

2. Create an ECR repository:
   ```bash
   aws ecr create-repository --repository-name nexus-design-os --region us-east-1
   ```

3. Build and tag the image using the existing `Dockerfile`:
   ```bash
   docker build -t nexus-design-os .
   docker tag nexus-design-os:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/nexus-design-os:latest
   docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/nexus-design-os:latest
   ```

---

## Step 4: Deploy on AWS App Runner (Fastest & Fully Managed)

1. Navigate to **AWS App Runner** $\to$ **Create service**.
2. **Source:** Container registry $\to$ Amazon ECR $\to$ Select `nexus-design-os:latest`.
3. **Deployment trigger:** Automatic (deploys whenever a new image is pushed) or Manual.
4. **Service settings:**
   - Port: `3000`
   - CPU: `1 vCPU`, Memory: `2 GB`
5. **Environment variables:** Reference the variables configured in Step 2.
6. Click **Create & Deploy**. App Runner will provision an auto-scaling cluster with an automatic HTTPS URL (`https://xxxxxx.us-east-1.awsapprunner.com`).

---

## Step 5: Custom Domain & GitHub App Configuration

1. In App Runner, go to **Custom domains** $\to$ Add your domain (e.g. `tokens.yourdomain.com`).
2. Add the generated DNS CNAME records to **Route 53**.
3. In **GitHub** $\to$ **Settings** $\to$ **Developer Settings** $\to$ **GitHub Apps** $\to$ Your App:
   - **Homepage URL:** `https://tokens.yourdomain.com`
   - **Callback URL:** `https://tokens.yourdomain.com/api/github/app/callback`
   - **Setup URL:** `https://tokens.yourdomain.com/api/github/app/callback`
