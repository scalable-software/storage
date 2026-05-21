import {
  Activity,
  Status,
  Event,
  Operation,
  Storage,
  Repository
} from "@scalable.software/storage";

import type { Configuration } from "@scalable.software/storage";

const name = "database";
const version = 1;
const tables = ["metadata", "nodes", "connection"];

const teardown = async (storage?: Storage) => {
  storage?.database?.close?.();
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(name);

    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
};

type Node = {
  id: string;
  name: string;
  type: string;
  coordinates: { x: number; y: number };
  icon: string;
  metadata?: any[];
};

const node = (id: string, name: string, x: number): Node => ({
  id,
  name,
  type: "node",
  coordinates: { x, y: 0 },
  icon: "icon.svg"
});

state(Activity.IDLE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        await teardown(storage);
      });

      then("`storage.activity` getter exists", () => {
        expect(storage.activity).toBeDefined();
      });

      and("`storage.activity` getter exists", () => {
        then("`storage.activity` is `Activity.IDLE`", () => {
          expect(storage.activity).toBe(Activity.IDLE);
        });
      });

      then("`storage.status` getter exists", () => {
        expect(storage.status).toBeDefined();
      });

      and("`storage.status` getter exists", () => {
        then("`storage.status` is `Status.UNKNOWN`", () => {
          expect(storage.status).toBe(Status.UNKNOWN);
        });
      });

      when("`storage.create()` is called", () => {
        let activity: Activity | undefined;

        beforeEach(async () => {
          storage.addEventListener(Event.BEFORE_CREATE, () => {
            activity = storage.activity;
          });
          await storage.create();
        });

        then(
          "`storage.activity` is Activity.CREATING during the operation",
          () => {
            expect(activity).toBe(Activity.CREATING);
          }
        );

        then("`storage.activity` is Activity.IDLE after the operation", () => {
          expect(storage.activity).toBe(Activity.IDLE);
        });
      });
    });
  });
});

operation(Operation.CREATE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        await teardown(storage);
      });

      then("`storage.create` method exists", () => {
        expect(storage.create).toBeDefined();
      });

      and("`storage.create` method exists", () => {
        when("invoking `storage.create()`", () => {
          let database: IDBDatabase;

          beforeEach(async () => {
            database = (await storage.create()) as IDBDatabase;
          });

          then("the resolved value is an `IDBDatabase`", () => {
            expect(database instanceof IDBDatabase).toBe(true);
          });

          then("`storage.database` references the open database", () => {
            expect(storage.database).toBe(database);
          });

          and("database object store names are read", () => {
            let names: string[];

            beforeEach(() => {
              names = Array.from(database.objectStoreNames);
            });

            then("the database contains the metadata store", () => {
              expect(names).toContain(configuration.tables[0]);
            });

            then("the database contains the nodes store", () => {
              expect(names).toContain(configuration.tables[1]);
            });

            then("the database contains the connection store", () => {
              expect(names).toContain(configuration.tables[2]);
            });
          });

          then("`storage.status` becomes `Status.READY`", () => {
            expect(storage.status).toBe(Status.READY);
          });
        });
      });
    });
  });
});

operation(Operation.OPEN, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        await teardown(storage);
      });

      and("the database is created and closed", () => {
        beforeEach(async () => {
          const created = (await storage.create()) as IDBDatabase;
          created.close();
        });

        then("`storage.open` method exists", () => {
          expect(storage.open).toBeDefined();
        });

        and("`storage.open` method exists", () => {
          when("invoking `storage.open()`", () => {
            let database: IDBDatabase;

            beforeEach(async () => {
              database = (await storage.open()) as IDBDatabase;
            });

            then("an `IDBDatabase` is returned", () => {
              expect(database instanceof IDBDatabase).toBe(true);
            });

            then("`storage.database` references the open database", () => {
              expect(storage.database).toBe(database);
            });

            then("`storage.status` is `Status.READY`", () => {
              expect(storage.status).toBe(Status.READY);
            });
          });
        });
      });
    });
  });
});

operation(Operation.DELETE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(async () => {
        storage = new Storage(configuration);
        await storage.create();
      });

      afterEach(async () => {
        await teardown(storage);
      });

      then("`storage.delete` method exists", () => {
        expect(storage.delete).toBeDefined();
      });

      and("`storage.delete` method exists", () => {
        when("invoking `storage.delete()`", () => {
          beforeEach(async () => {
            await storage.delete();
          });

          then("`storage.exists()` returns falsy", async () => {
            expect(await storage.exists()).toBeFalsy();
          });

          then("`storage.status` becomes `Status.MISSING`", () => {
            expect(storage.status).toBe(Status.MISSING);
          });
        });
      });
    });
  });
});

