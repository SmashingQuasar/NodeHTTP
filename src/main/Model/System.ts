import { Server } from "./Server.js";
import { promises as FileSystem } from "fs";
import { ServerOptions } from "https";
import { type as OSType } from "os";
import { Logger } from "./Logger.js";
import { Configuration } from "./Configuration.js";

class System
{
    private static Configuration: SystemConfiguration;
    public static RootDirectory: string|undefined;
    public static Logger: Logger;

    /**
     * start
     */
    public static async Start(): Promise<void>
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

        const CONFIGURATION: SystemConfiguration = await Configuration.Load("system");

        System.Configuration = CONFIGURATION;
        System.Configuration.defaultLogDirectory = System.Configuration.defaultLogDirectory === undefined ? System.RootDirectory : `${System.RootDirectory}${System.Configuration.defaultLogDirectory}`;
        System.Configuration.defaultLogName = System.Configuration.defaultLogName === undefined ? "general" : System.Configuration.defaultLogName;
        System.Logger = new Logger();
    }

    /**
     * startHTTPServer
     */
    public async startHTTPServer(configuration: HTTPServerConfiguration): Promise<void>
    {
        const OPTIONS: ServerOptions = {};
        
        if (configuration.key !== undefined && configuration.certificate != undefined)
        {
            const KEY: Buffer = await FileSystem.readFile(`${System.RootDirectory}/build/resources/privateKey.key`);
            const CERTIFICATE: Buffer = await FileSystem.readFile(`${System.RootDirectory}/build/resources/certificate.crt`);
                
            OPTIONS.key = KEY;
            OPTIONS.cert = CERTIFICATE;
        }
        
        const SERVER = new Server(OPTIONS, undefined);
        SERVER.addListener("request", SERVER.handleRequest);
    
        SERVER.start();    
    }

    /**
     * GetSystemConfiguration
     */
    public static async GetSystemConfiguration(): Promise<SystemConfiguration>
    {
        return System.Configuration;
    }

    /**
     * GetDefaultLogDirectory
     */
    public static GetDefaultLogDirectory(): string
    {
        return System.Configuration.defaultLogDirectory ?? "/";
    }

    /**
     * GetDefaultLogName
     */
    public static GetDefaultLogName(): string
    {
        return System.Configuration.defaultLogName ?? "general";
    }
}

export { System };
