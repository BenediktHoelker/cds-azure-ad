require("dotenv").config();
const uuid = require("uuid");
const cds = require("@sap/cds");

function transformEventToWorkItem({
  id,
  subject,
  start,
  end,
  categories: [customer_friendlyID],
  sensitivity,
  user,
}) {
  return {
    ID: id,
    title: subject,
    customer_friendlyID,
    activatedDate: start.dateTime.substring(0, 19) + "Z",
    completedDate: end.dateTime.substring(0, 19) + "Z",
    assignedTo_userPrincipalName: user,
    private: sensitivity === "private",
    type: "Event",
  };
}

module.exports = cds.service.impl(async function () {
  const db = await cds.connect.to("db");
  const AzDevOpsSrv = await cds.connect.to("AzureDevopsService");
  const MSGraphSrv = await cds.connect.to("MSGraphService");

  const { WorkItems } = db.entities("iot.planner");

  this.on("UPDATE", "MyWorkItems", async (req) => {
    const item = req.data;
    const entries = await this.read(WorkItems).where({ ID: item.ID });

    const durationInMS =
      new Date(item.completedDate) - new Date(item.activatedDate);
    const durationInH = durationInMS / 1000 / 60 / 60;

    item.duration = durationInH;

    if (entries.length === 0) db.run(INSERT.into(WorkItems).entries(item));
    else UPDATE(WorkItems, item).with(item);
  });

  this.on("CREATE", "MyWorkItems", async (req, next) => {
    // Create a V4 UUID (=> https://github.com/uuidjs/uuid#uuidv5name-namespace-buffer-offset)

    const durationInMS =
      new Date(req.data.completedDate) - new Date(req.data.activatedDate);
    const durationInH = durationInMS / 1000 / 60 / 60;

    const user = process.env.NODE_ENV
      ? req.user.id
      : "benedikt.hoelker@iot-online.de";

    req.data.ID = uuid.v4();
    req.data.type = "Manual";
    req.data.duration = durationInH;
    req.data.assignedTo_userPrincipalName = user;

    return next();
  });

  this.on("READ", "MyWorkItems", async (req) => {
    const {
      query: {
        SELECT: { where, columns, orderBy, limit },
      },
    } = req;

    const [devOpsWorkItems, localWorkItems, MSGraphEvents] = await Promise.all([
      AzDevOpsSrv.tx(req)
        .read("MyWorkItems", columns)
        .where(where)
        .orderBy(orderBy)
        .limit(limit),
      db.tx(req).run(req.query),
      MSGraphSrv.tx(req)
        .read("Events", columns)
        .where(where)
        .orderBy(orderBy)
        .limit(limit),
    ]);

    const MSGraphWorkItems = MSGraphEvents.map((event) =>
      transformEventToWorkItem({ ...event, user: req.user.id })
    );

    // Reihenfolge ist wichtig (bei gleicher ID wird erstes mit letzterem überschrieben)
    // TODO: Durch explizite Sortierung absichern.
    const map = [...devOpsWorkItems, MSGraphWorkItems, localWorkItems]
      .reduce((acc, item) => acc.concat(item), [])
      /*
        Nur Items mit ID und AssignedTo übernehmen
        => Verhindert, dass lokale Ergänzungen geladen werden, die in MSGraph oder DevOps gelöscht wurden
        */
      .filter((itm) => itm)
      .filter(({ ID, completedDate }) => !!ID && !!completedDate)
      .reduce((map, curr) => {
        map[curr.ID] = {
          ...map[curr.ID],
          ...curr,
        };
        return map;
      }, {});

    let results = Object.values(map);

    results.$count = results.length;
    return results;
  });

  this.on("READ", "WorkItems", async (req) => {
    // share request context with the external service
    // inside a custom handler
    const tx = AzDevOpsSrv.transaction(req);
    const response = await tx.run(req.query);

    return response;
  });
});