operation(Operation.DISPOSE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;
      let database: IDBDatabase;

      beforeEach(async () => {
        storage = new Storage(configuration);
        database = (await storage.create()) as IDBDatabase;
      });

      afterEach(async () => {
        database.close();
        await teardown(storage);
      });

      then("`storage.dispose` method exists", () => {
        expect(storage.dispose).toBeDefined();
      });

      and("`storage.dispose` method exists", () => {
        when("invoking `storage.dispose()`", () => {
          beforeEach(() => {
            storage.dispose();
          });

          then("`storage.database` is cleared", () => {
            expect(storage.database).toBeNull();
          });

          then("`storage.status` resets to `Status.UNKNOWN`", () => {
            expect(storage.status).toBe(Status.UNKNOWN);
          });

          then("`storage.activity` resets to `Activity.IDLE`", () => {
            expect(storage.activity).toBe(Activity.IDLE);
          });
        });
      });
    });
  });
});

events(Event.BEFORE_CREATE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        await teardown(storage);
      });

      then("`storage.beforecreate` setter exists", () => {
        expect(hasSetter(storage, Event.BEFORE_CREATE)).toBeTrue();
      });

      and("`storage.beforecreate` setter exists", () => {
        and("`storage.beforecreate` is set to a listener", () => {
          let beforecreate: jasmine.Spy;

          beforeEach(() => {
            beforecreate = jasmine.createSpy("beforecreate");
            storage.beforecreate = beforecreate;
          });

          afterEach(() => {
            storage.beforecreate = null;
          });

          and("`storage.beforecreate` is set to a new listener", () => {
            let beforecreate2: jasmine.Spy;

            beforeEach(() => {
              beforecreate2 = jasmine.createSpy("beforecreate2");
              storage.beforecreate = beforecreate2;
            });

            afterEach(() => {
              storage.beforecreate = null;
            });

            when("`storage.create()` runs", () => {
              beforeEach(async () => {
                await storage.create();
              });

              then("old `storage.beforecreate` is not called", () => {
                expect(beforecreate).not.toHaveBeenCalled();
              });

              then("new `storage.beforecreate` is called", () => {
                expect(beforecreate2).toHaveBeenCalled();
              });

              then(
                "new `storage.beforecreate` is called with the current activity and status",
                () => {
                  const message = {
                    detail: {
                      activity: Activity.CREATING,
                      status: Status.UNKNOWN
                    }
                  };
                  expect(beforecreate2).toHaveBeenCalledWith(
                    jasmine.objectContaining(message)
                  );
                }
              );
            });
          });
        });
      });

      and("a listener is added with `addEventListener`", () => {
        let listener: jasmine.Spy;

        beforeEach(() => {
          listener = jasmine.createSpy("beforecreatingdatabase");
          storage.addEventListener(Event.BEFORE_CREATE, listener);
        });

        when("`storage.create()` runs", () => {
          beforeEach(async () => {
            await storage.create();
          });

          then("`BEFORE_CREATE` is dispatched on the storage", () => {
            expect(listener).toHaveBeenCalled();
          });

          and("the before event detail is inspected", () => {
            let detail: { activity: Activity; status: Status };

            beforeEach(() => {
              detail = listener.calls.mostRecent().args[0].detail;
            });

            then("the before event activity is `Activity.CREATING`", () => {
              expect(detail.activity).toBe(Activity.CREATING);
            });

            then("the before event status is `Status.UNKNOWN`", () => {
              expect(detail.status).toBe(Status.UNKNOWN);
            });
          });
        });
      });
    });
  });
});

events(Event.AFTER_CREATE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        await teardown(storage);
      });

      when("`storage.create()` resolves", () => {
        let listener: jasmine.Spy;

        beforeEach(async () => {
          listener = jasmine.createSpy("afterdatabasecreated");
          storage.addEventListener(Event.AFTER_CREATE, listener);
          await storage.create();
        });

        then("`AFTER_CREATE` is dispatched on the storage", () => {
          expect(listener).toHaveBeenCalled();
        });

        and("the after event detail is inspected", () => {
          let detail: { activity: Activity; status: Status };

          beforeEach(() => {
            detail = listener.calls.mostRecent().args[0].detail;
          });

          then("the after event activity is `Activity.IDLE`", () => {
            expect(detail.activity).toBe(Activity.IDLE);
          });

          then("the after event status is `Status.READY`", () => {
            expect(detail.status).toBe(Status.READY);
          });
        });
      });
    });
  });
});

events(Event.BEFORE_OPEN, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(async () => {
        storage = new Storage(configuration);
        const created = (await storage.create()) as IDBDatabase;
        created.close();
      });

      afterEach(async () => {
        await teardown(storage);
      });

      when("`storage.open()` runs", () => {
        let listener: jasmine.Spy;

        beforeEach(async () => {
          listener = jasmine.createSpy("beforeopeningdatabase");
          storage.addEventListener(Event.BEFORE_OPEN, listener);
          await storage.open();
        });

        then("`BEFORE_OPEN` is dispatched", () => {
          expect(listener).toHaveBeenCalled();
        });
      });
    });
  });
});

