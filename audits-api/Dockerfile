FROM golang:1.22-bookworm AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server ./cmd/server

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y python3 python3-pip ca-certificates \
  && pip3 install python-docx --break-system-packages \
  && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/server /app/server
COPY --from=builder /app/template.docx /app/template.docx
COPY --from=builder /app/internal/finding/gen_docx.py /app/internal/finding/gen_docx.py
WORKDIR /app
EXPOSE 8080
CMD ["./server"]
