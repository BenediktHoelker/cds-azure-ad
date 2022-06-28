//@ui5-bundle iot/customers/Component-preload.js
jQuery.sap.registerPreloadedModules({
  version: "2.0",
  modules: {
    "iot/customers/Component.js": function () {
      sap.ui.define(["sap/fe/core/AppComponent"], function (e) {
        "use strict";
        return e.extend("iot.customers.Component", {
          metadata: { manifest: "json" },
        });
      });
    },
    "iot/customers/i18n/i18n.properties":
      "# This is the resource bundle for customers\r\n\r\n#Texts for manifest.json\r\n\r\n#XTIT: Application name\r\nappTitle=Customers\r\nappSubtitle=Find & Manage\r\n\r\n#YDES: Application description\r\nappDescription=Find and display customers\r\n",
    "iot/customers/manifest.json":
      '{"_version":"1.1.0","sap.cloud":{"public":true,"service":"iot.project.planner"},"sap.app":{"id":"iot.customers","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"1.0.1"},"title":"{{appTitle}}","description":"{{appDescription}}","dataSources":{"mainService":{"uri":"/admin/","type":"OData","settings":{"odataVersion":"4.0"}}},"offline":false,"resources":"resources.json","sourceTemplate":{"id":"ui5template.fiorielements.v4.lrop","version":"1.0.0"},"crossNavigation":{"inbounds":{"fiori-customers-inbound":{"signature":{"parameters":{},"additionalParameters":"allowed"},"semanticObject":"Customer","action":"display","title":"{{appTitle}}","subTitle":"{{appSubtitle}}","icon":"sap-icon://customer","--indicatorDataSource":{"dataSource":"mainService","path":"Customers/$count","refresh":120}}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"resources":{"js":[],"css":[]},"dependencies":{"minUI5Version":"1.76.0","libs":{"sap.ui.core":{},"sap.fe.templates":{}}},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/i18n.properties"},"":{"dataSource":"mainService","preload":true,"settings":{"synchronizationMode":"None","operationMode":"Server","autoExpandSelect":true,"earlyRequests":true}}},"routing":{"routes":[{"pattern":":?query:","name":"CustomersList","target":"CustomersList"},{"pattern":"Customers({key}):?query:","name":"CustomersObjectPage","target":"CustomersObjectPage"},{"pattern":"Customers({key})/projects({key2}):?query:","name":"ProjectsObjectPage","target":"ProjectsObjectPage"}],"targets":{"CustomersList":{"type":"Component","id":"CustomersList","name":"sap.fe.templates.ListReport","options":{"settings":{"entitySet":"Customers","variantManagement":"Page","navigation":{"Customers":{"detail":{"route":"CustomersObjectPage"}}}}}},"CustomersObjectPage":{"type":"Component","id":"CustomersObjectPage","name":"sap.fe.templates.ObjectPage","options":{"settings":{"entitySet":"Customers","navigation":{"projects":{"detail":{"route":"ProjectsObjectPage"}}}}}},"ProjectsObjectPage":{"type":"Component","id":"ProjectsObjectPage","name":"sap.fe.templates.ObjectPage","options":{"settings":{"entitySet":"Projects"}}}}},"contentDensities":{"compact":true,"cozy":true}},"sap.platform.abap":{"_version":"1.1.0","uri":""},"sap.platform.hcp":{"_version":"1.1.0","uri":""},"sap.fiori":{"_version":"1.1.0","registrationIds":[],"archeType":"transactional"}}',
  },
});
