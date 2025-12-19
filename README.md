This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Running with Docker

This project includes Docker support for easy deployment and containerization.

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) (optional, for easier management)

### Quick Start with Docker

#### Option 1: Using Docker Compose (Recommended)

1. **Create a `.env` file** in the root directory with your environment variables:
   ```env
   NEXT_PUBLIC_API_BASE_URL=your_api_url_here
   # Add other environment variables as needed
   ```

2. **Build and run the container**:
   ```bash
   docker-compose up -d
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f
   ```

4. **Stop the container**:
   ```bash
   docker-compose down
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

#### Option 2: Using Docker Commands

1. **Build the Docker image**:
   ```bash
   docker build -t mailria-app .
   ```

2. **Run the container**:
   ```bash
   docker run -d \
     -p 3000:3000 \
     --name mailria-app \
     --env-file .env \
     mailria-app
   ```

   Or set environment variables directly:
   ```bash
   docker run -d \
     -p 3000:3000 \
     --name mailria-app \
     -e NEXT_PUBLIC_API_BASE_URL=your_api_url_here \
     mailria-app
   ```

3. **View logs**:
   ```bash
   docker logs -f mailria-app
   ```

4. **Stop and remove the container**:
   ```bash
   docker stop mailria-app
   docker rm mailria-app
   ```

### Environment Variables

Make sure to set the following environment variables before running:

- `NEXT_PUBLIC_API_BASE_URL` - Your API base URL (required)

You can set these in:
- A `.env` file (use `--env-file .env` with Docker)
- Docker Compose `environment` section
- Directly in the `docker run` command with `-e` flags

### Useful Docker Commands

```bash
# Rebuild the image after code changes
docker-compose build

# Rebuild and restart
docker-compose up -d --build

# View running containers
docker ps

# Access container shell
docker exec -it mailria-app sh

# Remove all containers and images
docker-compose down --rmi all
```

### Production Considerations

- The Dockerfile uses a multi-stage build for optimized image size
- The application runs as a non-root user for security
- Health checks are configured in docker-compose.yml
- The container automatically restarts unless stopped

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
