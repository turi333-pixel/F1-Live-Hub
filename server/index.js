import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import apiRoutes from './routes.js';
import { startScheduler } from './scheduler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// In production, serve the Vite build output
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start scheduled data refresh
startScheduler();

app.listen(port, () => {
  console.log(`\n🏎️  F1 Live Hub running on port ${port}`);
  console.log(`   Health: http://localhost:${port}/api/health\n`);
});
