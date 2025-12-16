# Copilot / AI Agent guidance for this repo

Short, actionable notes to help an AI coding agent get productive quickly.

## Big picture (what this repo contains)
- client_/client — React + TypeScript (Vite) frontend dashboard (src/). Uses Tailwind and SignalR client (@microsoft/signalr).
- server_/server — ASP.NET Core (.NET 8, Windows-targeted) backend that hosts a SignalR hub (`/systemHub`) and serves static files from `wwwroot/`.
- client_/IpAgent — small .NET helper that runs a local WebSocket on ws://localhost:9999 to provide the client's LAN prefix for scanning.

Why: the React dashboard scans the LAN for the backend, connects to the SignalR hub to send/receive commands and realtime events, and uses the IpAgent/WebRTC fallbacks to detect local network prefixes.

## How to run (dev & minimal prod notes)
- Start server (dev): run `server_/run_server.bat` or (inside `server_/server`) `dotnet run --urls "http://0.0.0.0:5000"`.
- Start client (dev + helper): run `client_/run_client.bat` — this opens the IpAgent helper (dotnet run in client_/IpAgent) then `npm run dev` inside `client_/client`.
- Client npm scripts (client_/client/package.json): `dev` (vite --host), `build` (vite build), `lint` (eslint), `typecheck` (tsc --noEmit -p tsconfig.app.json).
- Production static serving: server serves files from `server_/server/wwwroot`. Typical flow: `cd client_/client && npm run build` → copy the build output (dist) into `server_/server/wwwroot/` (this repo currently uses a static `index.html` in wwwroot; adjust as needed).

## Important integration points & endpoints
- Discovery API used by the client scan: GET `http://{ip}:5000/api/discovery` (returns { message: "REMOTE_SERVER_HERE" }). See `server_/server/program.cs` and `client_/client/src/services/socketService.ts`.
- SignalR Hub: `http://{serverIP}:5000/systemHub` (mapped by `server_/server/program.cs` and used by `client_/client/src/services/socketService.ts` → `initSocket`).
- IpAgent WebSocket (local helper): `ws://localhost:9999` — client attempts to read `{ prefix }` to speed up LAN scanning (see `client_/IpAgent/Program.cs` and `client_/client/src/contexts/SocketContext.ts`).
- Client → Server commands map: src/services/socketService.ts (switch case) → Server implements corresponding methods on `SystemHub` (e.g. `StartKeylog` / `StopKeylog` / `TakeScreenshot` / `ShutdownServer` / `RestartServer` / `GetProcesses` / `KillProcess` / `GetWebcams` / `StartWebcam` / `StopWebcam`).
- Common server-to-client event names to watch for: `UpdateSystemStatus`, `UpdateClientList`, `ReceiveLog`, `ReceiveKey`, `ReceiveScreenshot`, `ReceiveScreenshotError`, `ReceiveWebcamList`, `ReceiveProcessList`, `ReceiveSystemStats`.

## Key files to inspect when changing behavior
- client_/client/src/services/socketService.ts — sendCommand() maps front-end actions to Server Hub method names; scanForServer() contains batching and timeout logic used by startScan.
- client_/client/src/contexts/SocketContext.ts — high-level socket lifecycle, `startScan`, `connectToIp`, and local IP heuristics (WebSocket helper and WebRTC fallback).
- client_/client/src/components/* — examples of listening for hub events and UI interaction patterns (ProcessManager, ScreenshotCard, KeyloggerCard, WebcamCard, AgentSelector).
- server_/server/Hubs/SystemHub.cs — main SignalR hub implementing server-side commands and broadcasting events.
- server_/server/Services/* — business logic: KeyloggerService (Windows hook), SystemActionService (screenshots, shutdown, process management), WebcamService (AForge / DirectShow support).

## Project-specific conventions & gotchas
- Environment: Server targets `net8.0-windows` and uses `System.Windows.Forms`, AForge, and low-level Windows APIs — run and debug on Windows for full functionality (webcam, screen capture, keylogger).
- Keylogger/Webcam & screen capture may require elevated permissions and a UI session; camera capture uses native libs (AForge) — these are Windows-specific.
- The client scans the LAN in batches (BATCH_SIZE = 20, 1s fetch timeout) — be mindful of timeouts/latency when testing in slow networks.
- Many code comments and inline notes are in Vietnamese; search for `SỬA LỖI` tags for quick developer hints.

## Small patterns AI should follow when adding features
- When adding a new client command:
  - Add a case to `sendCommand(action, payload)` in `client_/client/src/services/socketService.ts` with the same semantics as other commands.
  - Implement a corresponding method in `server_/server/Hubs/SystemHub.cs` (respect `CheckLock()` behavior if the action should be blocked when the system is locked).
  - Add client-side event listeners (`socket.on("EventName")`) and `socket.off(...)` cleanup in the component `useEffect`.
- When adding UI components: prefer existing patterns (Tailwind classes, `glass-panel` wrapper, `font-mono` styling) and reuse `useSocket()` for socket + isConnected state.

## Debugging tips
- If the frontend cannot find the server:
  - Confirm `run_server.bat` (server listening on :5000) is running and `GET http://{ip}:5000/api/discovery` returns the expected JSON.
  - Ensure IpAgent is running (`client_/run_client.bat` starts it). You can also `curl` the discovery endpoint directly.
- Check browser console for SignalR connection logs and server console for hub logs; the server also broadcasts log messages via `ReceiveLog` to clients.
- To quickly connect to a known server IP in the client, call `connectToIp(ip)` (see `SocketContext`) or edit `AgentSelector` to provide an explicit IP in dev.

## Security & legal note
- This project contains potentially dangerous functionality (keylogging, remote shutdown, remote process control). Only run on machines you own or have explicit permission to test on. Respect legal and ethical constraints.

---
If you'd like, I can trim or expand any section, add quick code snippets showing a complete `sendCommand` → `SystemHub` example, or merge this into an existing doc if you have one elsewhere in the repo. Please tell me what to change. ✅