events(Event.AFTER_OPEN, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(async () => {
        storage = new Storage(configuration);
        const created = (await storage.create()) as IDBDatabase;
        created.close();
      });

      afterEach(async () => {
        await teardown(storage);
      });

      when("`storage.open()` resolves", () => {
        let listener: jasmine.Spy;

        beforeEach(async () => {
          listener = jasmine.createSpy("afterdatabaseopened");
          storage.addEventListener(Event.AFTER_OPEN, listener);
          await storage.open();
        });

        then("`AFTER_OPEN` is dispatched", () => {
          expect(listener).toHaveBeenCalled();
        });
      });
    });
  });
});

events(Event.BEFORE_DELETE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(async () => {
        storage = new Storage(configuration);
        await storage.create();
      });

      afterEach(async () => {
        await teardown(storage);
      });

      when("`storage.delete()` runs", () => {
        let listener: jasmine.Spy;

        beforeEach(async () => {
          listener = jasmine.createSpy("beforedeletingdatabase");
          storage.addEventListener(Event.BEFORE_DELETE, listener);
          await storage.delete();
        });

        then("`BEFORE_DELETE` is dispatched", () => {
          expect(listener).toHaveBeenCalled();
        });
      });
    });
  });
});

events(Event.AFTER_DELETE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(async () => {
        storage = new Storage(configuration);
        await storage.create();
      });

      afterEach(async () => {
        await teardown(storage);
      });

      when("`storage.delete()` resolves", () => {
        let listener: jasmine.Spy;

        beforeEach(async () => {
          listener = jasmine.createSpy("afterdatabasedeleted");
          storage.addEventListener(Event.AFTER_DELETE, listener);
          await storage.delete();
        });

        then("`AFTER_DELETE` is dispatched", () => {
          expect(listener).toHaveBeenCalled();
        });
      });
    });
  });
});

events(Event.BEFORE_ADD, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;
      let repo: Repository<Node>;

      beforeEach(async () => {
        storage = new Storage(configuration);
        await storage.create();
      });

      afterEach(async () => {
        await teardown(storage);
      });

      and("a node repository is obtained", () => {
        beforeEach(() => {
          repo = storage.repository<Node>(tables[0]);
        });

        then("`storage.beforeadd` setter exists", () => {
          expect(hasSetter(storage, Event.BEFORE_ADD)).toBeTrue();
        });

        and("`storage.beforeadd` setter exists", () => {
          and("`storage.beforeadd` is set to a listener", () => {
            let beforeadd: jasmine.Spy;

            beforeEach(() => {
              beforeadd = jasmine.createSpy("beforeadd");
              storage.beforeadd = beforeadd;
            });

            afterEach(() => {
              storage.beforeadd = null;
            });

            and("`storage.beforeadd` is set to a new listener", () => {
              let beforeadd2: jasmine.Spy;

              beforeEach(() => {
                beforeadd2 = jasmine.createSpy("beforeadd2");
                storage.beforeadd = beforeadd2;
              });

              afterEach(() => {
                storage.beforeadd = null;
              });

              when("`repo.add(node)` runs", () => {
                beforeEach(async () => {
                  await repo.add(node("A", "Alpha", 0));
                });

                then("old `storage.beforeadd` is not called", () => {
                  expect(beforeadd).not.toHaveBeenCalled();
                });

                then("new `storage.beforeadd` is called", () => {
                  expect(beforeadd2).toHaveBeenCalled();
                });

                then(
                  "new `storage.beforeadd` is called with the repository table and id",
                  () => {
                    const message = {
                      detail: { table: tables[0], id: "A" }
                    };
                    expect(beforeadd2).toHaveBeenCalledWith(
                      jasmine.objectContaining(message)
                    );
                  }
                );
              });
            });
          });
        });
      });
    });
  });
});

events(Event.ON_ERROR, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and(
      "Storage is constructed with a version lower than the existing db",
      () => {
        let storage: Storage;
        let listener: jasmine.Spy;
        let high: Storage;

        beforeEach(async () => {
          high = new Storage({
            ...configuration,
            version: 5
          });
          await high.create();
          high.database?.close?.();
        });

        afterEach(async () => {
          await teardown(storage);
        });

        and("a lower-version storage is constructed", () => {
          beforeEach(() => {
            storage = new Storage({
              ...configuration,
              version: 1
            });
          });

          and("an error listener is registered", () => {
            beforeEach(() => {
              listener = jasmine.createSpy("onerror");
              storage.addEventListener(Event.ON_ERROR, listener);
            });

            when("`storage.open()` runs", () => {
              let result: unknown;

              beforeEach(async () => {
                try {
                  await storage.open();
                } catch (error) {
                  result = error;
                }
              });

              then("`storage.open()` rejects with an error", () => {
                expect(
                  result instanceof DOMException || result instanceof Error
                ).toBe(true);
              });

              then("`ON_ERROR` is dispatched", () => {
                expect(listener).toHaveBeenCalled();
              });

              and("the error event detail is inspected", () => {
                let detail: {
                  operation: Operation;
                  activity: Activity;
                  status: Status;
                  error: unknown;
                };

                beforeEach(() => {
                  detail = listener.calls.mostRecent().args[0].detail;
                });

                then("the error event operation is `Operation.OPEN`", () => {
                  expect(detail.operation).toBe(Operation.OPEN);
                });

                then("the error event activity is `Activity.OPENING`", () => {
                  expect(detail.activity).toBe(Activity.OPENING);
                });

                then("the error event status is `Status.UNKNOWN`", () => {
                  expect(detail.status).toBe(Status.UNKNOWN);
                });

                then("the error event contains an error", () => {
                  expect(detail.error).toBeTruthy();
                });
              });
            });
          });
        });
      }
    );
  });
});

