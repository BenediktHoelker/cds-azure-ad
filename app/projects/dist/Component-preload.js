//@ui5-bundle iot/planner/projects/Component-preload.js
jQuery.sap.registerPreloadedModules({
  version: "2.0",
  modules: {
    "iot/planner/projects/Component.js": function () {
      sap.ui.define(["sap/fe/core/AppComponent"], function (e) {
        "use strict";
        return e.extend("iot.planner.projects.Component", {
          metadata: { manifest: "json" },
        });
      });
    },
    "iot/planner/projects/i18n/i18n.properties":
      "# This is the resource bundle for projects\r\n\r\n#Texts for manifest.json\r\n\r\n#XTIT: Application name\r\nappTitle=Display Projects\r\nappSubtitle=Find & Manage\r\n\r\n#YDES: Application description\r\nappDescription=Manage projects\r\n",
    "iot/planner/projects/manifest.json":
      "{\"_version\":\"1.9.0\",\"sap.cloud\":{\"public\":true,\"service\":\"iot.project.planner\"},\"sap.app\":{\"id\":\"iot.planner.projects\",\"type\":\"application\",\"i18n\":\"i18n/i18n.properties\",\"applicationVersion\":{\"version\":\"1.0.1\"},\"title\":\"{{appTitle}}\",\"description\":\"{{appDescription}}\",\"dataSources\":{\"mainService\":{\"uri\":\"admin/\",\"type\":\"OData\",\"settings\":{\"odataVersion\":\"4.0\"}}},\"crossNavigation\":{\"inbounds\":{\"iot-project-planning-projects-inbound\":{\"signature\":{\"parameters\":{},\"additionalParameters\":\"allowed\"},\"semanticObject\":\"Projects\",\"action\":\"display\",\"title\":\"{{appTitle}}\",\"subTitle\":\"{{appSubtitle}}\",\"icon\":\"sap-icon://workflow-tasks\",\"--indicatorDataSource\":{\"dataSource\":\"mainService\",\"path\":\"Projects/$count\",\"refresh\":120}}}},\"offline\":false,\"resources\":\"resources.json\",\"sourceTemplate\":{\"id\":\"ui5template.fiorielements.v4.lrop\",\"version\":\"1.0.0\"}},\"sap.ui\":{\"technology\":\"UI5\",\"icons\":{\"icon\":\"\",\"favIcon\":\"\",\"phone\":\"\",\"phone@2\":\"\",\"tablet\":\"\",\"tablet@2\":\"\"},\"deviceTypes\":{\"desktop\":true,\"tablet\":true,\"phone\":true}},\"sap.ui5\":{\"resources\":{\"js\":[],\"css\":[]},\"dependencies\":{\"minUI5Version\":\"1.76.0\",\"libs\":{\"sap.ui.core\":{},\"sap.fe.templates\":{}}},\"models\":{\"i18n\":{\"type\":\"sap.ui.model.resource.ResourceModel\",\"uri\":\"i18n/i18n.properties\"},\"\":{\"dataSource\":\"mainService\",\"preload\":true,\"settings\":{\"synchronizationMode\":\"None\",\"operationMode\":\"Server\",\"autoExpandSelect\":true,\"earlyRequests\":true}}},\"routing\":{\"routes\":[{\"pattern\":\":?query:\",\"name\":\"ProjectsList\",\"target\":\"ProjectsList\"},{\"pattern\":\"Projects({key}):?query:\",\"name\":\"ProjectsObjectPage\",\"target\":\"ProjectsObjectPage\"}],\"targets\":{\"ProjectsList\":{\"type\":\"Component\",\"id\":\"ProjectsList\",\"name\":\"sap.fe.templates.ListReport\",\"options\":{\"settings\":{\"entitySet\":\"Projects\",\"variantManagement\":\"Page\",\"navigation\":{\"Projects\":{\"detail\":{\"route\":\"ProjectsObjectPage\"}}},\"--controlConfiguration\":{\"@com.sap.vocabularies.UI.v1.LineItem\":{\"tableSettings\":{\"type\":\"GridTable\"}}}}}},\"ProjectsObjectPage\":{\"type\":\"Component\",\"id\":\"ProjectsObjectPage\",\"name\":\"sap.fe.templates.ObjectPage\",\"options\":{\"settings\":{\"entitySet\":\"Projects\"}}}}},\"contentDensities\":{\"compact\":true,\"cozy\":true}},\"sap.platform.abap\":{\"_version\":\"1.1.0\",\"uri\":\"\"},\"sap.platform.hcp\":{\"_version\":\"1.1.0\",\"uri\":\"\"},\"sap.fiori\":{\"_version\":\"1.1.0\",\"registrationIds\":[],\"archeType\":\"transactional\"}}",
  },
});
