## OpenClawbot Replica

Fast, agentic workspace inspired by OpenClawbot. Drop a mission and the web app classifies intent, spins up tooling (signal scan, trend pulse, build accelerator), and replies with a structured playbook covering reasoning, task graph, and memory candidates.

### Features
- Autonomous reasoning pipeline with intent detection, keyword extraction, and tool orchestration.
- Synthetic tool suite returning curated insights, strategy heuristics, and build checklists.
- Memory shard extraction for profile facts and cadence hints.
- Rich UI: reasoning trace, tool outputs, task tracker, and status console.

### Local Development
```bash
npm install
npm run dev
```
Navigate to `http://localhost:3000` to interact with the agent.

### Production Build
```bash
npm run build
npm run start
```

### API
`POST /api/chat`  
Body: `{ messages: Array<{ id?: string; role: "user" | "assistant" | "system"; content: string; createdAt?: string }> }`

Returns the assistant turn (message, reasoning, tools, tasks, memory).

### Deployment
This project is preconfigured for Vercel. Use the CLI:
```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-ebddcd50
```
Then verify:
```bash
curl https://agentic-ebddcd50.vercel.app
```
