/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"epp_resquest_types/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
