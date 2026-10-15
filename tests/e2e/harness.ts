import assert from 'assert';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: Error;
}

export interface SuiteSummary {
  name: string;
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  tests: TestResult[];
}

export class TestHarness {
  private currentSuite = 'Default Suite';
  private suites: Map<string, Array<{ name: string; fn: () => Promise<void> | void }>> = new Map();
  private beforeAllHooks: Map<string, Array<() => Promise<void> | void>> = new Map();
  private afterAllHooks: Map<string, Array<() => Promise<void> | void>> = new Map();
  private beforeEachHooks: Map<string, Array<() => Promise<void> | void>> = new Map();
  private afterEachHooks: Map<string, Array<() => Promise<void> | void>> = new Map();

  describe(name: string, fn: () => void): void {
    const prevSuite = this.currentSuite;
    this.currentSuite = name;
    if (!this.suites.has(name)) {
      this.suites.set(name, []);
    }
    fn();
    this.currentSuite = prevSuite;
  }

  test(name: string, fn: () => Promise<void> | void): void {
    const list = this.suites.get(this.currentSuite) || [];
    list.push({ name, fn });
    this.suites.set(this.currentSuite, list);
  }

  it(name: string, fn: () => Promise<void> | void): void {
    this.test(name, fn);
  }

  beforeAll(fn: () => Promise<void> | void): void {
    const hooks = this.beforeAllHooks.get(this.currentSuite) || [];
    hooks.push(fn);
    this.beforeAllHooks.set(this.currentSuite, hooks);
  }

  afterAll(fn: () => Promise<void> | void): void {
    const hooks = this.afterAllHooks.get(this.currentSuite) || [];
    hooks.push(fn);
    this.afterAllHooks.set(this.currentSuite, hooks);
  }

  beforeEach(fn: () => Promise<void> | void): void {
    const hooks = this.beforeEachHooks.get(this.currentSuite) || [];
    hooks.push(fn);
    this.beforeEachHooks.set(this.currentSuite, hooks);
  }

  afterEach(fn: () => Promise<void> | void): void {
    const hooks = this.afterEachHooks.get(this.currentSuite) || [];
    hooks.push(fn);
    this.afterEachHooks.set(this.currentSuite, hooks);
  }

  async run(): Promise<{ summaries: SuiteSummary[]; allPassed: boolean; total: number; passed: number; failed: number; totalDurationMs: number }> {
    const summaries: SuiteSummary[] = [];
    const overallStart = Date.now();
    let totalCount = 0;
    let passedCount = 0;
    let failedCount = 0;

    for (const [suiteName, tests] of this.suites.entries()) {
      const suiteStart = Date.now();
      const testResults: TestResult[] = [];
      let suitePassed = 0;
      let suiteFailed = 0;

      // Run beforeAll
      const bAll = this.beforeAllHooks.get(suiteName) || [];
      for (const hook of bAll) {
        await hook();
      }

      for (const t of tests) {
        // Run beforeEach
        const bEach = this.beforeEachHooks.get(suiteName) || [];
        for (const hook of bEach) {
          await hook();
        }

        const tStart = Date.now();
        let passed = true;
        let testError: Error | undefined;

        try {
          await t.fn();
        } catch (err: any) {
          passed = false;
          testError = err instanceof Error ? err : new Error(String(err));
        }

        const tDuration = Date.now() - tStart;
        if (passed) {
          suitePassed++;
          passedCount++;
        } else {
          suiteFailed++;
          failedCount++;
        }
        totalCount++;

        testResults.push({
          suite: suiteName,
          name: t.name,
          passed,
          durationMs: tDuration,
          error: testError,
        });

        // Run afterEach
        const aEach = this.afterEachHooks.get(suiteName) || [];
        for (const hook of aEach) {
          await hook();
        }
      }

      // Run afterAll
      const aAll = this.afterAllHooks.get(suiteName) || [];
      for (const hook of aAll) {
        await hook();
      }

      summaries.push({
        name: suiteName,
        total: tests.length,
        passed: suitePassed,
        failed: suiteFailed,
        durationMs: Date.now() - suiteStart,
        tests: testResults,
      });
    }

    return {
      summaries,
      allPassed: failedCount === 0,
      total: totalCount,
      passed: passedCount,
      failed: failedCount,
      totalDurationMs: Date.now() - overallStart,
    };
  }
}

// Global default instance
export const harness = new TestHarness();
export const describe = harness.describe.bind(harness);
export const it = harness.it.bind(harness);
export const test = harness.test.bind(harness);
export const beforeAll = harness.beforeAll.bind(harness);
export const afterAll = harness.afterAll.bind(harness);
export const beforeEach = harness.beforeEach.bind(harness);
export const afterEach = harness.afterEach.bind(harness);

// Fluent Assertions
export function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      assert.strictEqual(actual, expected, `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    },
    toEqual(expected: any) {
      assert.deepStrictEqual(actual, expected, `Deep equality mismatch:\nActual: ${JSON.stringify(actual)}\nExpected: ${JSON.stringify(expected)}`);
    },
    toBeTruthy() {
      assert.ok(actual, `Expected value to be truthy, got ${actual}`);
    },
    toBeFalsy() {
      assert.ok(!actual, `Expected value to be falsy, got ${actual}`);
    },
    toBeNull() {
      assert.strictEqual(actual, null, `Expected null, got ${actual}`);
    },
    toBeDefined() {
      assert.notStrictEqual(actual, undefined, `Expected defined value, got undefined`);
    },
    toContain(expected: any) {
      if (typeof actual === 'string') {
        assert.ok(actual.includes(String(expected)), `Expected string "${actual}" to contain "${expected}"`);
      } else if (Array.isArray(actual)) {
        assert.ok(actual.includes(expected), `Expected array to contain item: ${JSON.stringify(expected)}`);
      } else {
        throw new Error(`toContain called on unsupported type: ${typeof actual}`);
      }
    },
    toBeGreaterThan(expected: number) {
      assert.ok(Number(actual) > expected, `Expected ${actual} > ${expected}`);
    },
    toBeGreaterThanOrEqual(expected: number) {
      assert.ok(Number(actual) >= expected, `Expected ${actual} >= ${expected}`);
    },
    toBeLessThan(expected: number) {
      assert.ok(Number(actual) < expected, `Expected ${actual} < ${expected}`);
    },
    toBeLessThanOrEqual(expected: number) {
      assert.ok(Number(actual) <= expected, `Expected ${actual} <= ${expected}`);
    },
    toMatch(regex: RegExp) {
      assert.ok(typeof actual === 'string' && regex.test(actual), `Expected "${actual}" to match regex ${regex}`);
    },
    toThrow(expectedPattern?: string | RegExp) {
      if (typeof actual !== 'function') {
        throw new Error('toThrow must be called on a function');
      }
      let thrown = false;
      let caughtError: any;
      try {
        (actual as any)();
      } catch (err) {
        thrown = true;
        caughtError = err;
      }
      assert.ok(thrown, 'Expected function to throw an error, but it succeeded');
      if (expectedPattern && caughtError) {
        const msg = caughtError.message || String(caughtError);
        if (typeof expectedPattern === 'string') {
          assert.ok(msg.includes(expectedPattern), `Expected error "${msg}" to contain "${expectedPattern}"`);
        } else {
          assert.ok(expectedPattern.test(msg), `Expected error "${msg}" to match ${expectedPattern}`);
        }
      }
    },
  };
}
