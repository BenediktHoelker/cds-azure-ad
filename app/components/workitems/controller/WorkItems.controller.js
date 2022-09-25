sap.ui.define(
  [
    "./BaseController",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/base/Log",
  ],
  (BaseController, formatter, Filter, FilterOperator, MessageToast, Log) => {
    function addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    BaseController.extend(
      "iot.planner.components.workitems.controller.WorkItems",
      {
        formatter,
        async onInit() {
          this.searchFilters = [];
          this._filters = {
            all: new Filter({
              path: "state",
              operator: "NE",
              value1: "",
            }),
            completed: new Filter({
              path: "state",
              operator: "EQ",
              value1: "completed",
            }),
            incompleted: new Filter({
              path: "state",
              operator: "EQ",
              value1: "incompleted",
            }),
          };

          this.getRouter()
            .getRoute("workitems")
            .attachPatternMatched(() => this.onRouteMatched(), this);
        },

        async onRouteMatched() {
          const model = this.getModel();
          const loadFrom = new Date();
          loadFrom.setHours(0, 0, 0, 0); // last midnight
          const loadUntil = new Date();
          loadUntil.setHours(24, 0, 0, 0); // next midnight

          model.setData({
            busy: false,
            tableBusy: true,
            MyCategories: {},
            categoriesNested: {},
            activities: [
              { title: "Durchführung" },
              { title: "Reise-/Fahrzeit" },
              { title: "Pendelfahrt Hotel/Einsatzort" },
            ],
            locations: [
              { title: "IOT" },
              { title: "Home-Office" },
              { title: "Rottendorf" },
            ],
            countAll: 0,
            countCompleted: 0,
            countIncompleted: 0,
            checkedProperties: [
              "title",
              "date",
              "activatedDate",
              "completedDate",
              "parentPath",
              "activity",
              "location",
            ],
            selectedItemPath: {},
            totalDuration: 0,
          });

          try {
            await Promise.all([
              this._loadWorkItems({
                startDateTime: loadFrom,
                endDateTime: loadUntil,
              }),
              this._loadHierarchy(),
            ]);
          } catch (error) {
            Log.error(error);
          }
          this._filterHierarchyByPath("hierarchyTreeForm", "");

          model.setProperty("/tableBusy", false);
        },

        async _loadWorkItems({ startDateTime, endDateTime }) {
          const model = this.getModel();

          model.setProperty("/busy", true);

          try {
            const { results: workItems } = await model.callFunction(
              "/getCalendarView",
              {
                urlParameters: {
                  startDateTime,
                  endDateTime,
                },
              }
            );

            const appointments = workItems.map(
              ({ completedDate, activatedDate, isAllDay, ...appointment }) => ({
                ...appointment,
                tags: appointment.tags.results,
                activity:
                  appointment.activity === null || undefined
                    ? model.getProperty("/activities")[0].title
                    : appointment.activity,
                activatedDate: isAllDay
                  ? new Date(activatedDate.setHours(0))
                  : activatedDate,
                completedDate: isAllDay
                  ? addDays(completedDate.setHours(0), -1)
                  : completedDate,
              })
            );

            model.setProperty("/MyWorkItems", appointments);
            model.setProperty("/busy", false);
          } catch (error) {
            Log.error(error);
          }
        },

        calcTotalDuration() {
          const model = this.getModel();
          const filteredItemsIndices =
            this.byId("tableWorkItems").getBindingInfo("items").binding
              .aIndices;
          const myWorkItems = model.getProperty("/MyWorkItems");
          let totalDuration = 0;

          totalDuration = filteredItemsIndices.reduce((sum, index) => {
            if (myWorkItems[index].duration !== "24") {
              return sum + parseFloat(myWorkItems[index].duration);
            }
            return sum;
          }, 0);

          model.setProperty("/totalDuration", totalDuration);
        },

        async _loadHierarchy() {
          const model = this.getModel();
          try {
            const { results } = await model.callFunction("/getMyCategoryTree");
            const categoriesNested = model.nest({ items: results });

            model.setProperty("/MyCategories", results);
            model.setProperty("/MyCategoriesNested", categoriesNested);
          } catch (error) {
            Log.error(error);
          }
        },

        onChangeHierarchy(event) {
          const selectedItemPath = event
            .getSource()
            .getBindingContext()
            .getPath();
          this.getModel().setProperty("/selectedItemPath", selectedItemPath);
          const popover = this.byId("hierarchyPopover");
          const input = event.getSource();

          popover.openBy(input);
          setTimeout(() => input.focus());
          const { newValue } = event.getParameters();

          this._filterHierarchyByPath(newValue);
        },

        _filterHierarchyByPath(query) {
          let filters = [];

          if (!query) {
            filters = new Filter("title", "EQ", null);
          } else if (query.includes(">")) {
            filters = [
              new Filter({
                path: "path",
                test: (path) => {
                  if (!query || !path) return false;
                  const pathSubstrings = path.replaceAll(" ", "").split(">");
                  const querySubstrings = query
                    .toUpperCase()
                    .replaceAll(" ", "")
                    .split(">");

                  return querySubstrings.every(
                    (querySubstring, index) =>
                      pathSubstrings[index] &&
                      pathSubstrings[index].includes(querySubstring)
                  );
                },
              }),
            ];
          } else {
            filters = [
              new Filter({
                filters: [
                  new Filter({
                    path: "path",
                    test: (path) => {
                      if (!query || !path) return false;
                      const substrings = query.split(" ");
                      return substrings
                        .map((sub) => sub.toUpperCase())
                        .every((sub) => path.includes(sub));
                    },
                  }),
                  new Filter({
                    path: "absoluteReference",
                    test: (absoluteReference) => {
                      if (!query || !absoluteReference) return false;
                      const substrings = query.split(" ");
                      return substrings
                        .map((sub) => sub.toUpperCase())
                        .every((sub) => absoluteReference.includes(sub));
                    },
                  }),
                  new Filter({
                    path: "deepReference",
                    test: (deepReference) => {
                      if (!query || !deepReference) return false;
                      const substrings = query.split(" ");
                      return substrings
                        .map((sub) => sub.toUpperCase())
                        .every((sub) => deepReference.includes(sub));
                    },
                  }),
                ],
                and: false,
              }),
            ];
          }

          const tree = this.byId("hierarchyTreeTable");
          tree.getBinding("rows").filter(filters);

          tree.getRows().forEach((row) => {
            const titleCell = row.getCells()[0];

            if (!titleCell) return;

            const htmlText = titleCell
              .getHtmlText()
              .replaceAll("<strong>", "")
              .replaceAll("</strong>", "");

            titleCell.setHtmlText(htmlText);

            if (!query) return;

            const querySubstrings = query.split(/>| /);

            const newText = querySubstrings.reduce(
              (text, sub) => text.replace(sub, `<strong>${sub}</strong>`),
              htmlText
            );

            titleCell.setHtmlText(newText);
          });
        },

        onSelectHierarchy(event) {
          const { rowContext } = event.getParameters();

          if (!rowContext) return;

          const workItemPath = this.getModel().getProperty("/selectedItemPath");
          const hierarchyPath = rowContext.getProperty("path");

          this.getModel().setProperty(
            `${workItemPath}/parentPath`,
            hierarchyPath
          );
        },

        onFilterWorkItems(event) {
          const binding = this.byId("tableWorkItems").getBinding("items");
          const key = event.getSource().getSelectedKey();
          binding.filter(this._filters[key]);
        },

        onUpdateTableFinished(event) {
          this.setItemCountsFilters(event);
          this.calcTotalDuration();
        },

        setItemCountsFilters(event) {
          const totalItems = event.getParameter("total");

          if (
            totalItems &&
            event.getSource().getBinding("items").isLengthFinal()
          ) {
            const model = this.getModel();

            const countAll = model
              .getProperty("/MyWorkItems")
              .filter((workItem) => workItem.state !== "").length;

            const countCompleted = model
              .getProperty("/MyWorkItems")
              .filter((workItem) => workItem.state === "completed").length;

            const countIncompleted = model
              .getProperty("/MyWorkItems")
              .filter((workItem) => workItem.state === "incompleted").length;

            model.setProperty("/countAll", countAll);
            model.setProperty("/countCompleted", countCompleted);
            model.setProperty("/countIncompleted", countIncompleted);
          }
        },

        onSearch(event) {
          this.searchFilters = [];
          this.searchQuery = event.getSource().getValue();

          if (this.searchQuery && this.searchQuery.length > 0) {
            this.searchFilters = new Filter(
              "text",
              FilterOperator.Contains,
              this.searchQuery
            );
          }

          this.byId("table").getBinding("items").filter(this.searchFilters);
        },

        checkCompleteness() {
          const model = this.getModel();
          const newWorkItem = model.getProperty("/newWorkItem");
          const checkedProperties =
            this.getModel().getProperty("/checkedProperties");

          // eslint-disable-next-line no-restricted-syntax
          for (const property of checkedProperties) {
            if (
              newWorkItem[property].toString().trim() === "" ||
              newWorkItem[property] === null ||
              newWorkItem[property] === undefined
            ) {
              model.setProperty("/newWorkItem/state", "incompleted");
              return;
            }
          }

          model.setProperty("/newWorkItem/state", "completed");
        },

        async onPressDeleteWorkItems() {
          const model = this.getModel();
          const table = this.byId("tableWorkItems");
          const workItemsToDelete = table
            .getSelectedContexts()
            .map((context) => context.getObject());

          try {
            await Promise.all(
              workItemsToDelete.map((workItem) => {
                if (workItem.type === "Manual") return model.remove(workItem);
                return model.callFunction("/removeDraft", {
                  method: "POST",
                  urlParameters: {
                    ID: workItem.ID,
                    activatedDate: workItem.activatedDate,
                    completedDate: workItem.completedDate,
                  },
                });
              })
            );
          } catch (error) {
            Log.error(error);
          }

          const data = model.getProperty("/MyWorkItems").filter((entity) => {
            const keepItem = !workItemsToDelete
              .map((wi) => wi.__metadata.uri)
              .includes(entity.__metadata.uri);
            return keepItem;
          });

          model.setProperty("/MyWorkItems", data);

          table.removeSelections();

          MessageToast.show(`Deleted ${workItemsToDelete.length} work items.`);
        },

        async updateWorkItem(event) {
          const bindingContext = event.getSource().getBindingContext();
          const localPath = bindingContext.getPath();
          const workItem = bindingContext.getObject();

          try {
            await this.getModel().update({ ...workItem, localPath });
          } catch (error) {
            Log.error(error);
          }

          this.updateWorkItemState(workItem, localPath);
        },

        async updateWorkItemActivity(event) {
          const bindingContext = event.getSource().getBindingContext();
          const localPath = bindingContext.getPath();
          const workItem = bindingContext.getObject();
          const selectedKey = event.getSource().getSelectedKey();

          workItem.activity = selectedKey;

          try {
            await this.getModel().update({ ...workItem, localPath });
          } catch (error) {
            Log.error(error);
          }

          this.updateWorkItemState(workItem, localPath);
        },

        async updateWorkItemDates(event) {
          const bindingContext = event.getSource().getBindingContext();
          const localPath = bindingContext.getPath();
          const workItem = bindingContext.getObject();

          const month = workItem.date.getUTCMonth();
          const day = workItem.date.getDate();
          const year = workItem.date.getUTCFullYear();

          workItem.activatedDate.setFullYear(year, month, day);
          workItem.completedDate.setFullYear(year, month, day);

          try {
            await this.getModel().update({ ...workItem, localPath });
          } catch (error) {
            Log.error(error);
          }

          this.updateWorkItemState(workItem, localPath);
        },

        async updateWorkItemLocation(event) {
          const bindingContext = event.getSource().getBindingContext();
          const localPath = bindingContext.getPath();
          const workItem = bindingContext.getObject();
          const value = event.getParameters().newValue;

          workItem.location = value;

          try {
            await this.getModel().update({ ...workItem, localPath });
          } catch (error) {
            Log.error(error);
          }

          this.updateWorkItemState(workItem, localPath);
        },

        async updateWorkItemState(workItem, localPath) {
          const checkedProperties =
            this.getModel().getProperty("/checkedProperties");
          let isCompleted = true;

          // eslint-disable-next-line no-restricted-syntax
          for (const property of checkedProperties) {
            if (
              workItem[property] === undefined ||
              workItem[property] === null ||
              workItem[property].toString().trim() === ""
            ) {
              isCompleted = false;
              break;
            }
          }

          // eslint-disable-next-line no-unused-expressions
          isCompleted
            ? // eslint-disable-next-line no-param-reassign
              (workItem.state = "completed")
            : // eslint-disable-next-line no-param-reassign
              (workItem.state = "incompleted");

          try {
            await this.getModel().update({ ...workItem, localPath });
          } catch (error) {
            Log.error(error);
          }
        },
      }
    );
  }
);