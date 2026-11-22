// Tiny stack VM: an interpreter for make.fun's tiny stack ISA v1
// (bounty tiny-stack-vm-01-run-20261122).
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const DST = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// HALT, EXIT and traps end a run by throwing their exit code.
function run(prog: Buffer, inp: Buffer): { bytes: Buffer; code: number } {
  const st = new Int32Array(256);  // data stack (cap 256)
  const mem = new Int32Array(256); // memory, zeroed
  const cs = new Int32Array(64);   // call stack (cap 64)
  const out = Buffer.alloc(65536);
  const plen = prog.length;
  let sp = 0, rp = 0, pc = 0, steps = 0, rd = 0, len = 0;
  try {
    for (;;) {
      // Step order: step cap, pc range, opcode, immediate fit,
      // then needs, the instruction's own traps, its effect.
      if (++steps > 1000000) throw 10;
      if (pc < 0 || pc >= plen) throw 9;
      const op = prog[pc];
      if ((op >= 0x10 && op <= 0x1e) || (op >= 0x20 && op <= 0x22)) {
        // Arithmetic/comparisons: NEG/NOT unary, the rest binary.
        if (op === 0x17 || op === 0x1b) {
          if (sp < 1) throw 2;
          st[sp - 1] = op === 0x17 ? -st[sp - 1] : ~st[sp - 1];
          pc++; continue;
        }
        if (sp < 2) throw 2;
        const a = st[sp - 2], b = st[sp - 1];
        let r: number;
        switch (op) {
          case 0x10: r = (a + b) | 0; break;
          case 0x11: r = (a - b) | 0; break;
          case 0x12: r = Math.imul(a, b); break;
          case 0x13: if (b === 0) throw 4; r = Math.trunc(a / b) | 0; break;
          case 0x14: if (b === 0) throw 4; r = a % b; break; // sign of a
          case 0x15: if (b === 0) throw 4; r = Math.trunc((a >>> 0) / (b >>> 0)) | 0; break;
          case 0x16: if (b === 0) throw 4; r = ((a >>> 0) % (b >>> 0)) | 0; break;
          case 0x18: r = a & b; break;
          case 0x19: r = a | b; break;
          case 0x1a: r = a ^ b; break;
          case 0x1c: r = a << (b & 31); break;
          case 0x1d: r = a >> (b & 31); break;
          case 0x1e: r = (a >>> (b & 31)) | 0; break;
          case 0x20: r = a === b ? 1 : 0; break;
          case 0x21: r = a < b ? 1 : 0; break;
          default: r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        }
        st[sp - 2] = r; sp--; pc++; continue;
      }
      switch (op) {
        case 0x00: throw 0;
        case 0x01: { // PUSH8, sign-extended
          if (pc + 1 >= plen) throw 9;
          if (sp >= 256) throw 3;
          const b = prog[pc + 1];
          st[sp++] = b < 128 ? b : b - 256;
          pc += 2; break;
        }
        case 0x02: // PUSH32
          if (pc + 4 >= plen) throw 9;
          if (sp >= 256) throw 3;
          st[sp++] = prog[pc + 1] | (prog[pc + 2] << 8) | (prog[pc + 3] << 16) | (prog[pc + 4] << 24);
          pc += 5; break;
        case 0x03: if (sp < 1) throw 2; sp--; pc++; break;
        case 0x04: case 0x06: { // DUP / OVER
          const back = op === 0x04 ? 1 : 2;
          if (sp < back) throw 2;
          if (sp >= 256) throw 3;
          st[sp] = st[sp - back]; sp++; pc++; break;
        }
        case 0x05: {
          if (sp < 2) throw 2;
          const t = st[sp - 1]; st[sp - 1] = st[sp - 2]; st[sp - 2] = t; pc++; break;
        }
        case 0x07: { // ROT: ( a b c -- b c a )
          if (sp < 3) throw 2;
          const a = st[sp - 3];
          st[sp - 3] = st[sp - 2]; st[sp - 2] = st[sp - 1]; st[sp - 1] = a; pc++; break;
        }
        case 0x30: case 0x31: case 0x32: { // jumps
          if (pc + 2 >= plen) throw 9;
          let go = op === 0x30;
          if (!go) {
            if (sp < 1) throw 2;
            const v = st[--sp];
            go = op === 0x31 ? v === 0 : v !== 0;
          }
          let off = prog[pc + 1] | (prog[pc + 2] << 8);
          if (off >= 32768) off -= 65536;
          pc += 3 + (go ? off : 0); break;
        }
        case 0x33: // CALL, absolute
          if (pc + 2 >= plen) throw 9;
          if (rp >= 64) throw 7;
          cs[rp++] = pc + 3;
          pc = prog[pc + 1] | (prog[pc + 2] << 8); break;
        case 0x34: if (rp < 1) throw 8; pc = cs[--rp]; break;
        case 0x40: case 0x41: { // LOAD / STORE
          if (sp < (op === 0x40 ? 1 : 2)) throw 2;
          const addr = st[sp - 1];
          if (addr < 0 || addr > 255) throw 6;
          if (op === 0x40) { st[sp - 1] = mem[addr]; pc++; }
          else { mem[addr] = st[sp - 2]; sp -= 2; pc++; }
          break;
        }
        case 0x50: { // PRINT: all of it or none
          if (sp < 1) throw 2;
          const s = String(st[--sp]);
          if (len + s.length > 65536) throw 11;
          for (let i = 0; i < s.length; i++) out[len++] = s.charCodeAt(i);
          pc++; break;
        }
        case 0x51: // PUTC
          if (sp < 1) throw 2;
          if (len >= 65536) throw 11;
          out[len++] = st[--sp] & 255; pc++; break;
        case 0x52: // IN: -1 past the end
          if (sp >= 256) throw 3;
          st[sp++] = rd < inp.length ? inp[rd++] : -1; pc++; break;
        case 0x53: if (sp < 1) throw 2; throw st[--sp] & 255;
        default: throw 5;
      }
    }
  } catch (e) {
    if (typeof e !== 'number') throw e;
    return { bytes: out.subarray(0, len), code: e };
  }
}

for (const id of readdirSync(SRC).sort()) {
  const prog = readFileSync(join(SRC, id, 'program.bin'));
  let inp = Buffer.alloc(0);
  try { inp = readFileSync(join(SRC, id, 'input.bin')); } catch {}
  const { bytes, code } = run(prog, inp);
  mkdirSync(join(DST, id), { recursive: true });
  writeFileSync(join(DST, id, 'stdout.bin'), bytes);
  writeFileSync(join(DST, id, 'exit.txt'), code + '\n');
}
