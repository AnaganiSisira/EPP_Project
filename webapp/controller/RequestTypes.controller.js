sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/BusyDialog",
    "sap/ui/model/odata/v4/ODataModel",
      "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    function (Controller, JSONModel, exportLibrary, Spreadsheet, MessageBox, MessageToast, BusyDialog, Filter ,FilterOperator ) {
        "use strict";
        var EdmType = exportLibrary.EdmType;

    return Controller.extend("eppresquesttypes.controller.RequestTypes", {
        onInit: function () {
            var oViewModel = new JSONModel({
                isEditMode: false,
                editable:false,
                isDeleteMode: false,
                selectedRows: []
            });
            this.getView().setModel(oViewModel, "viewModel");

            this._oBusyDialog = new BusyDialog();

            var oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel);

        },

        onAdd: function () {
            if (!this.fragment) {
                this.fragment = sap.ui.xmlfragment("epprequesttype.view.NewRequest", this);
                this.getView().addDependent(this.fragment);
            }
            this.fragment.open();
        },

        onExport: function () {
            try {
                var oTable = this.getView().byId("requestTypeTable");
       
                if (!oTable) {
                    sap.m.MessageToast.show("Table not found.");
                    return;
                }
       
                var oRowBinding = oTable.getBinding("rows");
                if (!oRowBinding) {
                    sap.m.MessageToast.show("No data available for export.");
                    return;
                }
       
                var aColumns = this.createColumn(oTable);
                if (aColumns.length === 0) {
                    sap.m.MessageToast.show("No columns to export.");
                    return;
                }
       
                var oSettings = {
                    workbook: {
                        columns: aColumns
                    },
                    dataSource: oRowBinding,
                    fileName: "RequestTypes_Export.xlsx"
                };
       
                var oSheet = new sap.ui.export.Spreadsheet(oSettings);
       
                oSheet.build().then(function () {
                    sap.m.MessageToast.show("Export successful!");
                }).catch(function (oError) {
                    sap.m.MessageToast.show("Export failed. Please try again.");
                    console.error("Export error:", oError);
                }).finally(function () {
                    oSheet.destroy();
                });
       
            } catch (oError) {
                sap.m.MessageToast.show("An unexpected error occurred.");
                console.error("Unexpected error:", oError);
            }
        },
       
        createColumn: function (oTable) {
            try {
                var aColumns = [];
                if (!oTable) {
                    sap.m.MessageToast.show("Table not found.");
                    return aColumns;
                }
       
                oTable.getColumns().forEach(function (oColumn) {
                    var oTemplate = oColumn.getTemplate(); // Get the column's template
                    var sProperty = "";
                    var sLabel = oColumn.getLabel().getText();
       
                    // Handle nested templates (e.g., HBox containing Input or Text)
                    if (oTemplate instanceof sap.m.HBox) {
                        var aItems = oTemplate.getItems(); // Get items inside HBox
                        aItems.forEach(function (oItem) {
                            if (oItem instanceof sap.m.Text || oItem instanceof sap.m.Label) {
                                sProperty = oItem.getBindingPath("text");
                            } else if (oItem instanceof sap.m.Input) {
                                sProperty = oItem.getBindingPath("value");
                            }
                        });
                    } else if (oTemplate instanceof sap.m.Input) {
                        sProperty = oTemplate.getBindingPath("value");
                    } else if (oTemplate instanceof sap.m.CheckBox) {
                        sProperty = oTemplate.getBindingPath("selected");
                    } else if (oTemplate instanceof sap.m.Text) {
                        sProperty = oTemplate.getBindingPath("text");
                    }
       
                    if (sProperty) {
                        aColumns.push({
                            label: sLabel,
                            property: sProperty,
                            type: sap.ui.export.EdmType.String, // Export all as strings for simplicity
                        });
                    }
                });
       
                return aColumns;
            } catch (oError) {
                sap.m.MessageToast.show("Error occurred while creating columns.");
                console.error("Column creation error:", oError);
                return [];
            }
        },
       

        onEditToggle: function () {
            var oViewModel = this.getView().getModel("viewModel");
            var bEditMode = oViewModel.getProperty("/isEditMode");
            oViewModel.setProperty("/isEditMode", !bEditMode);
         
        },

        onClose: function (oEvent) {
            if (this.fragment) {
                this.fragment.close();
                this.fragment.destroy();
                this.fragment = null;
            }
        },

        onSubmit: function () {
            try {
                var oModel = this.getView().getModel();
                var sIntakeRequestType = sap.ui.getCore().byId("inputIntakeRequestType").getValue();
                var sHelpText = sap.ui.getCore().byId("inputHelpText").getValue();
                var sSLA = sap.ui.getCore().byId("inputSLA").getValue();
                var sLink = sap.ui.getCore().byId("inputLink").getValue();
       
                var oEntry = {
                    requestName: sIntakeRequestType,
                    description: sHelpText,
                    sla: sSLA,
                    link: sLink
                };
       
                console.log("payload:", oEntry);
                let oBindList = oModel.bindList("/RequestTypes");
       
                // Creating the entry in the backend
                oBindList.create(oEntry).created().then(function () {
                    sap.m.MessageToast.show("Request created successfully.");
                    var oTable = this.getView().byId("requestTypesTable");
                    oTable.getBinding("rows").refresh();
                   
                }.bind(this)).catch(function (oError) {
                    sap.m.MessageBox.error("Error creating request: " + oError.message);
                });
                if (this.fragment) {
                    this.fragment.close();
                    this.fragment.destroy();    
                    this.fragment = null;
                }
            } catch (error) {
                sap.m.MessageBox.error("An unexpected error occurred: " + error.message);
            }
        },
       
       
        onsave: function () {
            try {
                var oTable = this.getView().byId("requestTypesTable");
                if (!oTable) {
                    throw new Error("Table not found");
                }
                var oBinding = oTable.getBinding("rows");
                if (!oBinding) {
                    throw new Error("Table binding not found");
                }
                var aItems = oBinding.getContexts();
                var oModel = this.getOwnerComponent().getModel();
                if (!oModel) {
                    throw new Error("Model not found");
                }
                aItems.forEach(function (oItemContext) {

                    var oData = oItemContext.getObject();
                    oData.isActive = oData.isActive ? true : false;


                });
                MessageToast.show("Data saved successfully");

            } catch (error) {
                MessageToast.show("Error: " + error.message);
                console.error("Error during save operation:", error);
            }
        },

        onCancel: function (oEvent) {
            if (this.fragment) {
                this.fragment.close();
                this.fragment.destroy();
                this.fragment = null;
            }
        },

        onRefresh: function () {
           this._oBusyDialog.open();
            setTimeout(() => {
                var oTable = this.byId("requestTypesTable");
                var oModel = this.getView().getModel();

                oModel.refresh();
                oTable.getBinding("rows").refresh();

               this._oBusyDialog.close();
                MessageToast.show("Page has been refreshed!");
            }, 500);
        },

        onToggleActive: function (oEvent) {
            try {
                // Get the new state of the switch
                var bState = oEvent.getParameter("state");
        
                // Get the binding context of the switch
                var oContext = oEvent.getSource().getBindingContext();
        
                // Ensure the context is valid
                if (!oContext) {
                    sap.m.MessageBox.error("No binding context found for the toggle switch.");
                    return;
                }
        
                // Get the model and binding path
                var oModel = oContext.getModel();
                var sPath = oContext.getPath();
        
                // Prepare the payload for the update
                var oPayload = {
                    isActive: bState
                };
        
                // Call the update method on the OData model
                oModel.update(sPath, oPayload, { groupId: "updateGroup" })
                    .then(function () {
                        sap.m.MessageToast.show("Active state updated successfully.");
                    })
                    .catch(function (oError) {
                        sap.m.MessageBox.error("Error updating active state: " + oError.message);
                    });
            } catch (error) {
                console.log("An unexpected error occurred: " + error.message);
            }
        },

          onToggleExpand: function () {
                var oViewModel = this.getView().getModel("viewModel");
                var bIsExpanded = oViewModel.getProperty("/isExpanded");
                oViewModel.setProperty("/isExpanded", !bIsExpanded);
            },
        
        

        onSearch: function (oEvent) {
            var oTable = this.byId("requestTypesTable"); // Get the table control
            var oBinding = oTable.getBinding("rows"); // Get the table binding
            var sQuery = oEvent.getParameter("newValue"); // Get the search query
       
            // Create an array to hold the filters
            var aFilters = [];
       
            // Default filter (you want this to always be applied)
            var oDefaultFilter = new sap.ui.model.Filter("requestName", sap.ui.model.FilterOperator.EQ, true);
            aFilters.push(oDefaultFilter);
       
            if (sQuery) {
                // If search query is provided, add additional filters
                var oAttributeFilter = new sap.ui.model.Filter("requestName", sap.ui.model.FilterOperator.Contains, sQuery);
                var oRequestTypeFilter = new sap.ui.model.Filter("isActive", sap.ui.model.FilterOperator.Contains, sQuery);
                var oIsDisplayFilter = new sap.ui.model.Filter("sla", sap.ui.model.FilterOperator.Contains, sQuery);
                var oIsRequiredFilter = new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sQuery);
       
                // Add the search filters to the filter array
                aFilters.push(oAttributeFilter, oRequestTypeFilter, oIsDisplayFilter, oIsRequiredFilter);
            }
       
            // Apply the filters to the table binding
            oBinding.filter(aFilters);
        },



        onDeleteRow: function () {

            var oTable = this.byId("requestTypesTable");
            var aSelectedIndices = oTable.getSelectedIndices();

            if (aSelectedIndices.length === 0) {
                MessageBox.warning("Please select at least one row to delete.");
                return;
            }
            MessageBox.confirm("Do you want to delete the selected row(s)?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        try {
                            this._deleteRows(aSelectedIndices);
                        } catch (oError) {
                            MessageBox.error("An error occurred while deleting rows: " + oError.message);
                        }
                    }
                }.bind(this)
            });
        },

        _deleteRows: function (aSelectedIndices) {
            var oTable = this.byId("requestTypesTable");
            var oBinding = oTable.getBinding("rows");

            try {
                aSelectedIndices.sort((a, b) => b - a);
                aSelectedIndices.forEach(function (iIndex) {
                    var oContext = oBinding.getContexts(iIndex, 1)[0];
                    oContext.delete("$auto").then(function () {
                        MessageToast.show("Row deleted successfully.");
                    }).catch(function (oError) {
                        MessageBox.error("Error deleting row: " + oError.message);
                    });
                });
                oTable.clearSelection();
            } catch (oError) {
                MessageBox.error("An error occurred while processing the deletion: " + oError.message);
            }
        },
    });
});
