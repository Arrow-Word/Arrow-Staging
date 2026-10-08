// cloud-storage.js — v19.2
// Puzzle storage via Supabase — no tokens needed, works on any device

const SUPABASE_URL  = 'https://bfpoiewwvtdczkmoqlye.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmcG9pZXd3dnRkY3prbW9xbHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODAxMTUsImV4cCI6MjA5MzQ1NjExNX0.EoIz2o7xg69tfAnSOp5wVusjc71s0cOmsEoSDwaxjso';
const SB_PUZZLES    = SUPABASE_URL + '/rest/v1/puzzles';
const SB_HEADERS    = { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

async function _sbGet(url) {
  const res = await fetch(url, { headers: SB_HEADERS });
  if (!res.ok) throw new Error('Supabase read error ' + res.status);
  return res.json();
}

async function _sbPut(id, row) {
  throw new Error('Test site only: changes cannot be saved to the live puzzle database.');
}

// Fast index — titles/sizes only
async function cloudGetIndex() {
  const data = await _sbGet(SB_PUZZLES + '?select=id,title,published_at,published_at_ms,rows,cols&order=published_at_ms.desc');
  return (data || []).map(p => ({
    id: p.id, title: p.title, publishedAt: p.published_at,
    publishedAtMs: p.published_at_ms, rows: p.rows, cols: p.cols
  }));
}

// Single puzzle with full data
async function cloudGetPuzzle(id) {
  const data = await _sbGet(SB_PUZZLES + '?id=eq.' + encodeURIComponent(id) + '&select=*');
  if (!data || !data.length) return null;
  const p = data[0];
  return { id: p.id, title: p.title, publishedAt: p.published_at, publishedAtMs: p.published_at_ms, rows: p.rows, cols: p.cols, data: p.data, answer_cell_count: p.answer_cell_count };
}

// All puzzles with full data
async function cloudGetPuzzles() {
  const data = await _sbGet(SB_PUZZLES + '?select=*&order=published_at_ms.desc');
  return (data || []).map(p => ({ id: p.id, title: p.title, publishedAt: p.published_at, publishedAtMs: p.published_at_ms, rows: p.rows, cols: p.cols, data: p.data, answer_cell_count: p.answer_cell_count }));
}

async function cloudPublishPuzzle(title, data) {
  throw new Error('Test site only: publishing is disabled. The live puzzle database was not changed.');
}

async function cloudRemovePuzzle(id) {
  throw new Error('Test site only: deleting puzzles is disabled. The live puzzle database was not changed.');
}

async function cloudSavePuzzles(list) {
  throw new Error('Test site only: database changes are disabled. The live puzzle database was not changed.');
}
