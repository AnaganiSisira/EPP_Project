sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
 
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
    "use strict";
 
    return Controller.extend("eppresquesttypes.controller.RequestTypesDoc", {
        onInit: function () {
 
            var oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel, "DocsConfigModel");
            console.log(oModel);
 
            var oViewModel = new sap.ui.model.json.JSONModel({
                isEditMode: false
            });
            this.getView().setModel(oViewModel, "viewModel");
 
        },
 
        onSaveRequestTypeDocFieldsNew: function () {
            try {
                var oTable = this.getView().byId("requestTypeDocTable");
 
                if (!oTable) {
                    throw new Error("Table not found");
                }
 
                var oBinding = oTable.getBinding("rows");
 
                if (!oBinding) {
                    throw new Error("Table binding not found");
                }
 
                var aItems = oBinding.getContexts();
                var oModel = this.getView().getModel("DocsConfigModel");
 
                if (!oModel) {
                    throw new Error("Model not found");
                }
                aItems.forEach(function (oItemContext) {
 
                    var oData = oItemContext.getObject();
                    oData.isDisplay = oData.isDisplay ? true : false;
                    oData.isRequired = oData.isRequired ? true : false;
                })
                MessageToast.show("Data saved successfully");
            } catch (error) {
 
                MessageToast.show("Error: " + error.message);
                console.error("Error during save operation:", error);
            }
        },
 
        addDialogNewDoc: function () {
            this.byId("addDialogNewDoc").open();
        },
        onClickAddNewDocFieldButton: function () {
 
            var oComboBox = this.byId("idNewRequestTypeDocComboBox");
            var oInputField = this.byId("idRequestTYpeDocNewField");
 
            var requestTypeId = oComboBox.getSelectedKey();
            var fieldValue = oInputField.getValue();
 
            if (!requestTypeId || !fieldValue) {
                MessageBox.error("Please fill all required fields.");
                return;
            }
            var oPayload = {
                requestType_ID: requestTypeId,
                attribute: fieldValue
            };
            console.log("Payload:", oPayload);
 
            try {
                var oModel = this.getView().getModel();
                var sPath = "/DocumentsConfig";
 
                var oContext = oModel.bindList(sPath).create(oPayload);
 
                // Submit batch request
                oModel.submitBatch(oModel.getUpdateGroupId())
                    .then(function () {
                        console.log("Success response");
                        MessageToast.show("Request Type Field added successfully.");
                        this._refreshTable();
                        this.onCloseDocDialog();
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
 
        onCloseDocDialog: function () {
            this.byId("addDialogNewDoc").close();
            this.onClearDialog();
        },
 
        onClearDialog: function () {
            this.byId("idNewRequestTypeDocComboBox").setSelectedKey("");
            this.byId("idRequestTYpeDocNewField").setValue("");
        },
 
        _refreshTable: function () {
            console.log("Refreshing table");
 
            try {
                var oModel = this.getView().getModel();
                oModel.refresh();
 
                var oTable = this.byId("requestTypeDocTable");
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
 
        onSearchRequestTypeDoc: function () {
            var oView = this.getView(),
                sValue = oView.byId("requestTypeDocSearchField").getValue().toLowerCase();
            var oTable = oView.byId("requestTypeDocTable");
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
 
        onEditToggle: function () {
            var oViewModel = this.getView().getModel("viewModel");
            var currentEditMode = oViewModel.getProperty("/isEditMode");
 
            oViewModel.setProperty("/isEditMode", !currentEditMode);
 
            var oTable = this.byId("requestTypeDocTable");
            if (oTable) {
                var oBinding = oTable.getBinding("rows");
                if (oBinding) {
                    oBinding.refresh();
                }
            }
            if (!currentEditMode) {
                sap.m.MessageToast.show("Edit mode activated");
            } else {
                sap.m.MessageToast.show("Data Saved Successfully");
            }
 
            var oButton = this.byId("docEditButton");
            if (oButton) {
                oButton.setIcon(currentEditMode ? 'sap-icon://edit' : 'sap-icon://display');
                oButton.setTooltip(currentEditMode ? 'Switch to Edit Mode' : 'Switch to View Mode');
            }
        }
    });
});