sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
  function (Controller, History) {
    "use strict";

    return Controller.extend(
      "iot.singleplanningcalendar.controller.BaseController",
      {
        /**
         * Convenience method for accessing the router in every controller of the application.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
          return this.getOwnerComponent().getRouter();
        },

        /**
         * Convenience method for getting the view model by name in every controller of the application.
         * @public
         * @param {string} sName the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
          return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model in every controller of the application.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
          return this.getView().setModel(oModel, sName);
        },

        /**
         * Convenience method for getting the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        async read({ path, ...params }) {
          return new Promise((resolve, reject) => {
            this.getModel("OData").read(path, {
              ...params,
              success: resolve,
              error: reject,
            });
          });
        },

        async update({ path, data }) {
          return new Promise((resolve, reject) => {
            this.getModel("OData").update(path, data, {
              success: resolve,
              error: reject,
            });
          });
        },

        async create({ path, data }) {
          return new Promise((resolve, reject) => {
            this.getModel("OData").create(path, data, {
              success: resolve,
              error: reject,
            });
          });
        },

        async reset({ path, data }) {
          return new Promise((resolve, reject) => {
            this.getModel("OData").update(
              path,
              { ...data, resetEntry: true },
              {
                success: resolve,
                error: reject,
              }
            );
          });
        },

        async remove({ path, data: { ID, activatedDate, completedDate } }) {
          return new Promise((resolve, reject) => {
            this.getModel("OData").update(
              path,
              {
                ID,
                activatedDate,
                completedDate,
                // Dummy-GUIDs in order to prevent errors
                // eslint-disable-next-line camelcase
                // customer_ID: "af614f31-9823-47ca-b2c3-ab5dc7a10e5d",
                // eslint-disable-next-line camelcase
                // project_ID: "dd752480-c2af-47ad-84ab-cad44fc25f4 2",
                deleted: true,
              },
              {
                success: resolve,
                error: reject,
              }
            );
          });
        },

        /**
         * Event handler for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the master route.
         * @public
         */
        onNavBack: function () {
          var sPreviousHash = History.getInstance().getPreviousHash();

          if (sPreviousHash !== undefined) {
            history.go(-1);
          } else {
            this.getRouter().navTo("master", {}, true);
          }
        },
      }
    );
  }
);