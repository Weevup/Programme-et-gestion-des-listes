import { createServer } from "./server.js";
import { InMemoryStore } from "./store.js";

const PORT = Number(process.env.PORT ?? 3000);

async function bootstrap() {
  const store = new InMemoryStore();
  const app = createServer(store);

  app.listen(PORT, () => {
    console.log(`Weevup back-office API listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
