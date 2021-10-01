import type { ParsedUrlQuery } from "querystring";
import { FileSystem } from "../Model/FileSystem.js";
import { Kernel } from "../System/Kernel.js";
import { Routing } from "../Model/Routing.js";
import type { RouteConfiguration } from "../../declarations/RouteConfiguration.js";
import { HTTPStatusCodeEnum } from "./HTTP/HTTPStatusCodeEnum";
import type { Context } from "./Context.js";
import type { Request } from "./Client/Request.js";

class Dispatcher
{
	private readonly context: Context;

	private constructor(context: Context)
	{
		this.context = context;
	}

	/**
	 * Create
	 */
	public static Create(context: Context): Dispatcher
	{
		const DISPATCHER: Dispatcher = new Dispatcher(context);

		return DISPATCHER;
	}

	/**
	 * prepareContext
	 */
	public async prepareContext(): Promise<void>
	{
		const REQUEST: Request = this.context.getRequest();
		REQUEST.initialize();
		const BODY: string = await REQUEST.listenForContent();
		REQUEST.setRawBody(BODY);

		// @TODO: Properly organize global error handling.

		try
		{
			await this.dispatchContext();
		}
		catch (error: unknown)
		{
			if (error instanceof Error)
			{
				await Kernel.GetDefaultLogger().logError(error);
				this.context.getResponse().setStatusCode(HTTPStatusCodeEnum.NOT_FOUND);
				this.context.getResponse().send("404 - Not found.");
			}
		}
	}

	private async dispatchContext(): Promise<void>
	{
		const ROUTER: Routing = new Routing();

		await ROUTER.loadRoutingFile();

		const ROUTES: Array<RouteConfiguration> = ROUTER.getRoutes();

		const REQUEST: Request = this.context.getRequest();

		let controller_name: string = "";
		let action_name: string = "";

		await Promise.all(
			ROUTES.map(
				async (route: RouteConfiguration): Promise<void> =>
				{
					const MATCHES: RegExpExecArray|null = route.regexp.exec(REQUEST.getRequestedPath());

					if (MATCHES !== null)
					{
						const QUERY: ParsedUrlQuery = {};
						const KEYS: Array<string> = Object.keys(route.variables);

						await Promise.all(
							KEYS.map(
								(name: string): undefined =>
								{
									const SCOPED_VARIABLE: string|undefined = route.variables[name];

									if (SCOPED_VARIABLE === undefined)
									{
										//@TODO: Handle error case
										throw new Error("Unhandled variable.");
									}

									const VARIABLE_REFERENCE: string = SCOPED_VARIABLE;

									if (!(/^\$[0-9]+$/.test(VARIABLE_REFERENCE)))
									{
										//@TODO:  Log variable reference exception here
									}

									const INDEX: number = parseInt(VARIABLE_REFERENCE.substring(1), 10);

									if (MATCHES[INDEX] === undefined)
									{
										//@TODO:  Log not found variable value exception here
									}

									QUERY[name] = MATCHES[INDEX];

									return undefined;
								}
							)
						);

						REQUEST.setQuery(QUERY);
						controller_name = `${route.controller}Controller`;
						action_name = `${route.action}Action`;
					}
				}
			)
		);

		if (controller_name === "" || action_name === "")
		{
			const PUBLIC_PATH: string = `${Kernel.GetRootDirectory()}/www`;

			try
			{
				const FILE: Buffer = await FileSystem.ReadFileAsBuffer(`${PUBLIC_PATH}/${REQUEST.getRequestedPath()}`);

				this.context.getResponse().send(FILE);
			}
			catch (error: unknown)
			{
				throw new Error("Requested file does not exist");
			}
		}
		else
		{
			try
			{
				const CLASS_PATH: string = `${Kernel.GetRootDirectory()}/build/main/Controller/${controller_name}.mjs`;
				const FILE_EXISTS: boolean = await FileSystem.FileExists(CLASS_PATH);

				if (!FILE_EXISTS)
				{
					//TODO Log here that requested controller is not a file
					throw new Error("The requested controller is not a file.");
				}
				/* eslint-disable */
				const REQUESTED_CONTROLLER_CLASS = await import(CLASS_PATH);
				const REQUESTED_CONTROLLER = new REQUESTED_CONTROLLER_CLASS[controller_name];

				if (REQUESTED_CONTROLLER[action_name] !== undefined && REQUESTED_CONTROLLER[action_name] instanceof Function)
				{
					await REQUESTED_CONTROLLER[action_name](this.context);
					/* eslint-enable */
				}
				else
				{
					//TODO Log that controller action does not exist.
				}
			}
			catch (error: unknown)
			{
				console.log(error);
			}
		}
	}
}

export { Dispatcher };
