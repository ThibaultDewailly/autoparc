# Build stage
FROM golang:alpine AS builder

# Set Go toolchain to auto to allow downloading newer versions
ENV GOTOOLCHAIN=auto

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy source code
COPY backend/ .

# Build the application with auto toolchain
RUN GOTOOLCHAIN=auto CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o api cmd/api/main.go

# Run stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates wget postgresql-client

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/api .

# Copy migrations from project root
COPY migrations /migrations

# Copy entrypoint script
COPY backend/entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["./entrypoint.sh"]

