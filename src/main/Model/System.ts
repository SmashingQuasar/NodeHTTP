// import { Request } from "./Request";
// import { IncomingMessage } from "http";
import { Server } from "./Server.js";
import { promises as Reader } from "fs";
import { ServerOptions } from "https";

class System
{
    /**
     * start
     */
    public async start()
    {

    }

    /**
     * startHTTPServer
     */
    public async startHTTPServer(configuration: HTTPServerConfiguration): Promise<void>
    {
        const OPTIONS: ServerOptions = {};
        // const __DIRNAME__ = import.meta.url.replace(/^file:\/\/(.*)\/[^\/]+$/, "$1");
        const __DIRNAME__ = import.meta.url.replace(/^file:\/\/\/[A-Z]\:(.*)\/[^\/]+$/, "$1");

        if (configuration.key !== undefined && configuration.certificate != undefined)
        {
            const KEY: Buffer = await Reader.readFile(`${__DIRNAME__}/Resources/privateKey.key`);
            const CERTIFICATE: Buffer = await Reader.readFile(`${__DIRNAME__}/Resources/certificate.crt`);
                
            OPTIONS.key = KEY;
            OPTIONS.cert = CERTIFICATE;
        }
        
        const SERVER = new Server(OPTIONS, undefined);
        SERVER.addListener("request", SERVER.handleRequest);
    
        SERVER.start();    
    }

    /**
     * openWebSocket
     */
    public async openWebSocket(): Promise<void>
    {
        
    }
}

export { System };
