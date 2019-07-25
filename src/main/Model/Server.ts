import { IncomingMessage, ServerResponse, RequestListener } from "http";
import { Server as HTTPSServer, ServerOptions } from "https";
import { Request } from "./Request";
import { Routing } from "./Routing";
import { ParsedUrlQuery } from "querystring";
import { promises as FileSystem, Stats } from "fs";
// import { Controller } from "./Controller";

module Model
{
    export class Server extends HTTPSServer
    {
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
                    this.dispatchRequest(request, response);
                }
            );

        }

        /**
         * start
         */
        public start(): void
        {
            this.listen(443);
        }


        private async dispatchRequest(request: Request, response: ServerResponse): Promise<void>
        {
            const ROUTER: Routing = new Routing();

            await ROUTER.loadRoutingFile();

            const ROUTES: Array<RouteConfiguration> = ROUTER.getRoutes();

            ROUTES.forEach(
                async (route: RouteConfiguration): Promise<void> => {
                    const MATCHES: RegExpMatchArray|null = request.getRequestedPath().match(route.regexp);

                    if (MATCHES !== null)
                    {
                        const QUERY: ParsedUrlQuery = {};
                        const KEYS: Array<string> = Object.keys(route.variables);

                        KEYS.forEach(
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
                        );

                        request.setQuery(QUERY);

                        const CONTROLLER_NAME: string = `${route.controller}Controller`;
                        const ACTION_NAME: string = `${route.action}Action`;

                        try
                        {
                            const FILE_STATS: Stats = await FileSystem.stat(`${__dirname}/../Controller/${CONTROLLER_NAME}.js`);

                            if (!FILE_STATS.isFile())
                            {
                                //TODO Log here that requested controller is not a file
                                throw new Error("The requested controller is not a file.");
                            }

                            const REQUESTED_CONTROLLER_CLASS = require(`${__dirname}/../Controller/${CONTROLLER_NAME}.js`);
                            
                            if (REQUESTED_CONTROLLER_CLASS.hasOwnProperty(CONTROLLER_NAME))
                            {
                                const REQUESTED_CONTROLLER = new REQUESTED_CONTROLLER_CLASS[CONTROLLER_NAME];
                                
                                if (REQUESTED_CONTROLLER[ACTION_NAME] !== undefined && REQUESTED_CONTROLLER[ACTION_NAME] instanceof Function)
                                {
                                    await REQUESTED_CONTROLLER[ACTION_NAME](request, response);
                                }
                                else
                                {
                                    //TODO Log that controller action does not exist.
                                }

                            }

                        }
                        catch (e)
                        {
                            console.log(e);
                        }

                    }
                }
            );
        }
        
    }
}

export = Model;