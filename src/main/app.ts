import { Server } from "./Model/Server.js";
import { System } from "./Model/System.js";
import { promises as Reader } from "fs";

async function initialize()
{
	const __DIRNAME__ = await System.GetRootDirectory();
    
    let key = await Reader.readFile(`${__DIRNAME__}/private/Resources/privateKey.key`);
    let cert = await Reader.readFile(`${__DIRNAME__}/private/Resources/certificate.crt`);
    
    let options = {
        key: key,
        cert: cert
    };
    
    const SERVER = new Server(options, undefined);
    SERVER.addListener("request", SERVER.handleRequest);

    SERVER.start();
}

initialize();