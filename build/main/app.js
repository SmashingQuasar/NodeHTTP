import { Server } from "./Model/Server.js";
import { promises as Reader } from "fs";
import { type as OSType } from "os";
async function initialize() {
    let dirname = "";
    if (OSType() === "Linux") {
        dirname = import.meta.url.replace(/^file:\/\/\/(.*)\/[^\/]+$/, "/$1");
    }
    else {
        dirname = import.meta.url.replace(/^file:\/\/\/[A-Z]\:(.*)\/[^\/]+$/, "$1");
    }
    const __DIRNAME__ = dirname;
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
