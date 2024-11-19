sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
    function (Controller, MessageToast, MessageBox) {
        "use strict";

        return Controller.extend("eppresquesttypes.controller.RequestTypesFields", {
            onInit: function () {
               

            },
            onClickAddButton: function () {
                this.byId("addDialogRequestTypeFieldNew").open();
            },

            onSaveRequestTypeFields: function () {
                try {

                    var oTable = this.getView().byId("requestTypeFieldsTable");

                    if (!oTable) {
                        throw new Error("Table not found");
                    }
                    var oBinding = oTable.getBinding("rows");

                    if (!oBinding) {
                        throw new Error("Table binding not found");
                    }
                    var aItems = oBinding.getContexts();
                    var oModel = this.getView().getModel();
                    if (!oModel) {
                        throw new Error("Model not found");
                    }
                    aItems.forEach(function (oItemContext) {

                        var oData = oItemContext.getObject();
                        oData.isDisplay = oData.isDisplay ? true : false;
                        oData.isRequired = oData.isRequired ? true : false;

                    });

                    MessageToast.show("Data saved successfully");
                } catch (error) {

                    MessageToast.show("Error: " + error.message);
                    console.error("Error during save operation:", error);
                }
            },

            onSaveRequestTypeFieldsNew: function () {
                console.log("onSaveRequestTypeFieldsNew called");

                var oComboBox = this.byId("idNewRequestTypeFieldComboBox");
                var oInputField = this.byId("idNewRequestTypefieldMaintenanceComboBox");
                var requestTypeId = oComboBox.getSelectedKey();
                var fieldValue = oInputField.getSelectedKey();

                if (!requestTypeId || !fieldValue) {
                    MessageBox.error("Please fill all required fields.");
                    return;
                }

                var oPayload = {
                    requestType_ID: requestTypeId,
                    fieldMaintenance_ID: fieldValue,
                    attribute:fieldValue
                };
                console.log("Payload:", oPayload);
                try {

                    var oModel = this.getView().getModel();
                    var sPath = "/RequestConfigs";
                    var oContext = oModel.bindList(sPath).create(oPayload);
                    oModel.submitBatch(oModel.getUpdateGroupId())
                        .then(function () {
                            console.log("Success response");
                            MessageToast.show("Request Type Field added successfully.");
                            this._refreshTable();
                            this.onCloseRequestTypeFieldsNew();
                        }.bind(this))
                        .catch(function (oError) {
                            console.error("Error during batch submission:", oError);
                            MessageBox.error("Error saving the Request Type Field.");
                        });
                } catch (oError) {
                    console.error("Exception caught in onSaveRequestTypeFieldsNew:", oError);
                    MessageBox.error("An unexpected error occurred while saving the Request Type Field.");
                }
            },

            _refreshTable: function () {
                console.log("Refreshing table");

                try {
                    var oModel = this.getView().getModel();
                    oModel.refresh();
                    var oTable = this.byId("requestTypeFieldsTable");
                    var oBinding = oTable.getBinding("rows");

                    if (oBinding) {
                        oBinding.refresh();
                        console.log("Table binding refreshed");
                    }
                } catch (oError) {
                    console.error("Error refreshing the table:", oError);
                    MessageBox.error("An error occurred while refreshing the table.");
                }
            },

            onCloseRequestTypeFieldsNew: function () {
                try {
                    this.byId("addDialogRequestTypeFieldNew").close();
                    this.onClearRequestTypeFields();
                } catch (oError) {
                    console.error("Error closing the dialog:", oError);
                    MessageBox.error("An error occurred while closing the dialog.");
                }
            },

            onClearRequestTypeFields: function () {
                try {
                    this.byId("idNewRequestTypeFieldComboBox").setSelectedKey("");
                    this.byId("idNewRequestTypefieldMaintenanceComboBox").setSelectedKey("");
                } catch (oError) {
                    console.error("Error clearing the input fields:", oError);
                    MessageBox.error("An error occurred while clearing the input fields.");
                }
            },

            onSearchRequestTypeFields: function () {
                var oView = this.getView(),
                    sValue = oView.byId("requestTypeFieldsSearchField").getValue().toLowerCase();
                var oTable = oView.byId("requestTypeFieldsTable");
                var oBinding = oTable.getBinding("rows");

                var oIsActiveFilter = new sap.ui.model.Filter("requestType/isActive", sap.ui.model.FilterOperator.EQ, true);

                var aSearchFilters = [];
                if (sValue) {
                    aSearchFilters.push(
                        new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter({
                                    path: "attribute",
                                    operator: sap.ui.model.FilterOperator.Contains,
                                    value1: sValue,
                                    caseSensitive: false
                                }),
                                new sap.ui.model.Filter({
                                    path: "requestType/requestName",
                                    operator: sap.ui.model.FilterOperator.Contains,
                                    value1: sValue,
                                    caseSensitive: false
                                })
                            ],
                            and: false
                        })
                    );
                }

                var aCombinedFilters = [oIsActiveFilter];
                if (aSearchFilters.length) {
                    aCombinedFilters.push(new sap.ui.model.Filter(aSearchFilters, true));
                }

                oBinding.filter(aCombinedFilters, sap.ui.model.FilterType.Application);
            },


            // onToggleActive: function (oEvent) {
            //     try {
            //         // Get the new state of the switch
            //         var bState = oEvent.getParameter("state");

            //         // Get the binding context of the switch
            //         var oContext = oEvent.getSource().getBindingContext();

            //         // Ensure the context is valid
            //         if (!oContext) {
            //             sap.m.MessageBox.error("No binding context found for the toggle switch.");
            //             return;
            //         }

            //         // Get the model and binding path
            //         var oModel = oContext.getModel();
            //         var sPath = oContext.getPath();

            //         // Prepare the payload for the update
            //         var oPayload = {
            //             isActive: bState
            //         };

            //         // Call the update method on the OData model
            //         oModel.update(sPath, oPayload, { groupId: "updateGroup" })
            //             .then(function () {
            //                 sap.m.MessageToast.show("Active state updated successfully.");
            //             })
            //             .catch(function (oError) {
            //                 sap.m.MessageBox.error("Error updating active state: " + oError.message);
            //             });
            //     } catch (error) {
            //         console.log("An unexpected error occurred: " + error.message);
            //     }
            // },



        });
    });