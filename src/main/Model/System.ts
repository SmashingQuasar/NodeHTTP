// import { Request } from "./Request";
// import { IncomingMessage } from "http";
import { Server } from "./Server.js";
import { promises as FileSystem } from "fs";
import { ServerOptions } from "https";
import { type as OSType } from "os";


class System
{
    public static RootDirectory: string|undefined;

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
        const __DIRNAME__ = await System.GetRootDirectory();
        
        if (configuration.key !== undefined && configuration.certificate != undefined)
        {
            const KEY: Buffer = await FileSystem.readFile(`${__DIRNAME__}/private/Resources/privateKey.key`);
            const CERTIFICATE: Buffer = await FileSystem.readFile(`${__DIRNAME__}/private/Resources/certificate.crt`);
                
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

    /**
     * GetRootDirectory
     * @returns 
     */
    
    static async GetRootDirectory(): Promise<string>
    {
        if (System.RootDirectory === undefined)
        {
            let dirname: string = "";
    
            if (OSType() === "Linux")
            {
                dirname = import.meta.url.replace(/^file:\/\/\/(.*)\/[^\/]+$/, "/$1");
            }
            else
            {
                dirname = import.meta.url.replace(/^file:\/\/\/[A-Z]\:(.*)\/[^\/]+$/, "$1");
            }
            System.RootDirectory = await FileSystem.realpath(`${dirname}/../../../`);
        }

        return System.RootDirectory;
    }
}

export { System };
