import { Server } from "./Model/Server.js";
import { System } from "./Model/System.js";
import { promises as Reader } from "fs";

async function initialize()
{
    await System.Start();
    let key = await Reader.readFile(`${System.RootDirectory}/build/resources/privateKey.key`);
    let cert = await Reader.readFile(`${System.RootDirectory}/build/resources/certificate.crt`);
    
    let options = {
        key: key,
        cert: cert
    };
    const SERVER = new Server(options, undefined);
    SERVER.addListener("request", SERVER.handleRequest);

    SERVER.start();
}

initialize();