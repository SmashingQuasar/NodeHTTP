import { IncomingMessage, ServerResponse, RequestListener } from "http";
import { Server as HTTPSServer, ServerOptions } from "https";
import { Request } from "./Request.js";
import { Routing } from "./Routing.js";
import { ParsedUrlQuery } from "querystring";
import { promises as FileSystem, Stats } from "fs";
import { type as OSType } from "os";
// import { Controller } from "./Controller";

class Server extends HTTPSServer
{
    private port: number = 443;

    /**
     * constructor
     */
    public constructor(options: ServerOptions, listener: RequestListener|undefined)
    {
        super(options, listener);
    }

    /**
     * handleRequest
     */
    public handleRequest(message: IncomingMessage, response: ServerResponse): void
    {
        let request = new Request(message);
        let body: string = "";

        message.addListener(
            "data",
            (chunk: Buffer): void => {
                body += chunk.toString("binary");
            }    
        );

        message.addListener(
            "end",
            async (): Promise<void> => {
                await request.setRawBody(body);
                
                try
                {
                    await this.dispatchRequest(request, response);
                }
                catch (e)
                {
                    //TODO Log general errors here

                    console.log("Custom error:", e);

                    response.statusCode = 404;
                    response.end("404 - Not found.");
                }
            }
        );

    }

    /**
     * start
     */
    public async start(): Promise<void>
    {
        let dirname = "";
        if (OSType() === "Linux")
        {
            dirname = import.meta.url.replace(/^file:\/\/\/(.*)\/[^\/]+$/, "/$1");
        }
        else
        {
            dirname = import.meta.url.replace(/^file:\/\/\/[A-Z]\:(.*)\/[^\/]+$/, "$1");
        }
        const __DIRNAME__ = dirname;
        
        const CONFIGURATION_FILE: string|Buffer = await FileSystem.readFile(`${__DIRNAME__}/../../../private/Resources/configuration/server.json`, { encoding: "UTF-8" });

        let configuration: ServerConfiguration = {
            port: 443
        };

        if (CONFIGURATION_FILE instanceof Buffer)
        {
            // TODO
        }
        else
        {
            configuration = JSON.parse(CONFIGURATION_FILE);

            if (configuration.port !== undefined)
            {
                this.port = configuration.port;
            }
        }


        this.listen(this.port);
        console.log("Server started.");
    }

    private async dispatchRequest(request: Request, response: ServerResponse): Promise<void>
    {
        let dirname = "";
        if (OSType() === "Linux")
        {
            dirname = import.meta.url.replace(/^file:\/\/\/(.*)\/[^\/]+$/, "/$1");
        }
        else
        {
            dirname = import.meta.url.replace(/^file:\/\/\/[A-Z]\:(.*)\/[^\/]+$/, "$1");
        }
        const __DIRNAME__ = dirname;
        
        const ROUTER: Routing = new Routing();

        await ROUTER.loadRoutingFile();

        const ROUTES: Array<RouteConfiguration> = ROUTER.getRoutes();

        let controller_name: string|undefined;
        let action_name: string|undefined;

        await Promise.all(
            ROUTES.map(
                async (route: RouteConfiguration): Promise<void> => {
                    
                    const MATCHES: RegExpMatchArray|null = request.getRequestedPath().match(route.regexp);

                    if (MATCHES !== null)
                    {
                        const QUERY: ParsedUrlQuery = {};
                        const KEYS: Array<string> = Object.keys(route.variables);

                        await Promise.all(
                            KEYS.map(
                                (name: string): void => {
                                    const VARIABLE_REFERENCE: string = route.variables[name];

                                    if (VARIABLE_REFERENCE.match(/^\$[0-9]+$/) === null)
                                    {
                                        //TODO Log variable reference exception here
                                    }
                                    const INDEX: number = parseInt(VARIABLE_REFERENCE.substring(1));

                                    if (MATCHES[INDEX] === undefined || MATCHES[INDEX] === null)
                                    {
                                        //TODO Log not found variable value exception here
                                    }
                                    QUERY[name] = MATCHES[INDEX];
                                }
                            )
                        );

                        request.setQuery(QUERY);

                        controller_name = `${route.controller}Controller`;
                        action_name = `${route.action}Action`;
                    }
                }
            )
        );
        
        if (controller_name === undefined || action_name === undefined)
        {
            const PUBLIC_PATH: string = `${__DIRNAME__}/../../../www`;
            
            try
            {
                const POSSIBLE_FILE: Stats = await FileSystem.stat(`${PUBLIC_PATH}/${request.getRequestedPath()}`);

                if (!POSSIBLE_FILE.isFile())
                {
                    throw new Error("Requested file does not exist");
                }

                const FILE: Buffer = await FileSystem.readFile(`${PUBLIC_PATH}/${request.getRequestedPath()}`);

                response.write(FILE);
                response.end();
            }
            catch (e)
            {
                throw new Error("Requested file does not exist");
            }
        }
        else
        {
            try
            {
                const CLASS_PATH: string = `${__DIRNAME__}/../Controller/${controller_name}.js`;
                const FILE_STATS: Stats = await FileSystem.stat(CLASS_PATH);

                if (!FILE_STATS.isFile())
                {
                    //TODO Log here that requested controller is not a file
                    throw new Error("The requested controller is not a file.");
                }

                const REQUESTED_CONTROLLER_CLASS = await import(CLASS_PATH);
                
                const REQUESTED_CONTROLLER = new REQUESTED_CONTROLLER_CLASS[controller_name];
                
                if (REQUESTED_CONTROLLER[action_name] !== undefined && REQUESTED_CONTROLLER[action_name] instanceof Function)
                {
                    await REQUESTED_CONTROLLER[action_name](request, response);
                }
                else
                {
                    //TODO Log that controller action does not exist.
                }

            }
            catch (e)
            {
                console.log(e);
            }
        }

    }
    
}
    
export { Server };
