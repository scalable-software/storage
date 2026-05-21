/**
 * @module Storage
 */

import { Repository } from "./repository.js";
import { Activity, Status, Event, Operation } from "./storage.meta.js";

import type { Configuration } from "./storage.meta.js";

export class Storage extends EventTarget {
  /**
   * Internal database name.
   * @category State
   */
  private _name: string;

  /**
   * Internal database version.
   * @category State
   */
  private _version: number;

  /**
   * Internal database tables.
   * @category State
   */
  private _tables: string[];

  /**
   * Internal object-store key path.
   * @category State
   */
  private _keyPath: string;

  /**
   * Current database connection.
   * @category State
   */
  private _database: IDBDatabase | null = null;

  /**
   * Internal activity of the storage.
   * @category State
   * @default Activity.IDLE
   */
  private _activity: Activity = Activity.IDLE;

  /**
   * Internal status of the storage.
   * @category State
   * @default Status.UNKNOWN
   */
  private _status: Status = Status.UNKNOWN;

  /**
   * Event handler for the `beforecreate` event.
   * @category Events
   * @hidden
   */
  private _beforecreate: EventListener | null = null;

  /**
   * Event handler for the `aftercreate` event.
   * @category Events
   * @hidden
   */
  private _aftercreate: EventListener | null = null;

  /**
   * Event handler for the `beforeopen` event.
   * @category Events
   * @hidden
   */
  private _beforeopen: EventListener | null = null;

  /**
   * Event handler for the `afteropen` event.
   * @category Events
   * @hidden
   */
  private _afteropen: EventListener | null = null;

  /**
   * Event handler for the `beforedelete` event.
   * @category Events
   * @hidden
   */
  private _beforedelete: EventListener | null = null;

  /**
   * Event handler for the `afterdelete` event.
   * @category Events
   * @hidden
   */
  private _afterdelete: EventListener | null = null;

  /**
   * Event handler for the `beforeadd` event.
   * @category Events
   * @hidden
   */
  private _beforeadd: EventListener | null = null;

  /**
   * Event handler for the `afteradd` event.
   * @category Events
   * @hidden
   */
  private _afteradd: EventListener | null = null;

  /**
   * Event handler for the `beforeretrieve` event.
   * @category Events
   * @hidden
   */
  private _beforeretrieve: EventListener | null = null;

  /**
   * Event handler for the `afterretrieve` event.
   * @category Events
   * @hidden
   */
  private _afterretrieve: EventListener | null = null;

  /**
   * Event handler for the `beforeupdate` event.
   * @category Events
   * @hidden
   */
  private _beforeupdate: EventListener | null = null;

  /**
   * Event handler for the `afterupdate` event.
   * @category Events
   * @hidden
   */
  private _afterupdate: EventListener | null = null;

  /**
   * Event handler for the `beforeremove` event.
   * @category Events
   * @hidden
   */
  private _beforeremove: EventListener | null = null;

  /**
   * Event handler for the `afterremove` event.
   * @category Events
   * @hidden
   */
  private _afterremove: EventListener | null = null;

  /**
   * Event handler for the `error` event.
   * @category Events
   * @hidden
   */
  private _onerror: EventListener | null = null;

  constructor(configuration: Configuration) {
    super();
    this._name = configuration.name;
    this._version = configuration.version;
    this._tables = [...configuration.tables];
    this._keyPath = configuration.keyPath ?? "id";
  }

  /**
   * Get database name.
   * @category State
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Get database version.
   * @category State
   */
  public get version(): number {
    return this._version;
  }

  /**
   * Get configured table names.
   * @category State
   */
  public get tables(): string[] {
    return [...this._tables];
  }

  /**
   * Get configured key path.
   * @category State
   */
  public get keyPath(): string {
    return this._keyPath;
  }

  /**
   * Get current database connection.
   * @category State
   */
  public get database(): IDBDatabase | null {
    return this._database;
  }

  /**
   * Get current storage activity.
   *  @category State
   */
  public get activity(): Activity {
    return this._activity;
  }

  /**
   * Get current storage status.
   * @category State
   */
  public get status(): Status {
    return this._status;
  }

  /**
   * Event handler for the `beforecreate` event.
   * @event
   * @category Events
   */
  public set beforecreate(handler: EventListener | null) {
    this._beforecreate &&
      this.removeEventListener(Event.BEFORE_CREATE, this._beforecreate);
    this._beforecreate = handler;
    this._beforecreate &&
      this.addEventListener(Event.BEFORE_CREATE, this._beforecreate);
  }

  /**
   * Event handler for the `aftercreate` event.
   * @event
   * @category Events
   */
  public set aftercreate(handler: EventListener | null) {
    this._aftercreate &&
      this.removeEventListener(Event.AFTER_CREATE, this._aftercreate);
    this._aftercreate = handler;
    this._aftercreate &&
      this.addEventListener(Event.AFTER_CREATE, this._aftercreate);
  }