events(Event.ON_ERROR, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });
    and("indexedDB.open fails during `storage.create()`", () => {
      let storage: Storage;
      let listener: jasmine.Spy;
      let requestError: Error;

      beforeEach(() => {
        storage = new Storage(configuration);
        listener = jasmine.createSpy("onerror");
        storage.addEventListener(Event.ON_ERROR, listener);
        requestError = new Error("create failed");

        spyOn(indexedDB, "open").and.callFake(() => {
          const request = {} as IDBOpenDBRequest;
          Promise.resolve().then(() => {
            request.onerror?.({ target: { error: requestError } } as any);
          });
          return request;
        });
      });

      afterEach(async () => {
        await teardown(storage);
      });

      when("`storage.create()` runs", () => {
        let error: unknown;

        beforeEach(async () => {
          try {
            await storage.create();
          } catch (result) {
            error = result;
          }
        });

        then("`storage.create()` rejects", () => {
          expect(error).toBe(requestError);
        });

        then("`ON_ERROR` is dispatched for create", () => {
          expect(listener).toHaveBeenCalled();
        });

        and("the create error event detail is inspected", () => {
          let detail: {
            operation: Operation;
            activity: Activity;
            status: Status;
            error: unknown;
          };

          beforeEach(() => {
            detail = listener.calls.mostRecent().args[0].detail;
          });

          then("the create error operation is `Operation.CREATE`", () => {
            expect(detail.operation).toBe(Operation.CREATE);
          });

          then("the create error activity is `Activity.CREATING`", () => {
            expect(detail.activity).toBe(Activity.CREATING);
          });

          then("the create error status is `Status.UNKNOWN`", () => {
            expect(detail.status).toBe(Status.UNKNOWN);
          });

          then("the create error contains an error", () => {
            expect(detail.error).toBe(requestError);
          });
        });
      });
    });
  });
});

events(Event.ON_ERROR, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });
    and("indexedDB.open fails during `storage.open()`", () => {
      let storage: Storage;
      let listener: jasmine.Spy;
      let requestError: Error;

      beforeEach(() => {
        storage = new Storage(configuration);
        listener = jasmine.createSpy("onerror");
        storage.addEventListener(Event.ON_ERROR, listener);
        requestError = new Error("open failed");

        spyOn(indexedDB, "open").and.callFake(() => {
          const request = {} as IDBOpenDBRequest;
          Promise.resolve().then(() => {
            request.onerror?.({ target: { error: requestError } } as any);
          });
          return request;
        });
      });

      afterEach(async () => {
        await teardown(storage);
      });

      when("`storage.open()` runs", () => {
        let error: unknown;

        beforeEach(async () => {
          try {
            await storage.open();
          } catch (result) {
            error = result;
          }
        });

        then("`storage.open()` rejects", () => {
          expect(error).toBe(requestError);
        });

        then("`ON_ERROR` is dispatched for open", () => {
          expect(listener).toHaveBeenCalled();
        });

        and("the open error event detail is inspected", () => {
          let detail: {
            operation: Operation;
            activity: Activity;
            status: Status;
            error: unknown;
          };

          beforeEach(() => {
            detail = listener.calls.mostRecent().args[0].detail;
          });

          then("the open error operation is `Operation.OPEN`", () => {
            expect(detail.operation).toBe(Operation.OPEN);
          });

          then("the open error activity is `Activity.OPENING`", () => {
            expect(detail.activity).toBe(Activity.OPENING);
          });

          then("the open error status is `Status.UNKNOWN`", () => {
            expect(detail.status).toBe(Status.UNKNOWN);
          });

          then("the open error contains an error", () => {
            expect(detail.error).toBe(requestError);
          });
        });
      });
    });
  });
});

events(Event.ON_ERROR, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });
    and("indexedDB.deleteDatabase errors during `storage.delete()`", () => {
      let storage: Storage;
      let listener: jasmine.Spy;
      let requestError: Error;
      let deleteDatabase: typeof indexedDB.deleteDatabase;

      beforeEach(async () => {
        deleteDatabase = indexedDB.deleteDatabase.bind(indexedDB);
        storage = new Storage(configuration);
        await storage.create();
        listener = jasmine.createSpy("onerror");
        storage.addEventListener(Event.ON_ERROR, listener);
        requestError = new Error("delete failed");

        spyOn(indexedDB, "deleteDatabase").and.callFake(() => {
          const request = {} as IDBOpenDBRequest;
          Promise.resolve().then(() => {
            request.onerror?.({ target: { error: requestError } } as any);
          });
          return request;
        });
      });

      afterEach(async () => {
        storage.database?.close?.();
        await new Promise<void>((resolve) => {
          const request = deleteDatabase(name);
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
          request.onblocked = () => resolve();
        });
      });

      when("`storage.delete()` runs", () => {
        let error: unknown;

        beforeEach(async () => {
          try {
            await storage.delete();
          } catch (result) {
            error = result;
          }
        });

        then("`storage.delete()` rejects", () => {
          expect(error).toBe(requestError);
        });

        then("`ON_ERROR` is dispatched for delete error", () => {
          expect(listener).toHaveBeenCalled();
        });
      });
    });
  });
});

