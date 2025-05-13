export class CyclicExpiryQueue<T> {
	private readonly queue = new Map<T, number>(); // Objects must be unique
	private next_cleanup_index = 0;
	private interval_ms: number;
	private timer: NodeJS.Timeout;
	private last_timer_start_time: number;
	private idk: number; // TODO: rename

	// maximal life time is 2x minimal_life_time_ms
	constructor(minimal_life_time_ms: number) {
		this.interval_ms = minimal_life_time_ms;
		this.last_timer_start_time = Date.now();
		// TODO: write comment
		this.idk = minimal_life_time_ms / 10; // TODO: mabye option to not have idk at all
		this.timer = setInterval(() => this.tick(), minimal_life_time_ms);
	}

	private tick() {
		const now = Date.now();
		// TODO: write comment
		if (now > this.last_timer_start_time + this.interval_ms + this.idk) {
			throw "todo?"
		}
		// TODO: write comment
		if (now < this.last_timer_start_time + this.interval_ms) {
			throw "todo?"
		}
		this.last_timer_start_time = now;
		for (const [obj, cleanup_id] of this.queue) { // TODO: Make this more optimal by having 3 buckets, but we still want them to be indexed
			if (cleanup_id === this.next_cleanup_index) {
				this.queue.delete(obj);
			}
		}
		this.next_cleanup_index = (this.next_cleanup_index + 1) % 3;
	}

	add(item: T): void {
		const cleanup_id = (this.next_cleanup_index + 2) % 3;
		this.queue.set(item, cleanup_id)
	}

	has(item: T): boolean {
		return this.queue.has(item);
	}

	// returns true if item was consumed, false otherwise
	consume(item: T): boolean {
		return this.queue.delete(item);
	}
}
