# Project Documentation

## Overview

This is a modern web application built with Next.js that provides file management capabilities with the following key features:

- File upload and management
- Tag organization system
- User authentication (via Clerk)
- File sharing capabilities
- Cloud storage (via Cloudflare R2)

## Tech Stack

- **Framework**: Next.js with TypeScript
- **Database**: PostgreSQL (via Neon)
- **ORM**: Drizzle
- **Authentication**: Clerk
- **API Layer**: tRPC
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Storage**: Cloudflare R2 (S3-compatible)

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                 # Core utilities and configurations
│   ├── db/             # Database configuration and schemas
│   ├── server/         # Server-side code and API routes
│   ├── trpc/           # tRPC configuration
│   └── utils.ts        # Utility functions
├── config/             # Application configuration
└── types/              # TypeScript type definitions
```

## Database Schema

The application uses several interconnected tables:

### Files Table
```sql
CREATE TABLE files (
    id varchar(255) PRIMARY KEY,
    name text NOT NULL,
    url text NOT NULL,
    type text NOT NULL,
    size integer NOT NULL,
    user_id varchar(255),
    position integer DEFAULT 0 NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);
```

### Tags Table
```sql
CREATE TABLE tags (
    id varchar(255) PRIMARY KEY,
    name text NOT NULL,
    user_id varchar(255) NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);
```

### File Tags Table (Junction)
```sql
CREATE TABLE file_tags (
    id serial PRIMARY KEY,
    file_id varchar(255) NOT NULL,
    tag_id varchar(255) NOT NULL,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

## Key Features

### File Management

1. **File Upload**
   - Supports image and video uploads
   - Files are stored in Cloudflare R2
   - Automatic file type detection and validation

2. **File Organization**
   - Tag-based organization system
   - File sorting and filtering
   - Position-based ordering

3. **File Sharing**
   - Generate shareable links
   - Track file views
   - Share via native share API when available

### Authentication

The application uses Clerk for authentication, providing:
- Email/password authentication
- Social login options
- Session management
- User profile management

### API Layer

The application uses tRPC for type-safe API routes:

```typescript
export const filesRouter = router({
  create: protectedProcedure,
  getAll: protectedProcedure,
  update: protectedProcedure,
  delete: protectedProcedure
});
```

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard


# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=
NEXT_PUBLIC_STRIPE_MAX_PRICE_ID=
NEXT_PUBLIC_STRIPE_ULTRA_PRICE_ID=

# Storage (Cloudflare R2)
CLOUDFLARE_ACCESS_ID=
CLOUDFLARE_ACCESS_KEY=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_BUCKET_NAME=
```

## Development

To run the project locally:

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Run database migrations:
```bash
pnpm db:migrate
```

4. Start the development server:
```bash
pnpm dev
```

## Database Management

Available database commands:

```bash
pnpm db:generate    # Generate migrations
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Drizzle Studio
pnpm db:push       # Push schema changes
```

## Deployment

The application is designed to be deployed on platforms like Vercel or similar services that support Next.js applications. Ensure all environment variables are properly configured in your deployment environment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is private and all rights are reserved.