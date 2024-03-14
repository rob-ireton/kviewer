# syntax=docker/dockerfile:1
FROM golang:1.22.1-alpine AS base
WORKDIR /src
COPY go.mod go.sum .
RUN go mod download
COPY . .
RUN go build -o /bin/server .

FROM alpine:latest
COPY --from=base /bin/server /bin/server

EXPOSE 8088
ENTRYPOINT [ "/bin/server" ]