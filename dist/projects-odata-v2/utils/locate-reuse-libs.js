(function (e) {
  fioriToolsGetManifestLibs = function (e) {
    var t = e;
    var a = "";
    var r = [
      "sap.apf",
      "sap.base",
      "sap.chart",
      "sap.collaboration",
      "sap.f",
      "sap.fe",
      "sap.fileviewer",
      "sap.gantt",
      "sap.landvisz",
      "sap.m",
      "sap.ndc",
      "sap.ovp",
      "sap.rules",
      "sap.suite",
      "sap.tnt",
      "sap.ui",
      "sap.uiext",
      "sap.ushell",
      "sap.uxap",
      "sap.viz",
      "sap.webanalytics",
      "sap.zen",
    ];
    return new Promise(function (n, i) {
      $.ajax(t)
        .done(function (e) {
          if (e) {
            if (
              e["sap.ui5"] &&
              e["sap.ui5"].dependencies &&
              e["sap.ui5"].dependencies.libs
            ) {
              Object.keys(e["sap.ui5"].dependencies.libs).forEach(function (e) {
                if (
                  !r.some(function (t) {
                    return e === t || e.startsWith(t + ".");
                  })
                ) {
                  if (a.length > 0) {
                    a = a + "," + e;
                  } else {
                    a = e;
                  }
                }
              });
            }
          }
          n(a);
        })
        .fail(function (t) {
          i(new Error("Could not fetch manifest at '" + e));
        });
    });
  };
  e.registerComponentDependencyPaths = function (e) {
    return fioriToolsGetManifestLibs(e).then(function (e) {
      if (e && e.length > 0) {
        var t = "/sap/bc/ui2/app_index/ui5_app_info?id=" + e;
        var a = jQuery.sap.getUriParameters().get("sap-client");
        if (a && a.length === 3) {
          t = t + "&sap-client=" + a;
        }
        return $.ajax(t).done(function (e) {
          if (e) {
            Object.keys(e).forEach(function (t) {
              var a = e[t];
              if (a && a.dependencies) {
                a.dependencies.forEach(function (e) {
                  if (e.url && e.url.length > 0 && e.type === "UI5LIB") {
                    jQuery.sap.log.info(
                      "Registering Library " +
                        e.componentId +
                        " from server " +
                        e.url
                    );
                    jQuery.sap.registerModulePath(e.componentId, e.url);
                  }
                });
              }
            });
          }
        });
      }
    });
  };
})(sap);
var scripts = document.getElementsByTagName("script");
var currentScript = scripts[scripts.length - 1];
var manifestUri = currentScript.getAttribute("data-sap-ui-manifest-uri");
var componentName = currentScript.getAttribute("data-sap-ui-componentName");
var useMockserver = currentScript.getAttribute("data-sap-ui-use-mockserver");
sap
  .registerComponentDependencyPaths(manifestUri)
  .catch(function (e) {
    jQuery.sap.log.error(e);
  })
  .finally(function () {
    sap.ui.getCore().attachInit(function () {
      jQuery.sap.require("jquery.sap.resources");
      var e = sap.ui.getCore().getConfiguration().getLanguage();
      var t = jQuery.sap.resources({ url: "i18n/i18n.properties", locale: e });
      document.title = t.getText("appTitle");
    });
    if (componentName && componentName.length > 0) {
      if (useMockserver && useMockserver === "true") {
        sap.ui.getCore().attachInit(function () {
          sap.ui.require(
            [componentName.replace(/\./g, "/") + "/localService/mockserver"],
            function (e) {
              e.init();
              sap.ushell.Container.createRenderer().placeAt("content");
            }
          );
        });
      } else {
        sap.ui.require(["sap/ui/core/ComponentSupport"]);
        sap.ui.getCore().attachInit(function () {
          jQuery.sap.require("jquery.sap.resources");
          var e = sap.ui.getCore().getConfiguration().getLanguage();
          var t = jQuery.sap.resources({
            url: "i18n/i18n.properties",
            locale: e,
          });
          document.title = t.getText("appTitle");
        });
      }
    } else {
      sap.ui.getCore().attachInit(function () {
        sap.ushell.Container.createRenderer().placeAt("content");
      });
    }
  });
sap.registerComponentDependencyPaths(manifestUri);
