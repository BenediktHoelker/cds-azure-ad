sap.ui.define([], function () {
  return sap.ui.controller(
    "iot.planner.workitemsalp.ext.AnalyticalListPageExt",
    {
      onBeforeRendering: async function () {
        const e = this.getView().byId(
          "iot.planner.workitemsalp::sap.suite.ui.generic.template.AnalyticalListPage.view.AnalyticalListPage::WorkItems--template::SmartFilterBar"
        );
        await e.getModel().metadataLoaded();
        const t = new Date(),
          a = t.getFullYear(),
          n = t.getMonth();
        const i = new Date(a, n, 1);
        const l = new Date(a, n + 1, 0);
        const o = {
          activatedDate: {
            ranges: [
              {
                exclude: false,
                keyField: "activatedDate",
                operation: "GE",
                value1: i,
              },
            ],
          },
          completedDate: {
            ranges: [
              {
                exclude: false,
                keyField: "completedDate",
                operation: "LE",
                value1: l,
              },
            ],
          },
        };
      },
    }
  );
});
