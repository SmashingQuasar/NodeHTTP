"use strict";
const fs_1 = require("fs");
var Model;
(function (Model) {
    class Routing {
        constructor() {
            this.routes = [];
            this.sourceFilePath = `${__dirname}/../Resources/configuration/routing.json`;
        }
        async loadRoutingFile(path) {
            if (path === undefined) {
                path = this.sourceFilePath;
            }
            try {
                const FILE_STATS = await fs_1.promises.stat(path);
                if (!FILE_STATS.isFile()) {
                    throw new Error("Provided path for routing configuration file does not link to a file.");
                }
                const RAW_CONFIGURATION = await fs_1.promises.readFile(path, { encoding: "utf-8" });
                if (typeof RAW_CONFIGURATION !== "string") {
                    throw new Error("TODO: Handle the case where a file returns a Buffer and not a string in Routing.ts.");
                }
                const PARSED_CONFIGURATION = JSON.parse(RAW_CONFIGURATION);
                PARSED_CONFIGURATION.forEach((configuration) => {
                    this.routes.push({
                        name: configuration.name,
                        regexp: new RegExp(configuration.regexp),
                        pretty: configuration.pretty,
                        controller: configuration.controller,
                        action: configuration.action,
                        variables: configuration.variables
                    });
                });
            }
            catch (e) {
                console.log(e);
            }
        }
        getRoutes() {
            return this.routes;
        }
    }
    Model.Routing = Routing;
})(Model || (Model = {}));
module.exports = Model;
