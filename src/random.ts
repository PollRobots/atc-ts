// Derived from https://github.com/openbsd/src/blob/master/lib/libc/stdlib/rand.c

const state = {
  next: 1,
};

export const RAND_MAX = 0x7fff_ffff;

export function random(): number {
  state.next = (Math.imul(state.next, 1103515245) + 12345) & RAND_MAX;
  return state.next;
}

export function srandom(seed: number) {
  state.next = (seed | 0) & RAND_MAX;
}
