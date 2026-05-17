import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config.js';

function write(line) {
  fs.mkdirSync(path.dirname(CONFIG.LOG_FILE), { recursive: true });
  fs.appendFileSync(CONFIG.LOG_FILE, `${line}\n`);
}

export const log = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  write(line);
};

export const logError = (msg, err) => {
  const line = `[ERROR] ${msg}: ${err?.message || err}`;
  console.error(line);
  write(line);
};
