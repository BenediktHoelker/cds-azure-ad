sap.ui.define(
  ["sap/ui/test/opaQunit", "./pages/SinglePlanningCalendar"],
  function (e) {
    "use strict";
    QUnit.module("Navigation Journey");
    e("Should see the initial page of the app", function (e, i, n) {
      e.iStartMyApp();
      n.onTheAppPage.iShouldSeeTheApp();
      n.iTeardownMyApp();
    });
  }
);
