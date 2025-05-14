type BucketIndex = 0 | 1 | 2;

export class CyclicExpiryQueue<T> {
	/**
	* We keep three rotating buckets. Each bucket holds the items that will expire
	* when its index becomes `next_cleanup_index` (NCI) during `tick()`.
	*
	*       ┌──────────┐       ┌──────────┐       ┌──────────┐
	*       │  bucket0 │       │  bucket1 │       │  bucket2 │
	*       └──────────┘       └──────────┘       └──────────┘
	*            ▲                   ▲                  ▲
	*            │                   │                  │
	*           NCI            (NCI + 1) % 3      (NCI + 2) % 3
	*/
	private readonly buckets: [Set<T>, Set<T>, Set<T>] = [new Set(), new Set(), new Set()];

	private next_cleanup_index: BucketIndex = 0;
	private readonly interval_ms: number;
	private readonly timer: NodeJS.Timeout;
	private last_timer_start_time: number;
	private readonly tolerance_ms: number;

	/**
	* @param minimal_life_time_ms  The minimum time (ms) an item will remain in
	*                              the queue before it *could* be removed. An
	*                              element’s actual lifetime falls somewhere
	*                              between `minimal_life_time_ms` and
	*                              `2 × minimal_life_time_ms + tolerance_ms`.
	* @param tolerance_ms          Optional grace window (ms) that compensates
	*                              for event‑loop drift. If the timer fires
	*                              after `minimal_life_time_ms + tolerance_ms`
	*                              since the previous tick, the queue throws
	*                              because its timing guarantee is no
	*                              longer reliable. Default is
	*                              `minimal_life_time_ms / 10` (10%).
	*
	* The constructor starts an internal `setInterval` that handles cleanup. It
	* runs for the lifetime of the instance.
	*/
	constructor(minimal_life_time_ms: number, tolerance_ms: number = minimal_life_time_ms / 10) {
		this.interval_ms = minimal_life_time_ms;
		this.tolerance_ms = Math.max(0, tolerance_ms);
		this.last_timer_start_time = Date.now();
		this.timer = setInterval(() => this.tick(), minimal_life_time_ms);
	}

	/**
	* Called by the internal interval. Clears the current bucket and advances the
	* cleanup cursor.
	*/
	private tick(): void {
		const now = Date.now();

		// TODO: Having "throw" here will just be catched by bun's HTTP, but in this case it should crash the server.
		// Better yet, we can find a way to recuperate from these two problematic state while preserving security.

		// Guard against the timer firing much later than expected (e.g. event‑loop congestion).
		if (now > this.last_timer_start_time + this.interval_ms + this.tolerance_ms) {
			throw new Error("Timer drift exceeded tolerance");
		}
		// Guard against the timer firing too early (should never happen with setInterval, but keep for sanity).
		if (now < this.last_timer_start_time + this.interval_ms) {
			throw new Error("Timer fired prematurely");
		}

		this.last_timer_start_time = now;

		this.buckets[this.next_cleanup_index].clear();

		this.next_cleanup_index = (this.next_cleanup_index + 1) % 3 as BucketIndex;
	}

	/**
	* Inserts `item` into the queue, guaranteeing uniqueness.
	*
	* If the item is already present (in any bucket) we move it to the newest
	* bucket so it gets the full lifetime again.
	*/
	add(item: T): void {
		// Ensure uniqueness.
		this.consume(item);

		const cleanup_id = (this.next_cleanup_index + 2) % 3 as BucketIndex;
		this.buckets[cleanup_id].add(item);
	}

	/** Checks whether `item` is present in any bucket. */
	has(item: T): boolean {
		return this.buckets[0].has(item) || this.buckets[1].has(item) || this.buckets[2].has(item);
	}

	/**
	* Attempts to remove `item` from the queue.
	* @returns `true` if the item was found and removed, `false` otherwise.
	*/
	consume(item: T): boolean {
		for (const bucket of this.buckets) {
			if (bucket.delete(item)) {
				return true;
			}
		}
		return false;
	}
}
