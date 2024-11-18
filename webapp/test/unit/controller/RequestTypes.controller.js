/*global QUnit*/

sap.ui.define([
	"epp_resquest_types/controller/RequestTypes.controller"
], function (Controller) {
	"use strict";

	QUnit.module("RequestTypes Controller");

	QUnit.test("I should test the RequestTypes controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
