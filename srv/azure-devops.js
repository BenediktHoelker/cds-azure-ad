const MAP_DEVOPS_TO_CDS_NAMES = {
  ID: "id",
  assignedTo: "[System.AssignedTo]",
  assignedTo_userPrincipalName: "[System.AssignedTo]",
  changedDate: "System.ChangedDate",
  createdDate: "System.CreatedDate",
  reason: "System.Reason",
  state: "System.State",
  teamProject: "System.TeamProject",
  title: "System.Title",
  workItemType: "System.WorkItemType",
  // Documentation
  activatedDate: "[Microsoft.VSTS.Common.ActivatedDate]",
  resolvedDate: "[Microsoft.VSTS.Common.ResolvedDate]",
  closedDate: "[Microsoft.VSTS.Common.ClosedDate]",
  completedDate: "[Microsoft.VSTS.Common.ClosedDate]",
  // Scheduling
  completedWork: "Microsoft.VSTS.Scheduling.CompletedWork",
  remainingWork: "Microsoft.VSTS.Scheduling.RemainingWork",
  originalEstimate: "Microsoft.VSTS.Scheduling.OriginalEstimate",
  // Custom
  ticket: "Custom.Ticket",
  customer_friendlyID: "Custom.Kunde",
  project_friendlyID: "Custom.Projekt",
};

function destructureDevOpsObj(devOpsObj) {
  let cds = {};
  ({
    id: cds.ID,
    "System.AssignedTo": { uniqueName: cds.assignedTo_userPrincipalName },
    "System.AssignedTo": { displayName: cds.assignedToName },
    "System.ChangedDate": cds.changedDate,
    "System.CreatedDate": cds.createdDate,
    "System.Reason": cds.reason,
    "System.State": cds.state,
    "System.TeamProject": cds.teamProject,
    "System.Title": cds.title,
    "System.WorkItemType": cds.workItemType,
    // Documentation
    "Microsoft.VSTS.Common.ActivatedDate": cds.activatedDate,
    "Microsoft.VSTS.Common.ResolvedDate": cds.resolvedDate,
    "Microsoft.VSTS.Common.ClosedDate": cds.closedDate,
    // Scheduling
    "Microsoft.VSTS.Scheduling.CompletedWork": cds.completedWork,
    "Microsoft.VSTS.Scheduling.RemainingWork": cds.remainingWork,
    "Microsoft.VSTS.Scheduling.OriginalEstimate": cds.originalEstimate,
    // Custom
    "Custom.Ticket": cds.ticket,
    "Custom.Kunde": cds.customer_friendlyID,
    "Custom.Projekt": cds.project_friendlyID,
  } = devOpsObj);
  return cds;
}

function getSubstringBetween(string, begin, end) {
  const substringBetween = string.substring(
    string.lastIndexOf(begin) + begin.length,
    string.lastIndexOf(end)
  );

  return substringBetween;
}

function getWhereClause({ sql, values }) {
  if (!sql || !sql.includes("WHERE")) return "";

  const genericWhereClause = getSubstringBetween(sql, "WHERE", "ORDER BY");

  const whereClause = values.reduce((string, value) => {
    let replace = value;

    if (isISODate(value)) {
      replace = replace.substring(0, 10);
    }

    return string.replace("?", `'${replace}'`);
  }, genericWhereClause);

  return "AND" + whereClause;
}

function transformToWIQL(substring) {
  const substrings = substring.split(" ");

  const WIQL = substrings
    .filter((str) => str.length > 0)
    .reduce((str, substr) => {
      const next = getDevOpsFieldName(substr) || substr;
      const result = str.concat(` ${next}`);
      return result;
    }, "");

  return WIQL;
}

function getDevOpsFieldName(CDSName) {
  return MAP_DEVOPS_TO_CDS_NAMES[CDSName];
}

function isISODate(str) {
  // Regex-Source: https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
  const dateRegexp = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;

  return dateRegexp.test(str);
}

async function getWorkItemsFromDevOps({ req, restrictToOwnUser, workItemAPI }) {
  const user = process.env.NODE_ENV
    ? req.user.id
    : "benedikt.hoelker@iot-online.de";

  let SQLString = "";
  try {
    const { SelectBuilder } = require("@sap/cds-runtime/lib/db/sql-builder");
    const selectBuilder = new SelectBuilder(req.query);
    SQLString = selectBuilder.build();
  } catch (error) {
    return [];
    // whereClause = `[System.Id] = '${req.data.ID}'`;
  }

  const whereClause = getWhereClause(SQLString);
  const whereClauseFilterByAssignedTo = restrictToOwnUser
    ? `${whereClause} AND assignedTo = '${user}'`
    : whereClause;
  const WIQLWhereClause = transformToWIQL(whereClauseFilterByAssignedTo);

  const workItemsByWIQL = await workItemAPI.queryByWiql({
    query: `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = 'IOT Projekte' AND [System.WorkItemType] <> '' ${WIQLWhereClause}`,
  });

  const ids = workItemsByWIQL.workItems.map(({ id }) => id);
  const wiDetails = (await workItemAPI.getWorkItems(ids)) || [];
  const results = wiDetails
    // Using map + reduce because flatMap is not supported by the NodeJS-version on BTP
    .map((item) => ({ id: item.id.toString(), ...item.fields }))
    .reduce((acc, item) => acc.concat(item), [])
    .filter((item) => !!item["Microsoft.VSTS.Common.ActivatedDate"])
    .map((DevOpsObject) => {
      let CDSObject = destructureDevOpsObj(DevOpsObject);

      for (let [key, value] of Object.entries(CDSObject)) {
        if (isISODate(value)) {
          // Strip milliseconds: https://stackoverflow.com/questions/31171810/stripping-milliseconds-from-extended-iso-format
          CDSObject[key] = value.substring(0, 19) + "Z";
        }
      }

      CDSObject.completedDate = CDSObject.closedDate || CDSObject.resolvedDate;
      CDSObject.type = "WorkItem";
      return CDSObject;
    });

  // Adds the OData-inlinecount
  results.$count = results.length;
  return results;
}

