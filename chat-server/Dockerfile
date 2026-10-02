FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod main.go ./
RUN go mod tidy && CGO_ENABLED=0 go build -o /chat-relay .

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=build /chat-relay /chat-relay
CMD ["/chat-relay"]
