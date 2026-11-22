[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/oy-builds/tiny-stack-vm-01/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/oy-builds/tiny-stack-vm-01/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

# Tiny Stack VM

An interpreter for make.fun's tiny stack ISA (v1), written for the
**tiny-stack-vm-01-run-20261122** bounty. One TypeScript file, Node
standard library only. For every id in the input directory it runs
`program.bin` over `input.bin` and writes the program's exact output
bytes to `stdout.bin` and its exit code (halt, EXIT, or trap) to
`exit.txt`:

```
MAKEFUN_INPUT_DIR=<input> MAKEFUN_OUTPUT_DIR=<output> node main.ts
```

Byte-exact on the kit's 40 practice instances, plus a hand-built
edge suite over every trap code and the ISA's usual gotchas.
