/**
 * @module Storage
 */

export type Configuration = {
  name: string;
  version: number;
  tables: string[];
  keyPath?: string;
};

export const State = {
  ACTIVITY: "activity",
  STATUS: "status"
} as const;

export type State = (typeof State)[keyof typeof State];

/**
 * @category Metadata
 * @enum
 */
export const Activity = {
  IDLE: "idle",
  CREATING: "creating",
  OPENING: "opening",
  DELETING: "deleting",
  ADDING: "adding",
  RETRIEVING: "retrieving",
  UPDATING: "updating",
  REMOVING: "removing"
} as const;

/**
 * @category Metadata
 */
export type Activity = (typeof Activity)[keyof typeof Activity];

/**
 * @category Metadata
 * @enum
 */
export const Status = {
  UNKNOWN: "unknown",
  MISSING: "missing",
  READY: "ready"
} as const;

/**
 * @category Metadata
 */
export type Status = (typeof Status)[keyof typeof Status];

/**
 * @category Metadata
 * @enum
 */
export const Event = {
  BEFORE_CREATE: "beforecreate",
  AFTER_CREATE: "aftercreate",
  BEFORE_OPEN: "beforeopen",
  AFTER_OPEN: "afteropen",
  BEFORE_DELETE: "beforedelete",
  AFTER_DELETE: "afterdelete",
  BEFORE_ADD: "beforeadd",
  AFTER_ADD: "afteradd",
  BEFORE_RETRIEVE: "beforeretrieve",
  AFTER_RETRIEVE: "afterretrieve",
  BEFORE_UPDATE: "beforeupdate",
  AFTER_UPDATE: "afterupdate",
  BEFORE_REMOVE: "beforeremove",
  AFTER_REMOVE: "afterremove",
  ON_ERROR: "onerror"
} as const;

/**
 * @category Metadata
 */
export type Event = (typeof Event)[keyof typeof Event];

export const Operation = {
  CREATE: "create",
  OPEN: "open",
  DELETE: "delete",
  DISPOSE: "dispose",
  ADD: "add",
  RETRIEVE: "retrieve",
  UPDATE: "update",
  REMOVE: "remove"
} as const;

export type Operation = (typeof Operation)[keyof typeof Operation];
