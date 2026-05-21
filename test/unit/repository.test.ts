import {
  Event,
  Operation,
  Storage,
  Repository
} from "@scalable.software/storage";

import type { Configuration } from "@scalable.software/storage";

const name = "database";
const version = 1;
const tables = ["metadata", "nodes", "connection"];

type Node = {
  id: string;
  name: string;
  type: string;
  coordinates: { x: number; y: number };
  icon: string;
  metadata?: any[];
};

const node: Node = {
  id: "repo-test-7c1a4d3e-0001-4abc-9def",
  name: "Start",
  type: "start",
  coordinates: { x: 0, y: 400 },
  icon: "icon.svg",
  metadata: [
    {
      arrival: {
        distribution: "exponential",
        parameters: [{ rate: 0.005469098 }]
      }
    }
  ]
};

const updatedNode: Node = {
  id: node.id,
  name: "Start Updated",
  type: "start",
  coordinates: { x: 10, y: 410 },
  icon: "icon.svg",
  metadata: []
};

const teardown = async (storage?: Storage) => {
  storage?.database?.close?.();
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(name);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
};

operation(Operation.ADD, () => {
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
          repo = storage.repository<Node>(tables[1]);
        });

        then("a repository is returned", () => {
          expect(repo).toBeDefined();
        });

        and("a repository is returned", () => {
          then("a `Repository` bound to the table is returned", () => {
            expect(repo instanceof Repository).toBe(true);
          });

          then("`repo.add` method exists", () => {
            expect(repo.add).toBeDefined();
          });

          and("`repo.add` method exists", () => {
            when("invoking `repo.add(node)`", () => {
              let nodes: Node[];

              beforeEach(async () => {
                await repo.add(node);
                nodes = await repo.retrieve();
              });

              then("one node is persisted", () => {
                expect(nodes.length).toBe(1);
              });

              and("one node is persisted", () => {
                then("the persisted node id is correct", () => {
                  expect(nodes[0].id).toBe(node.id);
                });

                then("the persisted node name is correct", () => {
                  expect(nodes[0].name).toBe(node.name);
                });
              });
            });
          });
        });
      });
    });
  });
});

operation(Operation.RETRIEVE, () => {
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
          repo = storage.repository<Node>(tables[1]);
        });

        and("one stored node exists", () => {
          beforeEach(async () => {
            await repo.add(node);
          });

          then("`repo.retrieve` method exists", () => {
            expect(repo.retrieve).toBeDefined();
          });

          then("`repo.getById` method exists", () => {
            expect(repo.getById).toBeDefined();
          });

          then("`repo.exists` method exists", () => {
            expect(repo.exists).toBeDefined();
          });

          and("`repo.retrieve` method exists", () => {
            when("invoking `repo.retrieve()`", () => {
              let nodes: Node[];

              beforeEach(async () => {
                nodes = await repo.retrieve();
              });

              then("the returned value is an array", () => {
                expect(Array.isArray(nodes)).toBe(true);
              });

              and("the returned value is an array", () => {
                then("the array contains one node", () => {
                  expect(nodes.length).toBe(1);
                });

                and("the array contains one node", () => {
                  then("the returned node id is correct", () => {
                    expect(nodes[0].id).toBe(node.id);
                  });
                });
              });
            });

            when("the store is empty", () => {
              beforeEach(async () => {
                await repo.remove(node.id);
              });

              then(
                "`repo.retrieve()` resolves with an empty array",
                async () => {
                  expect(await repo.retrieve()).toEqual([]);
                }
              );
            });
          });

          and("`repo.getById` method exists", () => {
            when("invoking `repo.getById(id)` with an existing id", () => {
              let result: Node | undefined;

              beforeEach(async () => {
                result = await repo.getById(node.id);
              });

              then("the stored node is returned", () => {
                expect(result).toBeTruthy();
              });

              and("the stored node is returned", () => {
                then("the returned node id is correct", () => {
                  expect(result?.id).toBe(node.id);
                });

                then("the returned node name is correct", () => {
                  expect(result?.name).toBe(node.name);
                });
              });
            });

            when("invoking `repo.getById(id)` with a missing id", () => {
              let result: Node | undefined;

              beforeEach(async () => {
                result = await repo.getById("missing-id");
              });

              then("`undefined` is returned", () => {
                expect(result).toBeUndefined();
              });
            });
          });

          and("`repo.exists` method exists", () => {
            when("invoking `repo.exists(id)` with an existing id", () => {
              let result: boolean;

              beforeEach(async () => {
                result = await repo.exists(node.id);
              });

              then("`true` is returned", () => {
                expect(result).toBeTrue();
              });
            });

            when("invoking `repo.exists(id)` with a missing id", () => {
              let result: boolean;

              beforeEach(async () => {
                result = await repo.exists("missing-id");
              });

              then("`false` is returned", () => {
                expect(result).toBeFalse();
              });
            });
          });
        });
      });
    });
  });
});

