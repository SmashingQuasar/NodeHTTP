import { promises as FileSystem } from "fs";
import { type as OSType } from "os";
class Routing {
    constructor() {
        this.routes = [];
        let dirname = "";
        if (OSType() === "Linux") {
            dirname = import.meta.url.replace(/^file:\/\/\/(.*)\/[^\/]+$/, "/$1");
        }
        else {
            dirname = import.meta.url.replace(/^file:\/\/\/[A-Z]\:(.*)\/[^\/]+$/, "$1");
        }
        const __DIRNAME__ = dirname;
        this.sourceFilePath = `${__DIRNAME__}/../../../private/Resources/configuration/routing.json`;
    }
    async loadRoutingFile(path) {
        if (path === undefined) {
            path = this.sourceFilePath;
        }
        try {
            const FILE_STATS = await FileSystem.stat(path);
            if (!FILE_STATS.isFile()) {
                throw new Error("Provided path for routing configuration file does not link to a file.");
            }
            const RAW_CONFIGURATION = await FileSystem.readFile(path, { encoding: "UTF-8" });
            if (RAW_CONFIGURATION instanceof Buffer) {
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
export { Routing };