events(Event.ON_ERROR, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("indexedDB.deleteDatabase is blocked during `storage.delete()`", () => {
      let storage: Storage;
      let listener: jasmine.Spy;
      let deleteDatabase: typeof indexedDB.deleteDatabase;

      beforeEach(async () => {
        deleteDatabase = indexedDB.deleteDatabase.bind(indexedDB);
        storage = new Storage(configuration);
        await storage.create();
        listener = jasmine.createSpy("onerror");
        storage.addEventListener(Event.ON_ERROR, listener);

        spyOn(indexedDB, "deleteDatabase").and.callFake(() => {
          const request = {} as IDBOpenDBRequest;
          Promise.resolve().then(() => {
            request.onblocked?.({} as any);
          });
          return request;
        });
      });

      afterEach(async () => {
        storage.database?.close?.();
        await new Promise<void>((resolve) => {
          const request = deleteDatabase(name);
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
          request.onblocked = () => resolve();
        });
      });

      when("`storage.delete()` runs", () => {
        let error: unknown;

        beforeEach(async () => {
          try {
            await storage.delete();
          } catch (result) {
            error = result;
          }
        });

        then("`storage.delete()` rejects with a blocked error", () => {
          expect((error as Error).message).toBe("Delete operation was blocked");
        });

        then("`ON_ERROR` is dispatched for blocked delete", () => {
          expect(listener).toHaveBeenCalled();
        });
      });
    });
  });
});

events(Event.AFTER_CREATE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    given("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        storage.aftercreate = null;
        await teardown(storage);
      });

      then("the setter exists", () => {
        expect(hasSetter(storage, Event.AFTER_CREATE)).toBeTrue();
      });

      and("the setter exists", () => {
        and("the event listener is set", () => {
          let firstListener: jasmine.Spy;

          beforeEach(() => {
            firstListener = jasmine.createSpy("aftercreate1");
            storage.aftercreate = firstListener;
          });

          and("the event listener is replaced", () => {
            let secondListener: jasmine.Spy;
            const detail = { activity: Activity.IDLE, status: Status.READY };

            beforeEach(() => {
              secondListener = jasmine.createSpy("aftercreate2");
              storage.aftercreate = secondListener;
            });

            when("the matching event is dispatched", () => {
              beforeEach(() => {
                storage.dispatchEvent(
                  new CustomEvent(Event.AFTER_CREATE, { detail })
                );
              });

              then("the old listener is not called", () => {
                expect(firstListener).not.toHaveBeenCalled();
              });

              then("the new listener is called", () => {
                expect(secondListener).toHaveBeenCalled();
              });

              then("the new listener receives the event detail", () => {
                expect(secondListener).toHaveBeenCalledWith(
                  jasmine.objectContaining({ detail })
                );
              });
            });
          });
        });
      });
    });
  });
});

events(Event.BEFORE_OPEN, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });
    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        storage.beforeopen = null;
        await teardown(storage);
      });

      then("the setter exists", () => {
        expect(hasSetter(storage, Event.BEFORE_OPEN)).toBeTrue();
      });

      and("the setter exists", () => {
        and("the event listener is set", () => {
          let firstListener: jasmine.Spy;

          beforeEach(() => {
            firstListener = jasmine.createSpy("beforeopen1");
            storage.beforeopen = firstListener;
          });

          and("the event listener is replaced", () => {
            let secondListener: jasmine.Spy;
            const detail = {
              activity: Activity.OPENING,
              status: Status.UNKNOWN
            };

            beforeEach(() => {
              secondListener = jasmine.createSpy("beforeopen2");
              storage.beforeopen = secondListener;
            });

            when("the matching event is dispatched", () => {
              beforeEach(() => {
                storage.dispatchEvent(
                  new CustomEvent(Event.BEFORE_OPEN, { detail })
                );
              });

              then("the old listener is not called", () => {
                expect(firstListener).not.toHaveBeenCalled();
              });

              then("the new listener is called", () => {
                expect(secondListener).toHaveBeenCalled();
              });

              then("the new listener receives the event detail", () => {
                expect(secondListener).toHaveBeenCalledWith(
                  jasmine.objectContaining({ detail })
                );
              });
            });
          });
        });
      });
    });
  });
});

