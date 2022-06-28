//@ui5-bundle iot/project/planner/users/Component-preload.js
jQuery.sap.registerPreloadedModules({
  version: "2.0",
  modules: {
    "iot/project/planner/users/Component.js": function () {
      sap.ui.define(["sap/fe/core/AppComponent"], function (e) {
        "use strict";
        return e.extend("iot.project.planner.users.Component", {
          metadata: { manifest: "json" },
        });
      });
    },
    "iot/project/planner/users/i18n/i18n.properties":
      "# This is the resource bundle for users\r\n\r\n#Texts for manifest.json\r\n\r\n#XTIT: Application name\r\nappTitle=Display Users\r\nsubTitle=Find & Manage\r\n\r\n#YDES: Application description\r\nappDescription=Manage users, teams & their projects\r\n",
    "iot/project/planner/users/manifest.json":
      '{"_version":"1.32.0","sap.cloud":{"public":true,"service":"iot.project.planner"},"sap.app":{"id":"iot.project.planner.users","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"1.0.0"},"title":"{{appTitle}}","description":"{{appDescription}}","dataSources":{"mainService":{"uri":"/admin/","type":"OData","settings":{"odataVersion":"4.0"}}},"offline":false,"resources":"resources.json","sourceTemplate":{"id":"ui5template.fiorielements.v4.lrop","version":"1.0.0"},"crossNavigation":{"inbounds":{"iot-project-planning-users-inbound":{"signature":{"parameters":{},"additionalParameters":"allowed"},"semanticObject":"Users","action":"display","title":"{{appTitle}}","subTitle":"{{appSubtitle}}","icon":"sap-icon://account","--indicatorDataSource":{"dataSource":"mainService","path":"Users/$count","refresh":120}}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"resources":{"js":[],"css":[]},"dependencies":{"minUI5Version":"1.76.0","libs":{"sap.ui.core":{},"sap.fe.templates":{}}},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/i18n.properties"},"":{"dataSource":"mainService","preload":true,"settings":{"synchronizationMode":"None","operationMode":"Server","autoExpandSelect":true,"earlyRequests":true}}},"routing":{"routes":[{"pattern":":?query:","name":"UsersList","target":"UsersList"},{"pattern":"Users({key}):?query:","name":"UsersObjectPage","target":"UsersObjectPage"}],"targets":{"UsersList":{"type":"Component","id":"UsersList","name":"sap.fe.templates.ListReport","options":{"settings":{"entitySet":"Users","variantManagement":"Page","navigation":{"Users":{"detail":{"route":"UsersObjectPage"}}}}}},"UsersObjectPage":{"type":"Component","id":"UsersObjectPage","name":"sap.fe.templates.ObjectPage","options":{"settings":{"entitySet":"Users"}}}}},"contentDensities":{"compact":true,"cozy":true}},"sap.platform.abap":{"_version":"1.1.0","uri":""},"sap.platform.hcp":{"_version":"1.1.0","uri":""},"sap.fiori":{"_version":"1.1.0","registrationIds":[],"archeType":"transactional"}}',
  },
});
