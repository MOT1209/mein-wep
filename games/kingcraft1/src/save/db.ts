export interface SaveBackend {
  readonly persistent: boolean;
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export class MemoryBackend implements SaveBackend {
  readonly persistent = false;
  private readonly data = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }

  async put(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }
}

const DB_NAME = "blockworld";
const STORE = "saves";

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

export class IndexedDbBackend implements SaveBackend {
  readonly persistent = true;

  private constructor(private readonly db: IDBDatabase) {}

  static open(factory: IDBFactory): Promise<IndexedDbBackend> {
    return new Promise((resolve, reject) => {
      const request = factory.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
      };
      request.onsuccess = () => resolve(new IndexedDbBackend(request.result));
      request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
      request.onblocked = () => reject(new Error("IndexedDB open blocked"));
    });
  }

  async get(key: string): Promise<string | null> {
    const value = await promisify(this.db.transaction(STORE, "readonly").objectStore(STORE).get(key));
    return typeof value === "string" ? value : null;
  }

  async put(key: string, value: string): Promise<void> {
    await promisify(this.db.transaction(STORE, "readwrite").objectStore(STORE).put(value, key));
  }

  async delete(key: string): Promise<void> {
    await promisify(this.db.transaction(STORE, "readwrite").objectStore(STORE).delete(key));
  }
}

export async function openBackend(factory: IDBFactory | undefined): Promise<SaveBackend> {
  if (!factory) return new MemoryBackend();
  try {
    return await IndexedDbBackend.open(factory);
  } catch {
    return new MemoryBackend();
  }
}
