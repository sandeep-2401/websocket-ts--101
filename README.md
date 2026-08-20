# ping-pong-party 🏓

A tiny WebSocket chat server, built to properly learn WebSockets from the ground up instead of just having them on my resume.

This is also just to get started again — first commit in a while, so keeping it small on purpose.

## What it does

- Multiple clients can connect and join with a name
- Broadcasts chat messages to everyone else connected
- Tracks and broadcasts an online users list
- Cleans up when someone disconnects
- Heartbeat (ping/pong) to detect dead connections

## Running it

```bash
npm install
npx ts-node index.ts
```

Server runs on `ws://localhost:8080`. Tested using [Hoppscotch](https://hoppscotch.io)'s WebSocket tab — connect, then send:

```json
{ "type": "join", "payload": { "name": "your-name" } }
```

followed by:

```json
{ "type": "chat_message", "payload": { "text": "hello" } }
```

Open a second connection to see messages actually broadcast between clients.
