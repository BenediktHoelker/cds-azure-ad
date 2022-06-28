sap.ui.define(
  [
    "sap/ui/core/util/MockServer",
    "sap/ui/model/json/JSONModel",
    "sap/base/util/UriParameters",
    "sap/base/Log",
  ],
  function (e, t, r, a) {
    "use strict";
    var o,
      i = "iot.singleplanningcalendar/",
      n = i + "localService/mockdata";
    var s = {
      init: function (s) {
        var u = s || {};
        return new Promise(function (s, c) {
          var p = sap.ui.require.toUrl(i + "manifest.json"),
            l = new t(p);
          l.attachRequestCompleted(function () {
            var t = new r(window.location.href),
              c = sap.ui.require.toUrl(n),
              p = l.getProperty("/sap.app/dataSources/mainService"),
              f = sap.ui.require.toUrl(i + p.settings.localUri),
              d =
                p.uri &&
                new URI(p.uri).absoluteTo(sap.ui.require.toUrl(i)).toString();
            if (!o) {
              o = new e({ rootUri: d });
            } else {
              o.stop();
            }
            e.config({
              autoRespond: true,
              autoRespondAfter: u.delay || t.get("serverDelay") || 500,
            });
            o.simulate(f, {
              sMockdataBaseUrl: c,
              bGenerateMissingMockData: true,
            });
            var g = o.getRequests();
            var m = function (e, t, r) {
              r.response = function (r) {
                r.respond(e, { "Content-Type": "text/plain;charset=utf-8" }, t);
              };
            };
            if (u.metadataError || t.get("metadataError")) {
              g.forEach(function (e) {
                if (e.path.toString().indexOf("$metadata") > -1) {
                  m(500, "metadata Error", e);
                }
              });
            }
            var v = u.errorType || t.get("errorType"),
              h = v === "badRequest" ? 400 : 500;
            if (v) {
              g.forEach(function (e) {
                m(h, v, e);
              });
            }
            o.setRequests(g);
            o.start();
            a.info("Running the app with mock data");
            s();
          });
          l.attachRequestFailed(function () {
            var e = "Failed to load application manifest";
            a.error(e);
            c(new Error(e));
          });
        });
      },
      getMockServer: function () {
        return o;
      },
    };
    return s;
  }
);
