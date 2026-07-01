import { createServer } from "node:http";

const server = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Reno API Server" }));
});

const port = process.env.PORT ?? 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
