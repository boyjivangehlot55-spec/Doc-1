import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { analyzeContract, chatAboutContract } from './src/api/serverLogic';

function apiPlugin(): Plugin {
  return {
    name: 'clauseclear-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/analyze' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const { text, title } = body;
            if (!text) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Text is required for analysis' }));
              return;
            }
            const result = await analyzeContract(text, title);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            console.error('Vite middleware /api/analyze error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Analysis failed' }));
          }
          return;
        }

        if (req.url === '/api/chat' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const { contractText, messages, question } = body;
            if (!contractText || !question) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'contractText and question are required' }));
              return;
            }
            const result = await chatAboutContract(contractText, messages, question);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            console.error('Vite middleware /api/chat error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Chat failed' }));
          }
          return;
        }

        next();
      });
    },
  };
}

function parseBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