  /**
   * Event handler for the `beforeopen` event.
   * @event
   * @category Events
   */
  public set beforeopen(handler: EventListener | null) {
    this._beforeopen &&
      this.removeEventListener(Event.BEFORE_OPEN, this._beforeopen);
    this._beforeopen = handler;
    this._beforeopen &&
      this.addEventListener(Event.BEFORE_OPEN, this._beforeopen);
  }

  /**
   * Event handler for the `afteropen` event.
   * @event
   * @category Events
   */
  public set afteropen(handler: EventListener | null) {
    this._afteropen &&
      this.removeEventListener(Event.AFTER_OPEN, this._afteropen);
    this._afteropen = handler;
    this._afteropen && this.addEventListener(Event.AFTER_OPEN, this._afteropen);
  }

  /**
   * Event handler for the `beforedelete` event.
   * @event
   * @category Events
   */
  public set beforedelete(handler: EventListener | null) {
    this._beforedelete &&
      this.removeEventListener(Event.BEFORE_DELETE, this._beforedelete);
    this._beforedelete = handler;
    this._beforedelete &&
      this.addEventListener(Event.BEFORE_DELETE, this._beforedelete);
  }

  /**
   * Event handler for the `afterdelete` event.
   * @event
   * @category Events
   */
  public set afterdelete(handler: EventListener | null) {
    this._afterdelete &&
      this.removeEventListener(Event.AFTER_DELETE, this._afterdelete);
    this._afterdelete = handler;
    this._afterdelete &&
      this.addEventListener(Event.AFTER_DELETE, this._afterdelete);
  }

  /**
   * Event handler for the `beforeadd` event.
   * @event
   * @category Events
   */
  public set beforeadd(handler: EventListener | null) {
    this._beforeadd &&
      this.removeEventListener(Event.BEFORE_ADD, this._beforeadd);
    this._beforeadd = handler;
    this._beforeadd && this.addEventListener(Event.BEFORE_ADD, this._beforeadd);
  }

  /**
   * Event handler for the `afteradd` event.
   * @event
   * @category Events
   */
  public set afteradd(handler: EventListener | null) {
    this._afteradd && this.removeEventListener(Event.AFTER_ADD, this._afteradd);
    this._afteradd = handler;
    this._afteradd && this.addEventListener(Event.AFTER_ADD, this._afteradd);
  }

  /**
   * Event handler for the `beforeretrieve` event.
   * @event
   * @category Events
   */
  public set beforeretrieve(handler: EventListener | null) {
    this._beforeretrieve &&
      this.removeEventListener(Event.BEFORE_RETRIEVE, this._beforeretrieve);
    this._beforeretrieve = handler;
    this._beforeretrieve &&
      this.addEventListener(Event.BEFORE_RETRIEVE, this._beforeretrieve);
  }

  /**
   * Event handler for the `afterretrieve` event.
   * @event
   * @category Events
   */
  public set afterretrieve(handler: EventListener | null) {
    this._afterretrieve &&
      this.removeEventListener(Event.AFTER_RETRIEVE, this._afterretrieve);
    this._afterretrieve = handler;
    this._afterretrieve &&
      this.addEventListener(Event.AFTER_RETRIEVE, this._afterretrieve);
  }

  /**
   * Event handler for the `beforeupdate` event.
   * @event
   * @category Events
   */
  public set beforeupdate(handler: EventListener | null) {
    this._beforeupdate &&
      this.removeEventListener(Event.BEFORE_UPDATE, this._beforeupdate);
    this._beforeupdate = handler;
    this._beforeupdate &&
      this.addEventListener(Event.BEFORE_UPDATE, this._beforeupdate);
  }

  /**
   * Event handler for the `afterupdate` event.
   * @event
   * @category Events
   */
  public set afterupdate(handler: EventListener | null) {
    this._afterupdate &&
      this.removeEventListener(Event.AFTER_UPDATE, this._afterupdate);
    this._afterupdate = handler;
    this._afterupdate &&
      this.addEventListener(Event.AFTER_UPDATE, this._afterupdate);
  }

  /**
   * Event handler for the `beforeremove` event.
   * @event
   * @category Events
   */
  public set beforeremove(handler: EventListener | null) {
    this._beforeremove &&
      this.removeEventListener(Event.BEFORE_REMOVE, this._beforeremove);
    this._beforeremove = handler;
    this._beforeremove &&
      this.addEventListener(Event.BEFORE_REMOVE, this._beforeremove);
  }

  /**
   * Event handler for the `afterremove` event.
   * @event
   * @category Events
   */
  public set afterremove(handler: EventListener | null) {
    this._afterremove &&
      this.removeEventListener(Event.AFTER_REMOVE, this._afterremove);
    this._afterremove = handler;
    this._afterremove &&
      this.addEventListener(Event.AFTER_REMOVE, this._afterremove);
  }