events(Event.AFTER_OPEN, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        storage.afteropen = null;
        await teardown(storage);
      });

      then("the setter exists", () => {
        expect(hasSetter(storage, Event.AFTER_OPEN)).toBeTrue();
      });

      and("the setter exists", () => {
        and("the event listener is set", () => {
          let firstListener: jasmine.Spy;

          beforeEach(() => {
            firstListener = jasmine.createSpy("afteropen1");
            storage.afteropen = firstListener;
          });

          and("the event listener is replaced", () => {
            let secondListener: jasmine.Spy;
            const detail = { activity: Activity.IDLE, status: Status.READY };

            beforeEach(() => {
              secondListener = jasmine.createSpy("afteropen2");
              storage.afteropen = secondListener;
            });

            when("the matching event is dispatched", () => {
              beforeEach(() => {
                storage.dispatchEvent(
                  new CustomEvent(Event.AFTER_OPEN, { detail })
                );
              });

              then("the old listener is not called", () => {
                expect(firstListener).not.toHaveBeenCalled();
              });

              then("the new listener is called", () => {
                expect(secondListener).toHaveBeenCalled();
              });

              then("the new listener receives the event detail", () => {
                expect(secondListener).toHaveBeenCalledWith(
                  jasmine.objectContaining({ detail })
                );
              });
            });
          });
        });
      });
    });
  });
});

events(Event.BEFORE_DELETE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        storage.beforedelete = null;
        await teardown(storage);
      });

      then("the setter exists", () => {
        expect(hasSetter(storage, Event.BEFORE_DELETE)).toBeTrue();
      });

      and("the setter exists", () => {
        and("the event listener is set", () => {
          let firstListener: jasmine.Spy;

          beforeEach(() => {
            firstListener = jasmine.createSpy("beforedelete1");
            storage.beforedelete = firstListener;
          });

          and("the event listener is replaced", () => {
            let secondListener: jasmine.Spy;
            const detail = {
              activity: Activity.DELETING,
              status: Status.READY
            };

            beforeEach(() => {
              secondListener = jasmine.createSpy("beforedelete2");
              storage.beforedelete = secondListener;
            });

            when("the matching event is dispatched", () => {
              beforeEach(() => {
                storage.dispatchEvent(
                  new CustomEvent(Event.BEFORE_DELETE, { detail })
                );
              });

              then("the old listener is not called", () => {
                expect(firstListener).not.toHaveBeenCalled();
              });

              then("the new listener is called", () => {
                expect(secondListener).toHaveBeenCalled();
              });

              then("the new listener receives the event detail", () => {
                expect(secondListener).toHaveBeenCalledWith(
                  jasmine.objectContaining({ detail })
                );
              });
            });
          });
        });
      });
    });
  });
});

events(Event.AFTER_DELETE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        storage.afterdelete = null;
        await teardown(storage);
      });

      then("the setter exists", () => {
        expect(hasSetter(storage, Event.AFTER_DELETE)).toBeTrue();
      });

      and("the setter exists", () => {
        and("the event listener is set", () => {
          let firstListener: jasmine.Spy;

          beforeEach(() => {
            firstListener = jasmine.createSpy("afterdelete1");
            storage.afterdelete = firstListener;
          });

          and("the event listener is replaced", () => {
            let secondListener: jasmine.Spy;
            const detail = { activity: Activity.IDLE, status: Status.MISSING };

            beforeEach(() => {
              secondListener = jasmine.createSpy("afterdelete2");
              storage.afterdelete = secondListener;
            });

            when("the matching event is dispatched", () => {
              beforeEach(() => {
                storage.dispatchEvent(
                  new CustomEvent(Event.AFTER_DELETE, { detail })
                );
              });

              then("the old listener is not called", () => {
                expect(firstListener).not.toHaveBeenCalled();
              });

              then("the new listener is called", () => {
                expect(secondListener).toHaveBeenCalled();
              });

              then("the new listener receives the event detail", () => {
                expect(secondListener).toHaveBeenCalledWith(
                  jasmine.objectContaining({ detail })
                );
              });
            });
          });
        });
      });
    });
  });
});

events(Event.AFTER_ADD, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        storage.afteradd = null;
        await teardown(storage);
      });

      then("the setter exists", () => {
        expect(hasSetter(storage, Event.AFTER_ADD)).toBeTrue();
      });

      and("the setter exists", () => {
        and("the event listener is set", () => {
          let firstListener: jasmine.Spy;

          beforeEach(() => {
            firstListener = jasmine.createSpy("afteradd1");
            storage.afteradd = firstListener;
          });

          and("the event listener is replaced", () => {
            let secondListener: jasmine.Spy;
            const detail = { table: tables[0], id: "A" };

            beforeEach(() => {
              secondListener = jasmine.createSpy("afteradd2");
              storage.afteradd = secondListener;
            });

            when("the matching event is dispatched", () => {
              beforeEach(() => {
                storage.dispatchEvent(
                  new CustomEvent(Event.AFTER_ADD, { detail })
                );
              });

              then("the old listener is not called", () => {
                expect(firstListener).not.toHaveBeenCalled();
              });

              then("the new listener is called", () => {
                expect(secondListener).toHaveBeenCalled();
              });

              then("the new listener receives the event detail", () => {
                expect(secondListener).toHaveBeenCalledWith(
                  jasmine.objectContaining({ detail })
                );
              });
            });
          });
        });
      });
    });
  });
});

