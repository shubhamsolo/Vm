import express from 'express';
import cors from 'cors';
import { wireUpDependencies } from './dependencies'; // We'll create this next
import { PrismaClient } from '@prisma/client';
import { PrismaRouteRepository } from '../../adapters/outbound/postgres/PrismaRouteRepository';
import { GetComparison } from '../../core/application/GetComparison';

// Create the express app
const app = express();
const port = process.env.PORT || 3001; // Default to 3001 if no .env port

// --- Middlewares ---

// Enable Cross-Origin Resource Sharing (CORS)
// This is essential for your frontend to talk to your backend
app.use(cors());

// Enable parsing of JSON request bodies
app.use(express.json());

// Simple request logger to trace routing
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// --- Dependency Wiring ---

// Call our function to set up all routes and dependencies
wireUpDependencies(app);

// --- Health Check Route ---
// A simple route to check if the server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// --- Direct comparison endpoint (safety net) ---
app.get('/api/routes/comparison', async (req, res) => {
  try {
    console.log('[Route] GET /api/routes/comparison');
    const prisma = new PrismaClient();
    const routeRepo = new PrismaRouteRepository(prisma);
    const useCase = new GetComparison(routeRepo);
    const data = await useCase.execute();
    await prisma.$disconnect();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in direct comparison endpoint:', error);
    res.status(500).json({ message: 'Error fetching comparison data' });
  }
});

// Simple ping to test routing specifically
app.get('/api/routes/comparison/ping', (req, res) => {
  console.log('[Route] GET /api/routes/comparison/ping');
  res.status(200).json({ ok: true });
});

// Introspect registered routes
app.get('/api/__routes', (req, res) => {
  const routes: { method: string; path: string }[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stack = (app as any)._router?.stack || [];
  for (const layer of stack) {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods)
        .filter((m) => layer.route.methods[m])
        .map((m) => m.toUpperCase());
      for (const m of methods) {
        routes.push({ method: m, path: layer.route.path });
      }
    }
  }
  res.json(routes);
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`[Server]: Running on http://localhost:${port}`);
});