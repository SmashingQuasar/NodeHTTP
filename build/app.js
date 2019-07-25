"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("./Model/Server");
const fs_1 = require("fs");
async function initialize() {
    let key = await fs_1.promises.readFile(`${__dirname}/Resources/privateKey.key`);
    let cert = await fs_1.promises.readFile(`${__dirname}/Resources/certificate.crt`);
    let options = {
        key: key,
        cert: cert
    };
    const SERVER = new Server_1.Server(options, undefined);
    SERVER.addListener("request", SERVER.handleRequest);
    SERVER.start();
}
initialize();
