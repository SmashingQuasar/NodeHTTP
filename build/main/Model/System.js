import { Server } from "./Server.js";
import { promises as Reader } from "fs";
class System {
    async start() {
    }
    async startHTTPServer(configuration) {
        const OPTIONS = {};
        const __DIRNAME__ = import.meta.url.replace(/^file:\/\/\/[A-Z]\:(.*)\/[^\/]+$/, "$1");
        if (configuration.key !== undefined && configuration.certificate != undefined) {
            const KEY = await Reader.readFile(`${__DIRNAME__}/Resources/privateKey.key`);
            const CERTIFICATE = await Reader.readFile(`${__DIRNAME__}/Resources/certificate.crt`);
            OPTIONS.key = KEY;
            OPTIONS.cert = CERTIFICATE;
        }
        const SERVER = new Server(OPTIONS, undefined);
        SERVER.addListener("request", SERVER.handleRequest);
        SERVER.start();
    }
    async openWebSocket() {
    }
}
export { System };
