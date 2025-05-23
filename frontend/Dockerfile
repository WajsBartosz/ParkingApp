FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock . 
RUN yarn install

# Copy source code and build
COPY . .
RUN yarn build

# ---- Production image ----
FROM node:22-alpine AS runner
WORKDIR /app

# Install a lightweight static file server
RUN yarn global add serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose the port serve will run on
EXPOSE 3000

# Start the static file server
CMD ["serve", "-s", "dist", "-l", "3000"]
