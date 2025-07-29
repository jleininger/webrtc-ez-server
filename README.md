# WebRTC Ez Server

A simple signaling server built in Deno for use with the [webrtc-ez-godot](https://github.com/jleininger/webrtc-ez-godot) plugin.

## Features

- Create lobbies with a unique id to share with friends.
- Handle peer to peer handshakes for establishing WebRTC connection.
- TypeScript for type safety.
- Dockerfile for building and deploying to a docker server.

## Getting Started

### Prerequisites

- [Deno](https://deno.com/manual/getting_started/installation) (v1.0+)

### Running the Server

```bash
deno run --allow-env --env-file --allow-net src/index.ts
```

or use your favorite package manager:

```bash
yarn start
yarn start:dev #dev mode with watch
yarn start:docker #run in docker container
```
```bash
npm run start
npm run start:dev
npm run start:docker
```
```bash
pnpm run start
pnpm run start:dev
pnpm run start:docker
```

## License

MIT
