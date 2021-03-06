import { promises as FileSystem, Stats } from "fs";

module Model
{
    export class Routing
    {
        private sourceFilePath: string;
        private routes: Array<RouteConfiguration> = [];

        /**
         * constructor
         */
        public constructor()
        {
            this.sourceFilePath = `${__dirname}/../Resources/configuration/routing.json`;
        }

        /**
         * loadRoutingFile
         */
        public async loadRoutingFile(path?: string)
        {
            if (path === undefined)
            {
                path = this.sourceFilePath;
            }

            try
            {
                const FILE_STATS: Stats = await FileSystem.stat(path);

                if (!FILE_STATS.isFile())
                {
                    //TODO Log here

                    throw new Error("Provided path for routing configuration file does not link to a file.");
                }

                const RAW_CONFIGURATION: string|Buffer = await FileSystem.readFile(path, { encoding: "utf-8" });

                if (typeof RAW_CONFIGURATION !== "string")
                {
                    //TODO Log here
                    throw new Error("TODO: Handle the case where a file returns a Buffer and not a string in Routing.ts.");
                }

                const PARSED_CONFIGURATION: Array<RawRouteConfiguration> = JSON.parse(RAW_CONFIGURATION);
                
                PARSED_CONFIGURATION.forEach(
                    (configuration: RawRouteConfiguration): void => {
                        this.routes.push(
                            {
                                name: configuration.name,
                                regexp: new RegExp(configuration.regexp),
                                pretty: configuration.pretty,
                                controller: configuration.controller,
                                action: configuration.action,
                                variables: configuration.variables
                            }
                        );
                    }
                );

            }
            catch (e)
            {
                //TODO Log here
                console.log(e);
            }

        }

        /**
         * getRoutes
         */
        public getRoutes(): Array<RouteConfiguration>
        {
            return this.routes;    
        }
    }
}

export = Model;