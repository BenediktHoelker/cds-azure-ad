//@ui5-bundle iot/planner/workitemsalp/Component-preload.js
jQuery.sap.registerPreloadedModules({
  version: "2.0",
  modules: {
    "iot/planner/workitemsalp/Component.js": function () {
      sap.ui.define(
        ["sap/suite/ui/generic/template/lib/AppComponent"],
        function (e) {
          return e.extend("iot.planner.workitemsalp.Component", {
            metadata: { manifest: "json" },
          });
        }
      );
    },
    "iot/planner/workitemsalp/ext/AnalyticalListPageExt.controller.js":
      function () {
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
      },
    "iot/planner/workitemsalp/i18n/i18n.properties":
      "# This is the resource bundle for workitems-alp\r\n\r\n#Texts for manifest.json\r\n\r\n#XTIT: Application name\r\nappTitle=Analyze Work Items\r\nappSubtitle=ALP\r\n\r\n#YDES: Application description\r\nappDescription=Analytic List Page for analyizing Work Items",
    "iot/planner/workitemsalp/manifest.json":
      '{"_version":"1.28.0","sap.cloud":{"public":true,"service":"iot.project.planner"},"sap.app":{"id":"iot.planner.workitemsalp","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"1.0.1"},"title":"{{appTitle}}","description":"{{appDescription}}","tags":{"keywords":[]},"dataSources":{"mainService":{"uri":"/v2/analytics","type":"OData","settings":{"annotations":["annotation"],"localUri":"localService/metadata.xml","odataVersion":"2.0"}},"annotation":{"type":"ODataAnnotation","uri":"annotations/annotation.xml","settings":{"localUri":"annotations/annotation.xml"}}},"crossNavigation":{"inbounds":{"iot-project-planning-workitems-alp":{"signature":{"parameters":{},"additionalParameters":"allowed"},"semanticObject":"WorkItems","action":"analyze","title":"{{appTitle}}","subTitle":"{{appSubtitle}}","icon":"sap-icon://bar-chart"}}},"offline":false,"sourceTemplate":{"id":"ui5template.smartTemplate","version":"1.40.12"}},"sap.ui":{"technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true},"supportedThemes":["sap_hcb","sap_belize"]},"sap.ui5":{"resources":{"js":[],"css":[]},"dependencies":{"minUI5Version":"1.65.0","libs":{"sap.ui.core":{"lazy":false},"sap.ui.generic.app":{"lazy":false},"sap.suite.ui.generic.template":{"lazy":false}},"components":{}},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/i18n.properties","preload":false},"@i18n":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/i18n.properties"},"i18n|sap.suite.ui.generic.template.ListReport|WorkItems":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/ListReport/WorkItems/i18n.properties"},"i18n|sap.suite.ui.generic.template.ObjectPage|WorkItems":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/ObjectPage/WorkItems/i18n.properties"},"":{"dataSource":"mainService","preload":true,"settings":{"defaultBindingMode":"TwoWay","defaultCountMode":"Inline","refreshAfterChange":false,"metadataUrlParams":{"sap-value-list":"none"}}}},"extends":{"extensions":{"sap.ui.controllerExtensions":{"sap.suite.ui.generic.template.AnalyticalListPage.view.AnalyticalListPage":{"controllerName":"iot.planner.workitemsalp.ext.AnalyticalListPageExt"}}}},"contentDensities":{"compact":true,"cozy":true}},"sap.ui.generic.app":{"_version":"1.3.0","settings":{"forceGlobalRefresh":false,"objectPageHeaderType":"Dynamic","showDraftToggle":false},"pages":{"AnalyticalListPage|WorkItems":{"entitySet":"WorkItems","component":{"name":"sap.suite.ui.generic.template.AnalyticalListPage","list":true,"settings":{"condensedTableLayout":true,"showGoButtonOnFilterBar":false,"tableType":"AnalyticalTable","multiSelect":false,"qualifier":"","autoHide":true,"defaultFilterMode":"visual","smartVariantManagement":false,"keyPerformanceIndicators":{}}},"pages":{"ObjectPage|WorkItems":{"entitySet":"WorkItems","defaultLayoutTypeIfExternalNavigation":"MidColumnFullScreen","component":{"name":"sap.suite.ui.generic.template.ObjectPage"}}}}}},"sap.platform.abap":{"uri":""},"sap.fiori":{"registrationIds":[],"archeType":"transactional"},"sap.platform.hcp":{"uri":""}}',
  },
});
