#!/usr/bin/env node
// Auditor do contexto fixo: o que entra em toda sessão antes do primeiro "oi".
// Uso: node auditar.mjs [pasta-do-projeto]

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const projeto = path.resolve(process.argv[2] || process.cwd());
const CLAUDE = path.join(os.homedir(), '.claude');
const tok = (chars) => Math.round(chars / 3.5);
const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const ler = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };

const itens = []; // { grupo, nome, tokens, dica }
const add = (grupo, nome, texto, dica) => texto != null && itens.push({ grupo, nome, tokens: tok(texto.length), dica });

// CLAUDE.md: global, e da pasta do projeto pra cima
add('CLAUDE.md', '~/.claude/CLAUDE.md', ler(path.join(CLAUDE, 'CLAUDE.md')));
for (let d = projeto; ; d = path.dirname(d)) {
  for (const n of ['CLAUDE.md', 'CLAUDE.local.md', path.join('.claude', 'CLAUDE.md')]) {
    if (path.join(d, n) !== path.join(CLAUDE, 'CLAUDE.md')) add('CLAUDE.md', path.join(d, n), ler(path.join(d, n)));
  }
  if (path.dirname(d) === d) break;
}

// Memória automática do projeto (só as primeiras ~200 linhas do MEMORY.md entram)
const slugProj = projeto.replace(/[^A-Za-z0-9]/g, '-');
const memoria = ler(path.join(CLAUDE, 'projects', slugProj, 'memory', 'MEMORY.md'));
if (memoria != null) add('Memory', 'MEMORY.md', memoria.split('\n').slice(0, 200).join('\n'));

// Skills: só nome + descrição entram no contexto
function descricoesSkills(raiz, grupo) {
  const achar = function* (dir, prof = 0) {
    if (prof > 6) return;
    let es = []; try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of es) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) yield* achar(p, prof + 1);
      else if (e.name === 'SKILL.md') yield p;
    }
  };
  let n = 0, chars = 0;
  for (const p of achar(raiz)) {
    const fm = (ler(p) || '').match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
    const desc = fm.match(/^description:\s*([\s\S]*?)(?=\n\w+:|$)/m)?.[1] || '';
    n++; chars += desc.length + 40;
  }
  if (n) itens.push({ grupo: 'Skills', nome: `${grupo} (${n} skills)`, tokens: tok(chars) });
}
descricoesSkills(path.join(CLAUDE, 'skills'), '~/.claude/skills');
if (path.join(projeto, '.claude') !== CLAUDE) descricoesSkills(path.join(projeto, '.claude', 'skills'), 'project skills');
descricoesSkills(path.join(CLAUDE, 'plugins', 'cache'), 'installed plugins');

// MCP configurados
let mcps = [];
try {
  const cj = JSON.parse(ler(path.join(os.homedir(), '.claude.json')) || '{}');
  mcps.push(...Object.keys(cj.mcpServers || {}));
  const chaveProj = Object.keys(cj.projects || {}).find((k) => path.resolve(k) === projeto);
  if (chaveProj) mcps.push(...Object.keys(cj.projects[chaveProj].mcpServers || {}));
} catch {}
try { mcps.push(...Object.keys(JSON.parse(ler(path.join(projeto, '.mcp.json')) || '{}').mcpServers || {})); } catch {}

// Contexto real da 1ª chamada nas últimas sessões deste projeto
function contextoInicialReal() {
  const dir = path.join(CLAUDE, 'projects', slugProj);
  let arqs = [];
  try { arqs = fs.readdirSync(dir).filter((f) => f.endsWith('.jsonl')).map((f) => path.join(dir, f)); } catch { return null; }
  arqs = arqs.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs).slice(0, 10);
  const vals = [];
  for (const a of arqs) {
    for (const l of (ler(a) || '').split('\n')) {
      if (!l.includes('"usage"')) continue;
      try {
        const u = JSON.parse(l).message?.usage;
        if (u) { vals.push((u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0)); break; }
      } catch {}
    }
  }
  return vals.length ? vals.sort((a, b) => a - b)[vals.length >> 1] : null;
}

const real = contextoInicialReal();
const somado = itens.reduce((s, i) => s + i.tokens, 0);

console.log(`\n=== FIXED CONTEXT AUDIT — ${projeto} ===\n`);
let grupo = '';
for (const i of itens) {
  if (i.grupo !== grupo) { grupo = i.grupo; console.log(`${grupo}:`); }
  console.log(`  ${fmt(i.tokens).padStart(6)}  ${i.nome}`);
}
console.log(`MCP servers configured here: ${mcps.length ? mcps.join(', ') : 'none'} (+ claude.ai connectors, if enabled)`);
console.log(`\nTotal above: ~${fmt(somado)} tokens`);
if (real) {
  console.log(`Actual context on the first call (recent-session median): ${fmt(real)} tokens`);
  console.log(`Remainder (system prompt + tool/MCP/connector definitions): ~${fmt(Math.max(0, real - somado))} tokens`);
}

console.log('\nSuggestions:');
const sug = [];
const claudeMd = itens.filter((i) => i.grupo === 'CLAUDE.md');
for (const c of claudeMd) if (c.tokens > 2500) sug.push(`${c.nome} has ${fmt(c.tokens)} tokens. Keep only rules that always apply; move details into Rubi nodes and retrieve them when needed.`);
if (memoria && memoria.split('\n').length > 150) sug.push('MEMORY.md exceeds 150 lines; only the first 200 are loaded. Merge or remove old entries.');
const skills = itens.filter((i) => i.grupo === 'Skills').reduce((s, i) => s + i.tokens, 0);
if (skills > 3000) sug.push(`Skill descriptions total ~${fmt(skills)} tokens. Uninstall unused plugins/skills (/plugin) or shorten their descriptions.`);
if (real && real - somado > 25000) sug.push(`Tools and the system prompt use ~${fmt(real - somado)} tokens. Disable claude.ai connectors and MCP servers this project does not use (/mcp).`);
if (!sug.length) sug.push('Nothing stands out. The fixed context is lean.');
for (const s of sug) console.log(`  - ${s}`);
console.log(`\nEvery 10k tokens removed here stops being reread in every message of every session.`);
