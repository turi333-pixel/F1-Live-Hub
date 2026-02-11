import express from 'express';
import cors from 'cors';
import apiRoutes from './routes.js';
import { startScheduler } from './scheduler.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// Start scheduled data refresh
startScheduler();

app.listen(port, () => {
  console.log(`\n🏎️  F1 Live Hub Backend running at http://localhost:${port}`);
  console.log(`   Health: http://localhost:${port}/api/health\n`);
});
