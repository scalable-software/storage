import {
  State,
  Activity,
  Status,
  Operation,
  Event
} from "@scalable.software/storage";

metadata(State.ACTIVITY, () => {
  and("Activity imported", () => {
    then("Activity is defined", () => {
      expect(Activity).toBeDefined();
    });

    and("Activity is defined", () => {
      then("Activity is an object", () => {
        expect(typeof Activity).toBe("object");
      });

      when("Activity is an object", () => {
        then("`Activity.IDLE` exists", () => {
          expect(Activity.IDLE).toBeDefined();
        });

        then("`Activity.CREATING` exists", () => {
          expect(Activity.CREATING).toBeDefined();
        });

        then("`Activity.OPENING` exists", () => {
          expect(Activity.OPENING).toBeDefined();
        });

        then("`Activity.DELETING` exists", () => {
          expect(Activity.DELETING).toBeDefined();
        });

        then("`Activity.ADDING` exists", () => {
          expect(Activity.ADDING).toBeDefined();
        });

        then("`Activity.RETRIEVING` exists", () => {
          expect(Activity.RETRIEVING).toBeDefined();
        });

        then("`Activity.UPDATING` exists", () => {
          expect(Activity.UPDATING).toBeDefined();
        });

        then("`Activity.REMOVING` exists", () => {
          expect(Activity.REMOVING).toBeDefined();
        });
      });
    });
  });
});

metadata(State.STATUS, () => {
  and("Status imported", () => {
    then("Status is defined", () => {
      expect(Status).toBeDefined();
    });

    and("Status is defined", () => {
      then("Status is an object", () => {
        expect(typeof Status).toBe("object");
      });

      when("Status is an object", () => {
        then("`Status.UNKNOWN` exists", () => {
          expect(Status.UNKNOWN).toBeDefined();
        });

        then("`Status.MISSING` exists", () => {
          expect(Status.MISSING).toBeDefined();
        });

        then("`Status.READY` exists", () => {
          expect(Status.READY).toBeDefined();
        });
      });
    });
  });
});

metadata(Metadata.OPERATION, () => {
  and("Operation imported", () => {
    then("Operation is defined", () => {
      expect(Operation).toBeDefined();
    });

    and("Operation is defined", () => {
      then("Operation is an object", () => {
        expect(typeof Operation).toBe("object");
      });

      when("Operation is an object", () => {
        then("`Operation.CREATE` exists", () => {
          expect(Operation.CREATE).toBeDefined();
        });

        then("`Operation.OPEN` exists", () => {
          expect(Operation.OPEN).toBeDefined();
        });

        then("`Operation.DELETE` exists", () => {
          expect(Operation.DELETE).toBeDefined();
        });

        then("`Operation.DISPOSE` exists", () => {
          expect(Operation.DISPOSE).toBeDefined();
        });

        then("`Operation.ADD` exists", () => {
          expect(Operation.ADD).toBeDefined();
        });

        then("`Operation.RETRIEVE` exists", () => {
          expect(Operation.RETRIEVE).toBeDefined();
        });

        then("`Operation.UPDATE` exists", () => {
          expect(Operation.UPDATE).toBeDefined();
        });

        then("`Operation.REMOVE` exists", () => {
          expect(Operation.REMOVE).toBeDefined();
        });
      });
    });
  });
});

metadata(Metadata.EVENT, () => {
  and("Event imported", () => {
    then("Event is defined", () => {
      expect(Event).toBeDefined();
    });

    and("Event is defined", () => {
      then("Event is an object", () => {
        expect(typeof Event).toBe("object");
      });

      when("Event is an object", () => {
        then("`Event.BEFORE_CREATE` exists", () => {
          expect(Event.BEFORE_CREATE).toBeDefined();
        });

        then("`Event.AFTER_CREATE` exists", () => {
          expect(Event.AFTER_CREATE).toBeDefined();
        });

        then("`Event.BEFORE_OPEN` exists", () => {
          expect(Event.BEFORE_OPEN).toBeDefined();
        });

        then("`Event.AFTER_OPEN` exists", () => {
          expect(Event.AFTER_OPEN).toBeDefined();
        });

        then("`Event.BEFORE_DELETE` exists", () => {
          expect(Event.BEFORE_DELETE).toBeDefined();
        });

        then("`Event.AFTER_DELETE` exists", () => {
          expect(Event.AFTER_DELETE).toBeDefined();
        });

        then("`Event.BEFORE_ADD` exists", () => {
          expect(Event.BEFORE_ADD).toBeDefined();
        });

        then("`Event.AFTER_ADD` exists", () => {
          expect(Event.AFTER_ADD).toBeDefined();
        });

        then("`Event.BEFORE_RETRIEVE` exists", () => {
          expect(Event.BEFORE_RETRIEVE).toBeDefined();
        });

        then("`Event.AFTER_RETRIEVE` exists", () => {
          expect(Event.AFTER_RETRIEVE).toBeDefined();
        });

        then("`Event.BEFORE_UPDATE` exists", () => {
          expect(Event.BEFORE_UPDATE).toBeDefined();
        });

        then("`Event.AFTER_UPDATE` exists", () => {
          expect(Event.AFTER_UPDATE).toBeDefined();
        });

        then("`Event.BEFORE_REMOVE` exists", () => {
          expect(Event.BEFORE_REMOVE).toBeDefined();
        });

        then("`Event.AFTER_REMOVE` exists", () => {
          expect(Event.AFTER_REMOVE).toBeDefined();
        });

        then("`Event.ON_ERROR` exists", () => {
          expect(Event.ON_ERROR).toBeDefined();
        });
      });
    });
  });
});
