import { createApp } from './app';

const DEFAULT_PORT = 3000;

function parsePort(value: string | undefined): number {
  if (value === undefined) {
    return DEFAULT_PORT;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('PORT must be a positive integer');
  }

  return parsed;
}

const port = parsePort(process.env.PORT);
const app = createApp();

app.listen(port, () => {
  console.log(`Sudoku API server running on http://localhost:${port}`);
});
