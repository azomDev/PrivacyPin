class ServerStore {
    private temp_nonce_rec: Record<string, string> = {};

    set(key: string, value: string): void {
        this.temp_nonce_rec[key] = value;
    }

    get(key: string): string {
        return this.temp_nonce_rec[key];
    }
}

export default new ServerStore();