events(Event.BEFORE_RETRIEVE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        storage.beforeretrieve = null;
        await teardown(storage);
      });

      then("the setter exists", () => {
        expect(hasSetter(storage, Event.BEFORE_RETRIEVE)).toBeTrue();
      });

      and("the setter exists", () => {
        and("the event listener is set", () => {
          let firstListener: jasmine.Spy;

          beforeEach(() => {
            firstListener = jasmine.createSpy("beforeretrieve1");
            storage.beforeretrieve = firstListener;
          });

          and("the event listener is replaced", () => {
            let secondListener: jasmine.Spy;
            const detail = { table: tables[0] };

            beforeEach(() => {
              secondListener = jasmine.createSpy("beforeretrieve2");
              storage.beforeretrieve = secondListener;
            });

            when("the matching event is dispatched", () => {
              beforeEach(() => {
                storage.dispatchEvent(
                  new CustomEvent(Event.BEFORE_RETRIEVE, { detail })
                );
              });

              then("the old listener is not called", () => {
                expect(firstListener).not.toHaveBeenCalled();
              });

              then("the new listener is called", () => {
                expect(secondListener).toHaveBeenCalled();
              });

              then("the new listener receives the event detail", () => {
                expect(secondListener).toHaveBeenCalledWith(
                  jasmine.objectContaining({ detail })
                );
              });
            });
          });
        });
      });
    });
  });
});

events(Event.AFTER_RETRIEVE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        storage.afterretrieve = null;
        await teardown(storage);
      });

      then("the setter exists", () => {
        expect(hasSetter(storage, Event.AFTER_RETRIEVE)).toBeTrue();
      });

      and("the setter exists", () => {
        and("the event listener is set", () => {
          let firstListener: jasmine.Spy;

          beforeEach(() => {
            firstListener = jasmine.createSpy("afterretrieve1");
            storage.afterretrieve = firstListener;
          });

          and("the event listener is replaced", () => {
            let secondListener: jasmine.Spy;
            const detail = {
              table: tables[0],
              id: "A",
              value: { name: "Alpha", weight: 0 }
            };

            beforeEach(() => {
              secondListener = jasmine.createSpy("afterretrieve2");
              storage.afterretrieve = secondListener;
            });

            when("the matching event is dispatched", () => {
              beforeEach(() => {
                storage.dispatchEvent(
                  new CustomEvent(Event.AFTER_RETRIEVE, { detail })
                );
              });

              then("the old listener is not called", () => {
                expect(firstListener).not.toHaveBeenCalled();
              });

              then("the new listener is called", () => {
                expect(secondListener).toHaveBeenCalled();
              });

              then("the new listener receives the event detail", () => {
                expect(secondListener).toHaveBeenCalledWith(
                  jasmine.objectContaining({ detail })
                );
              });
            });
          });
        });
      });
    });
  });
});

events(Event.BEFORE_UPDATE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        storage.beforeupdate = null;
        await teardown(storage);
      });

      then("the setter exists", () => {
        expect(hasSetter(storage, Event.BEFORE_UPDATE)).toBeTrue();
      });

      and("the setter exists", () => {
        and("the event listener is set", () => {
          let firstListener: jasmine.Spy;

          beforeEach(() => {
            firstListener = jasmine.createSpy("beforeupdate1");
            storage.beforeupdate = firstListener;
          });

          and("the event listener is replaced", () => {
            let secondListener: jasmine.Spy;
            const detail = { table: tables[0], id: "A" };

            beforeEach(() => {
              secondListener = jasmine.createSpy("beforeupdate2");
              storage.beforeupdate = secondListener;
            });

            when("the matching event is dispatched", () => {
              beforeEach(() => {
                storage.dispatchEvent(
                  new CustomEvent(Event.BEFORE_UPDATE, { detail })
                );
              });

              then("the old listener is not called", () => {
                expect(firstListener).not.toHaveBeenCalled();
              });

              then("the new listener is called", () => {
                expect(secondListener).toHaveBeenCalled();
              });

              then("the new listener receives the event detail", () => {
                expect(secondListener).toHaveBeenCalledWith(
                  jasmine.objectContaining({ detail })
                );
              });
            });
          });
        });
      });
    });
  });
});

events(Event.AFTER_UPDATE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        storage.afterupdate = null;
        await teardown(storage);
      });

      then("the setter exists", () => {
        expect(hasSetter(storage, Event.AFTER_UPDATE)).toBeTrue();
      });

      and("the setter exists", () => {
        and("the event listener is set", () => {
          let firstListener: jasmine.Spy;

          beforeEach(() => {
            firstListener = jasmine.createSpy("afterupdate1");
            storage.afterupdate = firstListener;
          });

          and("the event listener is replaced", () => {
            let secondListener: jasmine.Spy;
            const detail = { table: tables[0], id: "A" };

            beforeEach(() => {
              secondListener = jasmine.createSpy("afterupdate2");
              storage.afterupdate = secondListener;
            });

            when("the matching event is dispatched", () => {
              beforeEach(() => {
                storage.dispatchEvent(
                  new CustomEvent(Event.AFTER_UPDATE, { detail })
                );
              });

              then("the old listener is not called", () => {
                expect(firstListener).not.toHaveBeenCalled();
              });

              then("the new listener is called", () => {
                expect(secondListener).toHaveBeenCalled();
              });

              then("the new listener receives the event detail", () => {
                expect(secondListener).toHaveBeenCalledWith(
                  jasmine.objectContaining({ detail })
                );
              });
            });
          });
        });
      });
    });
  });
});

