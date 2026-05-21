/**
 * @module Storage
 */
import { Event, Operation } from "./storage.meta.js";

import type { Storage } from "./storage.js";

export class Repository<T extends { id: string }> {
  private _storage: Storage;
  private _table: string;

  constructor(storage: Storage, table: string) {
    this._storage = storage;
    this._table = table;
  }

  /**
   * Add a new item to the repository. The item must have a unique `id` property.
   * If an item with the same `id` already exists, the operation will fail.
   * @param item The item to add.
   * @returns A promise that resolves to the key of the added item.
   * @category Operations
   */
  public add = async (item: T): Promise<IDBValidKey> => {
    this._dispatchEvent(Event.BEFORE_ADD, {
      detail: { table: this._table, id: item.id }
    });

    try {
      const result = await this._request<IDBValidKey>("readwrite", (store) =>
        store.add(item)
      );

      this._dispatchEvent(Event.AFTER_ADD, {
        detail: { table: this._table, id: item.id }
      });

      return result;
    } catch (error) {
      this._dispatchEvent(Event.ON_ERROR, {
        detail: {
          operation: Operation.ADD,
          table: this._table,
          id: item.id,
          error
        }
      });

      throw error;
    }
  };

  /**
   * Retrieve all items from the repository.
   * @returns A promise that resolves to an array of items.
   * @category Operations
   */
  public retrieve = async (): Promise<T[]> => {
    this._dispatchEvent(Event.BEFORE_RETRIEVE, {
      detail: { table: this._table }
    });

    try {
      const items = await this._request<T[]>("readonly", (store) =>
        store.getAll()
      );

      this._dispatchEvent(Event.AFTER_RETRIEVE, {
        detail: { table: this._table }
      });

      return items;
    } catch (error) {
      this._dispatchEvent(Event.ON_ERROR, {
        detail: {
          operation: Operation.RETRIEVE,
          table: this._table,
          error
        }
      });

      throw error;
    }
  };

  /**
   * Retrieve a single item from the repository by its `id`.
   * @param id The `id` of the item to retrieve.
   * @returns A promise that resolves to the item if found, otherwise `undefined`.
   * @category Operations
   */
  public getById = async (id: string): Promise<T | undefined> => {
    this._dispatchEvent(Event.BEFORE_RETRIEVE, {
      detail: { table: this._table, id }
    });

    try {
      const item = await this._request<T | undefined>("readonly", (store) =>
        store.get(id)
      );

      this._dispatchEvent(Event.AFTER_RETRIEVE, {
        detail: { table: this._table, id }
      });

      return item;
    } catch (error) {
      this._dispatchEvent(Event.ON_ERROR, {
        detail: {
          operation: Operation.RETRIEVE,
          table: this._table,
          id,
          error
        }
      });

      throw error;
    }
  };

  /**
   * Check if an item exists in the repository by its `id`.
   * @param id The `id` of the item to check.
   * @returns A promise that resolves to `true` if the item exists, otherwise `false`.
   * @category Operations
   */
  public exists = async (id: string): Promise<boolean> => {
    this._dispatchEvent(Event.BEFORE_RETRIEVE, {
      detail: { table: this._table, id }
    });

    try {
      const key = await this._request<IDBValidKey | undefined>(
        "readonly",
        (store) => store.getKey(id)
      );

      this._dispatchEvent(Event.AFTER_RETRIEVE, {
        detail: { table: this._table, id }
      });

      return key !== undefined;
    } catch (error) {
      this._dispatchEvent(Event.ON_ERROR, {
        detail: {
          operation: Operation.RETRIEVE,
          table: this._table,
          id,
          error
        }
      });

      throw error;
    }
  };

  /**
   * Update an existing item in the repository. The item must have a valid `id` property.
   * If the item does not exist, the operation will fail.
   * @param item The item to update.
   * @returns A promise that resolves to the key of the updated item.
   * @category Operations
   */
  public update = async (item: T): Promise<IDBValidKey> => {
    this._dispatchEvent(Event.BEFORE_UPDATE, {
      detail: { table: this._table, id: item.id }
    });

    try {
      const result = await this._request<IDBValidKey>("readwrite", (store) =>
        store.put(item)
      );

      this._dispatchEvent(Event.AFTER_UPDATE, {
        detail: { table: this._table, id: item.id }
      });

      return result;
    } catch (error) {
      this._dispatchEvent(Event.ON_ERROR, {
        detail: {
          operation: Operation.UPDATE,
          table: this._table,
          id: item.id,
          error
        }
      });

      throw error;
    }
  };

  /**
   * Remove an item from the repository by its `id`.
   * @param id The `id` of the item to remove.
   * @returns A promise that resolves when the item is removed.
   * @category Operations
   */
  public remove = async (id: string): Promise<void> => {
    this._dispatchEvent(Event.BEFORE_REMOVE, {
      detail: { table: this._table, id }
    });

    try {
      await this._request<undefined>("readwrite", (store) => store.delete(id));

      this._dispatchEvent(Event.AFTER_REMOVE, {
        detail: { table: this._table, id }
      });
    } catch (error) {
      this._dispatchEvent(Event.ON_ERROR, {
        detail: {
          operation: Operation.REMOVE,
          table: this._table,
          id,
          error
        }
      });

      throw error;
    }
  };

  /**
   * Remove all items from the repository.
   * @returns A promise that resolves when all items are removed.
   * @category Operations
   */
  public clear = async (): Promise<void> => {
    this._dispatchEvent(Event.BEFORE_REMOVE, {
      detail: { table: this._table }
    });

    try {
      await this._request<undefined>("readwrite", (store) => store.clear());

      this._dispatchEvent(Event.AFTER_REMOVE, {
        detail: { table: this._table }
      });
    } catch (error) {
      this._dispatchEvent(Event.ON_ERROR, {
        detail: {
          operation: Operation.REMOVE,
          table: this._table,
          error
        }
      });

      throw error;
    }
  };

  /**
   * Synchronize the repository with the provided data.
   * @param data The data to synchronize with the repository.
   * @returns A promise that resolves when the synchronization is complete.
   * @category Operations
   */
  public synchronize = async (data: T[]): Promise<void> => {
    const items = await this.retrieve();

    const existingIds = new Set(items.map((item) => item.id));
    const requiredIds = new Set(data.map((item) => item.id));

    await this._upsert(data, existingIds);
    await this._remove(items, requiredIds);
  };

  private _upsert = async (
    data: T[],
    existingIds: Set<string>
  ): Promise<void> => {
    await Promise.all(
      data.map((item) =>
        existingIds.has(item.id) ? this.update(item) : this.add(item)
      )
    );
  };

  private _remove = async (
    items: T[],
    requiredIds: Set<string>
  ): Promise<void> => {
    await Promise.all(
      items
        .filter((item) => !requiredIds.has(item.id))
        .map((item) => this.remove(item.id))
    );
  };

  private _request = async <R>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<R>
  ): Promise<R> => {
    const database = this._storage.database;

    if (!database) {
      throw new Error("Database is not open");
    }

    return new Promise<R>((resolve, reject) => {
      const transaction = database.transaction(this._table, mode);
      const request = operation(transaction.objectStore(this._table));

      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () =>
        reject(
          transaction.error ?? request.error ?? new Error("Transaction failed")
        );
      transaction.onabort = () =>
        reject(
          transaction.error ??
            request.error ??
            new Error("Transaction was aborted")
        );
    });
  };

  private _dispatchEvent = (event: Event, message: any) =>
    this._storage.dispatchEvent(new CustomEvent(event, message));
}
