import { Server } from "./Model/Server.js";
import { promises as Reader } from "fs";
async function initialize() {
    const __DIRNAME__ = import.meta.url.replace(/^file:\/\/\/[A-Z]\:(.*)\/[^\/]+$/, "$1");
    console.log(__DIRNAME__);
    console.log("----------------");
    let key = await Reader.readFile(`${__DIRNAME__}/../../private/Resources/privateKey.key`);
    let cert = await Reader.readFile(`${__DIRNAME__}/../../private/Resources/certificate.crt`);
    let options = {
        key: key,
        cert: cert
    };
    const SERVER = new Server(options, undefined);
    SERVER.addListener("request", SERVER.handleRequest);
    SERVER.start();
}
initialize();
