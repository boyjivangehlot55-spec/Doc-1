import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeContract, chatAboutContract } from './src/api/serverLogic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

app.post('/api/analyze', async (req, res) => {
  try {
    const { text, title } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text content is required' });
    }
    const result = await analyzeContract(text, title);
    res.json(result);
  } catch (err: any) {
    console.error('API /api/analyze error:', err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { contractText, messages, question } = req.body;
    if (!contractText || !question) {
      return res.status(400).json({ error: 'Contract text and question are required' });
    }
    const result = await chatAboutContract(contractText, messages, question);
    res.json(result);
  } catch (err: any) {
    console.error('API /api/chat error:', err);
    res.status(500).json({ error: err.message || 'Chat failed' });
  }
});

// Serve frontend dist files if built
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ClauseClear server listening on port ${PORT}`);
});