  /**
   * Event handler for the `error` event.
   * @event
   * @category Events
   */
  public set onerror(handler: EventListener | null) {
    this._onerror && this.removeEventListener(Event.ON_ERROR, this._onerror);
    this._onerror = handler;
    this._onerror && this.addEventListener(Event.ON_ERROR, this._onerror);
  }

  /**
   * Create a new database.
   * @returns A promise that resolves to the created database instance.
   * @category Operations
   */
  public create = async (): Promise<IDBDatabase> => {
    this._activity = Activity.CREATING;

    const message = {
      detail: { activity: this.activity, status: this.status }
    };
    this._dispatchEvent(Event.BEFORE_CREATE, message);

    try {
      const database = await this._createDatabase();
      this._database = database;

      this._activity = Activity.IDLE;
      this._status = Status.READY;

      const message = {
        detail: { activity: this.activity, status: this.status }
      };
      this._dispatchEvent(Event.AFTER_CREATE, message);
      return database;
    } catch (error) {
      const message = {
        detail: {
          operation: Operation.CREATE,
          activity: this.activity,
          status: this.status,
          error
        }
      };
      this._dispatchEvent(Event.ON_ERROR, message);
      throw error;
    }
  };

  /**
   * Open an existing database.
   * @returns A promise that resolves to the opened database instance.
   * @category Operations
   */
  public open = async (): Promise<IDBDatabase> => {
    this._activity = Activity.OPENING;

    const message = {
      detail: { activity: this.activity, status: this.status }
    };
    this._dispatchEvent(Event.BEFORE_OPEN, message);

    try {
      const database = await this._openDatabase();
      this._database = database;

      this._activity = Activity.IDLE;
      this._status = Status.READY;

      const message = {
        detail: { activity: this.activity, status: this.status }
      };
      this._dispatchEvent(Event.AFTER_OPEN, message);
      return database;
    } catch (error) {
      const message = {
        detail: {
          operation: Operation.OPEN,
          activity: this.activity,
          status: this.status,
          error
        }
      };
      this._dispatchEvent(Event.ON_ERROR, message);
      throw error;
    }
  };

  /**
   * Delete the database.
   * @returns A promise that resolves when the database is deleted.
   * @category Operations
   */
  public delete = async (): Promise<void> => {
    this._activity = Activity.DELETING;

    const message = {
      detail: { activity: this.activity, status: this.status }
    };
    this._dispatchEvent(Event.BEFORE_DELETE, message);

    try {
      const database = this._database;
      database && database.close();
      await this._deleteDatabase();
      this._database = null;

      this._activity = Activity.IDLE;
      this._status = Status.MISSING;

      const message = {
        detail: { activity: this.activity, status: this.status }
      };
      this._dispatchEvent(Event.AFTER_DELETE, message);
    } catch (error) {
      const message = {
        detail: {
          operation: Operation.DELETE,
          activity: this.activity,
          status: this.status,
          error
        }
      };
      this._dispatchEvent(Event.ON_ERROR, message);
      throw error;
    }
  };

  /**
   * Close the current database connection without deleting the database.
   * @category Operations
   */
  public dispose = (): void => {
    const database = this._database;

    database && database.close();
    this._database = null;
    this._activity = Activity.IDLE;
    this._status = Status.UNKNOWN;
  };

  /**
   * Check if the database exists.
   * @returns A promise that resolves to a boolean indicating if the database exists.
   * @category Operations
   */
  public exists = async (): Promise<boolean> => {
    const databases = await indexedDB.databases();
    return !!databases.find(
      ({ name, version }) => name === this._name && version === this._version
    );
  };

  /**
   * Create a repository for a specific table.
   * @param table The name of the table.
   * @returns A repository instance for the specified table.
   * @category Operations
   */
  public repository = <T extends { id: string }>(
    table: string
  ): Repository<T> => new Repository<T>(this, table);

  private _createDatabase = (): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open(this._name, this._version);
      request.onupgradeneeded = this._createTables;

      request.onsuccess = (event) =>
        resolve((event.target as IDBOpenDBRequest).result);

      request.onerror = (event) =>
        reject((event.target as IDBOpenDBRequest).error);
    });

  private _createTables = (event: any): void => {
    const database = event.target.result;
    this._tables.forEach(
      (type) =>
        !database.objectStoreNames.contains(type) &&
        database.createObjectStore(type, { keyPath: this._keyPath })
    );
  };

  private _openDatabase = (): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open(this._name, this._version);

      request.onsuccess = (event) =>
        resolve((event.target as IDBOpenDBRequest).result);

      request.onerror = (event) =>
        reject((event.target as IDBOpenDBRequest).error);
    });

  private _deleteDatabase = (): Promise<void> =>
    new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this._name);

      request.onsuccess = () => resolve();

      request.onerror = (event) =>
        reject((event.target as IDBOpenDBRequest).error);

      request.onblocked = () =>
        reject(new Error("Delete operation was blocked"));
    });

  private _dispatchEvent = (event: Event, message: any) =>
    this.dispatchEvent(new CustomEvent(event, message));
}
