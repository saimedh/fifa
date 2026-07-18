# -- Stage 1: Build --------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (layer-cached unless package.json changes)
COPY package*.json ./
RUN npm ci

# Pass Vite env vars as build args so they get inlined at build time
ARG VITE_API_BASE=http://localhost:8000
ARG VITE_TINYFISH_API_KEY=`"`"
ARG VITE_SUPABASE_URL=`"`"
ARG VITE_SUPABASE_ANON_KEY=`"`"
ARG VITE_WS_URL=ws://localhost:8000/ws/scores

ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_TINYFISH_API_KEY=$VITE_TINYFISH_API_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_WS_URL=$VITE_WS_URL

# Copy source and build
COPY . .
RUN npm run build

# -- Stage 2: Serve --------------------------------------------
FROM nginx:1.27-alpine AS runner

# Remove default nginx config and replace with ours
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD [`"nginx`", `"-g`", `"daemon off;`"]