async function getEventsFromMSGraph({ req, MSGraphSrv }) {
  const user = process.env.NODE_ENV
    ? req.user.id
    : "benedikt.hoelker@iot-online.de";

  let events = [];
  let queryString = "";

  try {
    if (req.data.ID) queryString = `/${req.data.ID}`;
    else {
      queryString = Object.entries(req._query)
        .filter(([key]) => !key.includes("$select"))
        .reduce(
          (str, [key, value]) => str.concat("&", key, "=", value),
          "?$select=id,subject,start,end,categories,sensitivity"
        )
        // TODO: Replace with a better transformation
        .replace("completedDate", "end/dateTime")
        .replace("activatedDate", "start/dateTime")
        .replace(/\+01:00/g, "Z")
        // Leading Apostrophe
        .replace(/202/g, "'202")
        // Closing Apostrophe
        .replace(/Z/g, "Z'");
    }

    const { value } = await MSGraphSrv.run({
      url: `/v1.0/users/${user}/events${queryString}`,
    });

    events = value.map(
      // Die Kategorie wird als Kunde ausgelesen
      ({
        id,
        subject,
        start,
        end,
        categories: [customer_friendlyID],
        sensitivity,
      }) => ({
        ID: id,
        title: subject,
        customer_friendlyID,
        activatedDate: start.dateTime.substring(0, 19) + "Z",
        completedDate: end.dateTime.substring(0, 19) + "Z",
        assignedTo_userPrincipalName: user,
        private: sensitivity === "private",
        type: "Event",
      })
    );
  } catch (error) {
    console.log("An error occured");
    // TODO: Implement error handling
  }

  return events;
}

require("dotenv").config();

module.exports = cds.service.impl(async function () {
  const cdsapi = require("@sapmentors/cds-scp-api");
  const MSGraphSrv = await cdsapi.connect.to("MicrosoftGraphIOTGmbH");

  const azdev = require("azure-devops-node-api");
  const orgUrl = "https://dev.azure.com/iot-gmbh";
  const token = process.env.AZURE_PERSONAL_ACCESS_TOKEN;
  const authHandler = azdev.getPersonalAccessTokenHandler(token);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  const workItemAPI = await connection.getWorkItemTrackingApi();

  const uuid = require("uuid");
  const db = await cds.connect.to("db");

  this.on("UPDATE", "MyWork", async (req) => {
    const tx = db.tx(req);
    const item = req.data;
    const entries = await tx
      .read("iot.planner.WorkItems")
      .where({ ID: item.ID });

    const durationInMS =
      new Date(item.completedDate) - new Date(item.activatedDate);
    const durationInH = durationInMS / 1000 / 60 / 60;

    item.duration = durationInH;

    if (entries.length === 0)
      db.run(INSERT.into("iot.planner.WorkItems").entries(item));
    else UPDATE("iot.planner.WorkItems", item).with(item);
  });

  this.on("CREATE", "MyWork", (req, next) => {
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

  this.on("READ", "MyWork", async (req) => {
    const tx = db.tx(req);
    let results = [];
    try {
      // Reihenfolge ist wichtig (bei gleicher ID wird erstes mit letzterem überschrieben)
      // TODO: Durch explizite Sortierung absichern.
      const [devOps, MSGraph, local] = await Promise.all([
        getWorkItemsFromDevOps({
          req,
          restrictToOwnUser: true,
          workItemAPI,
        }),
        getEventsFromMSGraph({ req, MSGraphSrv }),
        tx.run(req.query),
      ]);

      const map = [...devOps, MSGraph, local]
        .reduce((acc, item) => acc.concat(item), [])
        /* Nur Items mit ID und AssignedTo übernehmen
           => Verhindert, dass lokale Ergänzungen geladen werden, die in MSGraph oder DevOps gelöscht wurden
        */
        .filter((itm) => itm)
        .filter(({ ID, completedDate }) => !!ID && !!completedDate)
        .reduce((acc, curr) => {
          acc[curr.ID] = {
            ...acc[curr.ID],
            ...curr,
          };
          return acc;
        }, {});

      results = Object.values(map);
    } catch (error) {
      // Do nothing
    }

    results.$count = results.length;
    return results;
  });

  this.on("READ", "WorkItems", async (req) =>
    getWorkItemsFromDevOps({ req, restrictToOwnUser: false, workItemAPI })
  );

  this.on("READ", "MyWorkItems", async (req) =>
    getWorkItemsFromDevOps({ req, restrictToOwnUser: false, workItemAPI })
  );
});