events(Event.BEFORE_REMOVE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        storage.beforeremove = null;
        await teardown(storage);
      });

      then("the setter exists", () => {
        expect(hasSetter(storage, Event.BEFORE_REMOVE)).toBeTrue();
      });

      and("the setter exists", () => {
        and("the event listener is set", () => {
          let firstListener: jasmine.Spy;

          beforeEach(() => {
            firstListener = jasmine.createSpy("beforeremove1");
            storage.beforeremove = firstListener;
          });

          and("the event listener is replaced", () => {
            let secondListener: jasmine.Spy;
            const detail = { table: tables[0], id: "A" };

            beforeEach(() => {
              secondListener = jasmine.createSpy("beforeremove2");
              storage.beforeremove = secondListener;
            });

            when("the matching event is dispatched", () => {
              beforeEach(() => {
                storage.dispatchEvent(
                  new CustomEvent(Event.BEFORE_REMOVE, { detail })
                );
              });

              then("the old listener is not called", () => {
                expect(firstListener).not.toHaveBeenCalled();
              });

              then("the new listener is called", () => {
                expect(secondListener).toHaveBeenCalled();
              });

              then("the new listener receives the event detail", () => {
                expect(secondListener).toHaveBeenCalledWith(
                  jasmine.objectContaining({ detail })
                );
              });
            });
          });
        });
      });
    });
  });
});

events(Event.AFTER_REMOVE, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        storage.afterremove = null;
        await teardown(storage);
      });

      then("the setter exists", () => {
        expect(hasSetter(storage, Event.AFTER_REMOVE)).toBeTrue();
      });

      and("the setter exists", () => {
        and("the event listener is set", () => {
          let firstListener: jasmine.Spy;

          beforeEach(() => {
            firstListener = jasmine.createSpy("afterremove1");
            storage.afterremove = firstListener;
          });

          and("the event listener is replaced", () => {
            let secondListener: jasmine.Spy;
            const detail = { table: tables[0], id: "A" };

            beforeEach(() => {
              secondListener = jasmine.createSpy("afterremove2");
              storage.afterremove = secondListener;
            });

            when("the matching event is dispatched", () => {
              beforeEach(() => {
                storage.dispatchEvent(
                  new CustomEvent(Event.AFTER_REMOVE, { detail })
                );
              });

              then("the old listener is not called", () => {
                expect(firstListener).not.toHaveBeenCalled();
              });

              then("the new listener is called", () => {
                expect(secondListener).toHaveBeenCalled();
              });

              then("the new listener receives the event detail", () => {
                expect(secondListener).toHaveBeenCalledWith(
                  jasmine.objectContaining({ detail })
                );
              });
            });
          });
        });
      });
    });
  });
});

events(Event.ON_ERROR, () => {
  given("storage configuration is defined", () => {
    let configuration: Configuration;
    beforeEach(() => {
      configuration = {
        name,
        version,
        tables
      };
    });

    and("an storage instance is created using configuration", () => {
      let storage: Storage;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      afterEach(async () => {
        storage.onerror = null;
        await teardown(storage);
      });

      then("the setter exists", () => {
        expect(hasSetter(storage, Event.ON_ERROR)).toBeTrue();
      });

      and("the setter exists", () => {
        and("the event listener is set", () => {
          let firstListener: jasmine.Spy;

          beforeEach(() => {
            firstListener = jasmine.createSpy("onerror1");
            storage.onerror = firstListener;
          });

          and("the event listener is replaced", () => {
            let secondListener: jasmine.Spy;
            const detail = {
              operation: Operation.OPEN,
              activity: Activity.OPENING,
              status: Status.UNKNOWN,
              error: new Error("boom")
            };

            beforeEach(() => {
              secondListener = jasmine.createSpy("onerror2");
              storage.onerror = secondListener;
            });

            when("the matching event is dispatched", () => {
              beforeEach(() => {
                storage.dispatchEvent(
                  new CustomEvent(Event.ON_ERROR, { detail })
                );
              });

              then("the old listener is not called", () => {
                expect(firstListener).not.toHaveBeenCalled();
              });

              then("the new listener is called", () => {
                expect(secondListener).toHaveBeenCalled();
              });

              then("the new listener receives the event detail", () => {
                expect(secondListener).toHaveBeenCalledWith(
                  jasmine.objectContaining({ detail })
                );
              });
            });
          });
        });
      });
    });
  });
});
