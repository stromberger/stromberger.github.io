# Build stage
FROM denoland/deno:2.1.4 AS builder

WORKDIR /app

# Copy configuration files
COPY deno.json deno.lock* ./

# Cache dependencies
RUN deno task lume || true

# Copy source files
COPY . .

# Build the site
RUN deno task build

# Production stage
FROM nginx:alpine

# Copy built site from builder stage
COPY --from=builder /app/_site /usr/share/nginx/html

# Copy nginx configuration (optional - nginx default config works for static sites)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
