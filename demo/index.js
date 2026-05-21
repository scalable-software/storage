import { Event, Storage } from "@scalable.software/storage";

const Table = {
  NODES: "nodes"
};

const output = document.querySelector("#output");
const runButton = document.querySelector("#run");
const resetButton = document.querySelector("#reset");

const storage = new Storage({
  name: "demo.storage",
  version: 1,
  tables: [Table.NODES]
});

const write = (message) => {
  if (!output) {
    return;
  }

  output.textContent += `${message}\n`;
};

const attachEvents = () => {
  storage.addEventListener(Event.BEFORE_CREATE, () => write("beforecreate"));
  storage.addEventListener(Event.AFTER_CREATE, () => write("aftercreate"));
  storage.addEventListener(Event.BEFORE_ADD, (event) =>
    write(`beforeadd: ${event.detail.table}`)
  );
  storage.addEventListener(Event.AFTER_ADD, (event) =>
    write(`afteradd: ${event.detail.table}`)
  );
  storage.addEventListener(Event.AFTER_UPDATE, (event) =>
    write(`afterupdate: ${event.detail.id}`)
  );
  storage.addEventListener(Event.AFTER_RETRIEVE, (event) =>
    write(`afterretrieve: ${event.detail.table}`)
  );
  storage.addEventListener(Event.ON_ERROR, (event) => {
    write(`error (${event.detail.operation}): ${String(event.detail.error)}`);
  });
};

const runExample = async () => {
  if (output) {
    output.textContent = "";
  }

  write("creating/opening database...");
  await storage.create();

  const repo = storage.repository(Table.NODES);

  write("adding node 1...");
  await repo.add({
    id: "1",
    name: "Start",
    type: "start",
    coordinates: { x: 0, y: 400 },
    icon: "icon.svg"
  });

  write("updating node 1...");
  await repo.update({
    id: "1",
    name: "Start Updated",
    type: "start",
    coordinates: { x: 10, y: 410 },
    icon: "icon.svg"
  });

  write("retrieving nodes...");
  const nodes = await repo.retrieve();
  write(JSON.stringify(nodes, null, 2));
};

const resetExample = async () => {
  if (output) {
    output.textContent = "";
  }

  await storage.delete();
  write("database deleted");
};

attachEvents();

runButton?.addEventListener("click", () => {
  runExample().catch((error) => {
    write(`run failed: ${String(error)}`);
  });
});

resetButton?.addEventListener("click", () => {
  resetExample().catch((error) => {
    write(`delete failed: ${String(error)}`);
  });
});
