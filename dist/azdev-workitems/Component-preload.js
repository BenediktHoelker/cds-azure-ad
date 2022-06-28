//@ui5-bundle iot/planner/azdevworkitems/Component-preload.js
jQuery.sap.registerPreloadedModules({
  version: "2.0",
  modules: {
    "iot/planner/azdevworkitems/Component.js": function () {
      sap.ui.define(["sap/fe/core/AppComponent"], function (e) {
        "use strict";
        return e.extend("iot.azdevworkitems.Component", {
          metadata: { manifest: "json" },
        });
      });
    },
    "iot/planner/azdevworkitems/i18n/i18n.properties":
      "# This is the resource bundle for azdev-workitems\r\n\r\n#Texts for manifest.json\r\n\r\n#XTIT: Application name\r\nappTitle=Display Azure DevOps Work Items\r\nappSubtitle=Find & Display\r\n\r\n#YDES: Application description\r\nappDescription=Find and display Azure DevOps Work Items\r\n",
    "iot/planner/azdevworkitems/manifest.json":
      '{"_version":"1.9.0","sap.cloud":{"public":true,"service":"iot.project.planner"},"sap.app":{"id":"iot.planner.azdevworkitems","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"1.0.1"},"title":"{{appTitle}}","description":"{{appDescription}}","dataSources":{"mainService":{"uri":"/azure-devops/","type":"OData","settings":{"odataVersion":"4.0"}}},"offline":false,"resources":"resources.json","sourceTemplate":{"id":"ui5template.fiorielements.v4.lrop","version":"1.0.0"},"crossNavigation":{"inbounds":{"iot-project-planning-azdevworkitems-inbound":{"signature":{"parameters":{},"additionalParameters":"allowed"},"semanticObject":"AzDevOpsWorkItem","action":"display","title":"{{appTitle}}","subTitle":"{{appSubtitle}}","icon":"sap-icon://developer-settings"}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"resources":{"js":[],"css":[]},"dependencies":{"minUI5Version":"1.76.0","libs":{"sap.ui.core":{},"sap.fe.templates":{}}},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/i18n.properties"},"":{"dataSource":"mainService","preload":true,"settings":{"synchronizationMode":"None","operationMode":"Server","autoExpandSelect":true,"earlyRequests":true}}},"routing":{"routes":[{"pattern":":?query:","name":"ItemsList","target":"ItemsList"},{"pattern":"Items({key}):?query:","name":"ItemsObjectPage","target":"ItemsObjectPage"}],"targets":{"ItemsList":{"type":"Component","id":"ItemsList","name":"sap.fe.templates.ListReport","options":{"settings":{"entitySet":"WorkItems","variantManagement":"Page","navigation":{"Items":{"detail":{"route":"ItemsObjectPage"}}}}}},"ItemsObjectPage":{"type":"Component","id":"ItemsObjectPage","name":"sap.fe.templates.ObjectPage","options":{"settings":{"entitySet":"WorkItems"}}}}},"contentDensities":{"compact":true,"cozy":true}},"sap.platform.abap":{"_version":"1.1.0","uri":""},"sap.platform.hcp":{"_version":"1.1.0","uri":""},"sap.fiori":{"_version":"1.1.0","registrationIds":[],"archeType":"transactional"}}',
  },
});
