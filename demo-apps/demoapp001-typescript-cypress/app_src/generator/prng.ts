/**
 * Pseudo-Random Number Generator (PRNG) using the Mulberry32 algorithm.
 * Provides 100% deterministic pseudo-random sequences given an integer or string seed.
 */
export class Mulberry32 {
  private state: number;

  constructor(seed: number | string = 12345) {
    this.state = typeof seed === 'string' ? Mulberry32.hashString(seed) : seed >>> 0;
  }

  /**
   * Hashes a string into a 32-bit unsigned integer using FNV-1a.
   */
  public static hashString(str: string): number {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  /**
   * Returns a pseudo-random floating point number in [0, 1).
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a pseudo-random integer in [min, max] (inclusive).
   */
  public nextInt(min: number, max: number): number {
    if (min > max) {
      throw new Error(`min (${min}) cannot be greater than max (${max})`);
    }
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns a new array with elements shuffled using Fisher-Yates shuffle.
   */
  public shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
