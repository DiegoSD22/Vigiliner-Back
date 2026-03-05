-- Add username column for username-based authentication
ALTER TABLE "users"
ADD COLUMN "username" VARCHAR(50) NOT NULL;

-- Ensure username uniqueness across all users
ALTER TABLE "users"
ADD CONSTRAINT "users_username_key" UNIQUE ("username");
