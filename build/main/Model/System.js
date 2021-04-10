import { Server } from "./Server.js";
import { promises as FileSystem } from "fs";
import { type as OSType } from "os";
class System {
    async start() {
    }
    async startHTTPServer(configuration) {
        const OPTIONS = {};
        const __DIRNAME__ = await System.GetRootDirectory();
        if (configuration.key !== undefined && configuration.certificate != undefined) {
            const KEY = await FileSystem.readFile(`${__DIRNAME__}/private/Resources/privateKey.key`);
            const CERTIFICATE = await FileSystem.readFile(`${__DIRNAME__}/private/Resources/certificate.crt`);
            OPTIONS.key = KEY;
            OPTIONS.cert = CERTIFICATE;
        }
        const SERVER = new Server(OPTIONS, undefined);
        SERVER.addListener("request", SERVER.handleRequest);
        SERVER.start();
    }
    async openWebSocket() {
    }
    static async GetRootDirectory() {
        if (System.RootDirectory === undefined) {
            let dirname = "";
            if (OSType() === "Linux") {
                dirname = import.meta.url.replace(/^file:\/\/\/(.*)\/[^\/]+$/, "/$1");
            }
            else {
                dirname = import.meta.url.replace(/^file:\/\/\/[A-Z]\:(.*)\/[^\/]+$/, "$1");
            }
            System.RootDirectory = await FileSystem.realpath(`${dirname}/../../../`);
        }
        return System.RootDirectory;
    }
}
export { System };
