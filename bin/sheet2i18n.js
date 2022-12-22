#!/usr/bin/env node
"use strict";

var sheet2i18n = require("../index");

var [, , configPath] = process.argv;

if (!configPath) {
  configPath = "sheet2i18n.config";
}

sheet2i18n(`../../${configPath}`);