operation(Operation.UPDATE, () => {
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
          repo = storage.repository<Node>(tables[1]);
        });

        and("one stored node exists", () => {
          beforeEach(async () => {
            await repo.add(node);
          });

          then("`repo.update` method exists", () => {
            expect(repo.update).toBeDefined();
          });

          and("`repo.update` method exists", () => {
            when("invoking `repo.update(node)`", () => {
              let nodes: Node[];

              beforeEach(async () => {
                await repo.update(updatedNode);
                nodes = await repo.retrieve();
              });

              then("one node remains stored", () => {
                expect(nodes.length).toBe(1);
              });

              and("one node remains stored", () => {
                then("the stored node name is updated", () => {
                  expect(nodes[0].name).toBe(updatedNode.name);
                });

                then("the stored node x coordinate is updated", () => {
                  expect(nodes[0].coordinates.x).toBe(
                    updatedNode.coordinates.x
                  );
                });
              });
            });
          });
        });
      });
    });
  });
});

operation(Operation.REMOVE, () => {
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
          repo = storage.repository<Node>(tables[1]);
        });

        and("one stored node exists", () => {
          beforeEach(async () => {
            await repo.add(node);
          });

          then("`repo.remove` method exists", () => {
            expect(repo.remove).toBeDefined();
          });

          then("`repo.clear` method exists", () => {
            expect(repo.clear).toBeDefined();
          });

          and("`repo.remove` method exists", () => {
            when("invoking `repo.remove(id)`", () => {
              let nodes: Node[];

              beforeEach(async () => {
                await repo.remove(node.id);
                nodes = await repo.retrieve();
              });

              then("no nodes remain", () => {
                expect(nodes).toEqual([]);
              });
            });
          });

          and("`repo.clear` method exists", () => {
            when("invoking `repo.clear()`", () => {
              let nodes: Node[];

              beforeEach(async () => {
                await repo.clear();
                nodes = await repo.retrieve();
              });

              then("no nodes remain", () => {
                expect(nodes).toEqual([]);
              });
            });
          });
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
          repo = storage.repository<Node>(tables[1]);
        });

        and("listeners are registered for add events", () => {
          let before: jasmine.Spy;
          let after: jasmine.Spy;

          beforeEach(() => {
            before = jasmine.createSpy("beforeadd");
            after = jasmine.createSpy("afteradd");
            storage.addEventListener(Event.BEFORE_ADD, before);
            storage.addEventListener(Event.AFTER_ADD, after);
          });

          when("`repo.add(node)` runs", () => {
            beforeEach(async () => {
              await repo.add(node);
            });

            then("`BEFORE_ADD` is dispatched on the storage", () => {
              expect(before).toHaveBeenCalled();
            });

            then("`AFTER_ADD` is dispatched on the storage", () => {
              expect(after).toHaveBeenCalled();
            });

            and("the after event detail is inspected", () => {
              let detail: { table: string; id: string };

              beforeEach(() => {
                detail = after.calls.mostRecent().args[0].detail;
              });

              then("the after event table is correct", () => {
                expect(detail.table).toBe(tables[1]);
              });

              then("the after event id is correct", () => {
                expect(detail.id).toBe(node.id);
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
          repo = storage.repository<Node>(tables[1]);
        });

        and("one stored node exists", () => {
          beforeEach(async () => {
            await repo.add(node);
          });

          and("listeners are registered for retrieve events", () => {
            let before: jasmine.Spy;
            let after: jasmine.Spy;

            beforeEach(() => {
              before = jasmine.createSpy("beforeretrieve");
              after = jasmine.createSpy("afterretrieve");
              storage.addEventListener(Event.BEFORE_RETRIEVE, before);
              storage.addEventListener(Event.AFTER_RETRIEVE, after);
            });

            when("`repo.retrieve()` runs", () => {
              beforeEach(async () => {
                await repo.retrieve();
              });

              then("`BEFORE_RETRIEVE` is dispatched", () => {
                expect(before).toHaveBeenCalled();
              });

              then("`AFTER_RETRIEVE` is dispatched", () => {
                expect(after).toHaveBeenCalled();
              });

              and("the retrieve event details are inspected", () => {
                let beforeDetail: { table: string };
                let afterDetail: { table: string };

                beforeEach(() => {
                  beforeDetail = before.calls.mostRecent().args[0].detail;
                  afterDetail = after.calls.mostRecent().args[0].detail;
                });

                then("the before retrieve event table is correct", () => {
                  expect(beforeDetail.table).toBe(tables[1]);
                });

                then("the after retrieve event table is correct", () => {
                  expect(afterDetail.table).toBe(tables[1]);
                });
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
          repo = storage.repository<Node>(tables[1]);
        });

        and("one stored node exists", () => {
          beforeEach(async () => {
            await repo.add(node);
          });

          and("listeners are registered for update events", () => {
            let before: jasmine.Spy;
            let after: jasmine.Spy;

            beforeEach(() => {
              before = jasmine.createSpy("beforeupdate");
              after = jasmine.createSpy("afterupdate");
              storage.addEventListener(Event.BEFORE_UPDATE, before);
              storage.addEventListener(Event.AFTER_UPDATE, after);
            });

            when("`repo.update(node)` runs", () => {
              beforeEach(async () => {
                await repo.update(updatedNode);
              });

              then("`BEFORE_UPDATE` is dispatched", () => {
                expect(before).toHaveBeenCalled();
              });

              then("`AFTER_UPDATE` is dispatched", () => {
                expect(after).toHaveBeenCalled();
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
          repo = storage.repository<Node>(tables[1]);
        });

        and("one stored node exists", () => {
          beforeEach(async () => {
            await repo.add(node);
          });

          and("listeners are registered for remove events", () => {
            let before: jasmine.Spy;
            let after: jasmine.Spy;

            beforeEach(() => {
              before = jasmine.createSpy("beforeremove");
              after = jasmine.createSpy("afterremove");
              storage.addEventListener(Event.BEFORE_REMOVE, before);
              storage.addEventListener(Event.AFTER_REMOVE, after);
            });

            when("`repo.remove(id)` runs", () => {
              beforeEach(async () => {
                await repo.remove(node.id);
              });

              then("`BEFORE_REMOVE` is dispatched", () => {
                expect(before).toHaveBeenCalled();
              });

              then("`AFTER_REMOVE` is dispatched", () => {
                expect(after).toHaveBeenCalled();
              });

              and("the after remove event detail is inspected", () => {
                let detail: { id: string };

                beforeEach(() => {
                  detail = after.calls.mostRecent().args[0].detail;
                });

                then("the removed id is correct", () => {
                  expect(detail.id).toBe(node.id);
                });
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
          repo = storage.repository<Node>(tables[1]);
        });

        and("the repository already holds a node", () => {
          beforeEach(async () => {
            await repo.add(node);
          });

          and("a listener is registered for repository errors", () => {
            let listener: jasmine.Spy;
            let error: unknown;

            beforeEach(() => {
              listener = jasmine.createSpy("onerror");
              storage.addEventListener(Event.ON_ERROR, listener);
            });

            when("the same id is added a second time", () => {
              beforeEach(async () => {
                try {
                  await repo.add(node);
                } catch (e) {
                  error = e;
                }
              });

              then("`repo.add()` rejects", () => {
                expect(error).toBeTruthy();
              });

              then("`ON_ERROR` is dispatched on the storage", () => {
                expect(listener).toHaveBeenCalled();
              });

              and("the error event detail is inspected", () => {
                let detail: {
                  operation: Operation;
                  table: string;
                  id: string;
                  error: unknown;
                };

                beforeEach(() => {
                  detail = listener.calls.mostRecent().args[0].detail;
                });

                then("the error event operation is `Operation.ADD`", () => {
                  expect(detail.operation).toBe(Operation.ADD);
                });

                then("the error event table is correct", () => {
                  expect(detail.table).toBe(tables[1]);
                });

                then("the error event id is correct", () => {
                  expect(detail.id).toBe(node.id);
                });

                then("the error event contains an error", () => {
                  expect(detail.error).toBeTruthy();
                });
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
      let repo: Repository<Node>;

      beforeEach(() => {
        storage = new Storage(configuration);
      });

      and("a node repository is obtained", () => {
        beforeEach(() => {
          repo = storage.repository<Node>(tables[1]);
        });

        and("a listener is registered for repository errors", () => {
          let listener: jasmine.Spy;

          beforeEach(() => {
            listener = jasmine.createSpy("onerror");
            storage.addEventListener(Event.ON_ERROR, listener);
          });

          when("`repo.retrieve()` runs", () => {
            let error: unknown;

            beforeEach(async () => {
              try {
                await repo.retrieve();
              } catch (result) {
                error = result;
              }
            });

            then("`repo.retrieve()` rejects", () => {
              expect(error).toBeTruthy();
            });

            then("`ON_ERROR` is dispatched for retrieve", () => {
              expect(listener).toHaveBeenCalled();
            });

            and("the retrieve error event detail is inspected", () => {
              let detail: {
                operation: Operation;
                table: string;
                error: unknown;
              };

              beforeEach(() => {
                detail = listener.calls.mostRecent().args[0].detail;
              });

              then(
                "the retrieve error operation is `Operation.RETRIEVE`",
                () => {
                  expect(detail.operation).toBe(Operation.RETRIEVE);
                }
              );

              then("the retrieve error table is correct", () => {
                expect(detail.table).toBe(tables[1]);
              });

              then("the retrieve error contains an error", () => {
                expect(detail.error).toBeTruthy();
              });
            });
          });

          when("`repo.update(node)` runs", () => {
            let error: unknown;

            beforeEach(async () => {
              try {
                await repo.update(updatedNode);
              } catch (result) {
                error = result;
              }
            });

            then("`repo.update()` rejects", () => {
              expect(error).toBeTruthy();
            });

            then("`ON_ERROR` is dispatched for update", () => {
              expect(listener).toHaveBeenCalled();
            });

            and("the update error event detail is inspected", () => {
              let detail: {
                operation: Operation;
                table: string;
                id: string;
                error: unknown;
              };

              beforeEach(() => {
                detail = listener.calls.mostRecent().args[0].detail;
              });

              then("the update error operation is `Operation.UPDATE`", () => {
                expect(detail.operation).toBe(Operation.UPDATE);
              });

              then("the update error table is correct", () => {
                expect(detail.table).toBe(tables[1]);
              });

              then("the update error id is correct", () => {
                expect(detail.id).toBe(updatedNode.id);
              });

              then("the update error contains an error", () => {
                expect(detail.error).toBeTruthy();
              });
            });
          });

          when("`repo.getById(id)` runs", () => {
            let error: unknown;

            beforeEach(async () => {
              try {
                await repo.getById(node.id);
              } catch (result) {
                error = result;
              }
            });

            then("`repo.getById()` rejects", () => {
              expect(error).toBeTruthy();
            });

            then("`ON_ERROR` is dispatched for getById", () => {
              expect(listener).toHaveBeenCalled();
            });

            and("the getById error event detail is inspected", () => {
              let detail: {
                operation: Operation;
                table: string;
                id: string;
                error: unknown;
              };

              beforeEach(() => {
                detail = listener.calls.mostRecent().args[0].detail;
              });

              then(
                "the getById error operation is `Operation.RETRIEVE`",
                () => {
                  expect(detail.operation).toBe(Operation.RETRIEVE);
                }
              );

              then("the getById error table is correct", () => {
                expect(detail.table).toBe(tables[1]);
              });

              then("the getById error id is correct", () => {
                expect(detail.id).toBe(node.id);
              });

              then("the getById error contains an error", () => {
                expect(detail.error).toBeTruthy();
              });
            });
          });

          when("`repo.exists(id)` runs", () => {
            let error: unknown;

            beforeEach(async () => {
              try {
                await repo.exists(node.id);
              } catch (result) {
                error = result;
              }
            });

            then("`repo.exists()` rejects", () => {
              expect(error).toBeTruthy();
            });

            then("`ON_ERROR` is dispatched for exists", () => {
              expect(listener).toHaveBeenCalled();
            });

            and("the exists error event detail is inspected", () => {
              let detail: {
                operation: Operation;
                table: string;
                id: string;
                error: unknown;
              };

              beforeEach(() => {
                detail = listener.calls.mostRecent().args[0].detail;
              });

              then("the exists error operation is `Operation.RETRIEVE`", () => {
                expect(detail.operation).toBe(Operation.RETRIEVE);
              });

              then("the exists error table is correct", () => {
                expect(detail.table).toBe(tables[1]);
              });

              then("the exists error id is correct", () => {
                expect(detail.id).toBe(node.id);
              });

              then("the exists error contains an error", () => {
                expect(detail.error).toBeTruthy();
              });
            });
          });

          when("`repo.remove(id)` runs", () => {
            let error: unknown;

            beforeEach(async () => {
              try {
                await repo.remove(node.id);
              } catch (result) {
                error = result;
              }
            });

            then("`repo.remove()` rejects", () => {
              expect(error).toBeTruthy();
            });

            then("`ON_ERROR` is dispatched for remove", () => {
              expect(listener).toHaveBeenCalled();
            });

            and("the remove error event detail is inspected", () => {
              let detail: {
                operation: Operation;
                table: string;
                id: string;
                error: unknown;
              };

              beforeEach(() => {
                detail = listener.calls.mostRecent().args[0].detail;
              });

              then("the remove error operation is `Operation.REMOVE`", () => {
                expect(detail.operation).toBe(Operation.REMOVE);
              });

              then("the remove error table is correct", () => {
                expect(detail.table).toBe(tables[1]);
              });

              then("the remove error id is correct", () => {
                expect(detail.id).toBe(node.id);
              });

              then("the remove error contains an error", () => {
                expect(detail.error).toBeTruthy();
              });
            });
          });

          when("`repo.clear()` runs", () => {
            let error: unknown;

            beforeEach(async () => {
              try {
                await repo.clear();
              } catch (result) {
                error = result;
              }
            });

            then("`repo.clear()` rejects", () => {
              expect(error).toBeTruthy();
            });

            then("`ON_ERROR` is dispatched for clear", () => {
              expect(listener).toHaveBeenCalled();
            });

            and("the clear error event detail is inspected", () => {
              let detail: {
                operation: Operation;
                table: string;
                error: unknown;
              };

              beforeEach(() => {
                detail = listener.calls.mostRecent().args[0].detail;
              });

              then("the clear error operation is `Operation.REMOVE`", () => {
                expect(detail.operation).toBe(Operation.REMOVE);
              });

              then("the clear error table is correct", () => {
                expect(detail.table).toBe(tables[1]);
              });

              then("the clear error contains an error", () => {
                expect(detail.error).toBeTruthy();
              });
            });
          });
        });
      });
    });
  });
});

events(Event.ON_ERROR, () => {
  given("a repository transaction fails without an IndexedDB error", () => {
    let repo: Repository<Node>;
    let dispatchEvent: jasmine.Spy;
    let transaction: {
      objectStore: jasmine.Spy;
      error: Error | null;
      oncomplete?: () => void;
      onerror?: () => void;
      onabort?: () => void;
    };

    beforeEach(() => {
      const request = {
        result: [] as Node[],
        error: null
      } as unknown as IDBRequest<Node[]>;
      const store = {
        getAll: jasmine.createSpy("getAll").and.returnValue(request)
      } as unknown as IDBObjectStore;

      transaction = {
        objectStore: jasmine.createSpy("objectStore").and.returnValue(store),
        error: null
      };

      dispatchEvent = jasmine.createSpy("dispatchEvent");

      repo = new Repository<Node>(
        {
          database: {
            transaction: jasmine
              .createSpy("transaction")
              .and.returnValue(transaction)
          } as unknown as IDBDatabase,
          dispatchEvent
        } as unknown as Storage,
        tables[1]
      );
    });

    when("`repo.retrieve()` runs", () => {
      let error: unknown;

      beforeEach(async () => {
        const pending = repo.retrieve().catch((result) => {
          error = result;
        });

        transaction.onerror?.();
        await pending;
      });

      then("`repo.retrieve()` rejects with the fallback error", () => {
        expect((error as Error).message).toBe("Transaction failed");
      });

      then("`ON_ERROR` is dispatched for the failed transaction", () => {
        expect(dispatchEvent).toHaveBeenCalled();
      });

      and("the failed transaction event detail is inspected", () => {
        let detail: {
          operation: Operation;
          table: string;
          error: Error;
        };

        beforeEach(() => {
          detail = (dispatchEvent.calls.mostRecent().args[0] as CustomEvent)
            .detail;
        });

        then("the failed transaction operation is `Operation.RETRIEVE`", () => {
          expect(detail.operation).toBe(Operation.RETRIEVE);
        });

        then("the failed transaction table is correct", () => {
          expect(detail.table).toBe(tables[1]);
        });

        then("the failed transaction error message is correct", () => {
          expect(detail.error.message).toBe("Transaction failed");
        });
      });
    });
  });
});

events(Event.ON_ERROR, () => {
  given("a repository transaction aborts without an IndexedDB error", () => {
    let repo: Repository<Node>;
    let dispatchEvent: jasmine.Spy;
    let transaction: {
      objectStore: jasmine.Spy;
      error: Error | null;
      oncomplete?: () => void;
      onerror?: () => void;
      onabort?: () => void;
    };

    beforeEach(() => {
      const request = {
        result: undefined,
        error: null
      } as unknown as IDBRequest<undefined>;
      const store = {
        delete: jasmine.createSpy("delete").and.returnValue(request)
      } as unknown as IDBObjectStore;

      transaction = {
        objectStore: jasmine.createSpy("objectStore").and.returnValue(store),
        error: null
      };

      dispatchEvent = jasmine.createSpy("dispatchEvent");

      repo = new Repository<Node>(
        {
          database: {
            transaction: jasmine
              .createSpy("transaction")
              .and.returnValue(transaction)
          } as unknown as IDBDatabase,
          dispatchEvent
        } as unknown as Storage,
        tables[1]
      );
    });

    when("`repo.remove(id)` runs", () => {
      let error: unknown;

      beforeEach(async () => {
        const pending = repo.remove(node.id).catch((result) => {
          error = result;
        });

        transaction.onabort?.();
        await pending;
      });

      then("`repo.remove()` rejects with the abort fallback error", () => {
        expect((error as Error).message).toBe("Transaction was aborted");
      });

      then("`ON_ERROR` is dispatched for the aborted transaction", () => {
        expect(dispatchEvent).toHaveBeenCalled();
      });

      and("the aborted transaction event detail is inspected", () => {
        let detail: {
          operation: Operation;
          table: string;
          id: string;
          error: Error;
        };

        beforeEach(() => {
          detail = (dispatchEvent.calls.mostRecent().args[0] as CustomEvent)
            .detail;
        });

        then("the aborted transaction operation is `Operation.REMOVE`", () => {
          expect(detail.operation).toBe(Operation.REMOVE);
        });

        then("the aborted transaction table is correct", () => {
          expect(detail.table).toBe(tables[1]);
        });

        then("the aborted transaction id is correct", () => {
          expect(detail.id).toBe(node.id);
        });

        then("the aborted transaction error message is correct", () => {
          expect(detail.error.message).toBe("Transaction was aborted");
        });
      });
    });
  });
});
