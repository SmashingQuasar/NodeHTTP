import { Server } from "./Model/Server";
import { promises as Reader } from "fs";

async function initialize()
{
    let key = await Reader.readFile(`${__dirname}/Resources/privateKey.key`);
    let cert = await Reader.readFile(`${__dirname}/Resources/certificate.crt`);
    
    let options = {
        key: key,
        cert: cert
    };
    
    const SERVER = new Server(options, undefined);
    SERVER.addListener("request", SERVER.handleRequest);

    SERVER.start();
}

initialize();