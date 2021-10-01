import type { PathLike, Stats } from "fs";
import { promises as FileSystem } from "fs";
import type { RawRouteConfiguration } from "../../declarations/RawRouteConfiguration.js";
import type { RouteConfiguration } from "../../declarations/RouteConfiguration.js";
import { Kernel } from "../System/Kernel.js";

class Routing
{
	private sourceFilePath: PathLike = "./";
	private readonly routes: Array<RouteConfiguration> = [];

	/**
	 * loadRoutingFile
	 */
	public async loadRoutingFile(path: PathLike|undefined = undefined): Promise<void>
	{
		this.sourceFilePath = `${Kernel.GetRootDirectory()}/build/resources/configuration/routing.json`;

		let scoped_path: PathLike|undefined = path;

		if (scoped_path === undefined)
		{
			scoped_path = this.sourceFilePath;
		}

		try
		{
			const FILE_STATS: Stats = await FileSystem.stat(scoped_path);

			if (!FILE_STATS.isFile())
			{
				//TODO Log here

				throw new Error("Provided path for routing configuration file does not link to a file.");
			}

			const RAW_CONFIGURATION: string = await FileSystem.readFile(scoped_path, { encoding: "utf-8" });
			const PARSED_CONFIGURATION: Array<RawRouteConfiguration> = JSON.parse(RAW_CONFIGURATION) as Array<RawRouteConfiguration>;

			PARSED_CONFIGURATION.forEach(
				(configuration: RawRouteConfiguration): void =>
				{
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
		catch (error: unknown)
		{
			//TODO Log here
			console.log(error);
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

export { Routing };
