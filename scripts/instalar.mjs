#!/usr/bin/env node
// Configura o rubi na máquina:
//   1. escolhe a pasta do vault (~/.rubi/config.json)
//   2. liga a compactação automática cedo no ~/.claude/settings.json (com backup)
// Uso: node instalar.mjs [--vault <pasta>] [--janela 150000] [--sim]
//      node instalar.mjs --desfazer   (tira a compactação cedo do settings.json)

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline/promises';
import { lerConfig, salvarConfig, ARQ_CONFIG } from './lib/config.mjs';

const args = process.argv.slice(2);
const valor = (nome) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : undefined; };
const SETTINGS = path.join(os.homedir(), '.claude', 'settings.json');
const CHAVE = 'CLAUDE_CODE_AUTO_COMPACT_WINDOW';

function lerSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS, 'utf8')); } catch (e) {
    if (e.code === 'ENOENT') return {};
    throw new Error(`Could not read ${SETTINGS}: ${e.message}. Fix the JSON and run the command again.`);
  }
}

function gravarSettings(s) {
  fs.mkdirSync(path.dirname(SETTINGS), { recursive: true });
  if (fs.existsSync(SETTINGS)) fs.copyFileSync(SETTINGS, `${SETTINGS}.bak-rubi`);
  fs.writeFileSync(SETTINGS, JSON.stringify(s, null, 2) + '\n');
}

if (args.includes('--desfazer')) {
  const s = lerSettings();
  if (s.env?.[CHAVE]) { delete s.env[CHAVE]; gravarSettings(s); console.log(`Removed ${CHAVE} from ${SETTINGS}.`); }
  else console.log('Nothing to undo.');
  process.exit(0);
}

const atual = lerConfig();
let vault = valor('--vault');
let janela = Number(valor('--janela')) || 0;

if (!args.includes('--sim') && process.stdin.isTTY) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  vault ||= (await rl.question(`Vault directory [${atual.vault}]: `)).trim() || atual.vault;
  janela ||= Number((await rl.question('Compact conversations at how many tokens? (100000 to 1000000) [150000]: ')).trim()) || 150000;
  rl.close();
}
vault = path.resolve(vault || atual.vault);
janela = Math.min(1e6, Math.max(1e5, janela || 150000));

fs.mkdirSync(vault, { recursive: true });
const leiame = path.join(vault, 'README.md');
if (!fs.existsSync(leiame)) {
  fs.writeFileSync(leiame, `# Rubi vault

One directory per project:

- \`notas/\` durable knowledge (decisions, maps, and gotchas). Edit these files whenever you want.
- \`handoffs/\` where work stopped, written before compaction or moving to a new window.
- \`sessoes/\` automatic records of compacted conversation sections.
- \`_indice.md\` generated index with links to everything.

Open this directory as an Obsidian vault to browse the links.
`);
}
salvarConfig({ vault, janela });

const s = lerSettings();
s.env = { ...(s.env || {}), [CHAVE]: String(janela) };
gravarSettings(s);

console.log(`
Rubi configured.
  Vault:        ${vault}
  Config:       ${ARQ_CONFIG}
  Compaction:   ${janela} tokens (${CHAVE} in ${SETTINGS}; backup in settings.json.bak-rubi)

Now install the plugin in Claude Code:
  /plugin marketplace add YURIBEDRAN/rubi
  /plugin install rubi@rubi

This applies to new sessions. To disable early compaction: node scripts/instalar.mjs --desfazer
`);
