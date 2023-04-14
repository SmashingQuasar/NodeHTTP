import type { ParsedUrlQuery } from "querystring";
import type { Dirent } from "fs";
// import { Module } from "module";
import { TypeGuard } from "../Validation/TypeGuard.js";
import { FileSystem } from "../System/FileSystem.js";
import { Kernel } from "../System/Kernel.js";
import { Routing } from "../Model/Routing.js";
import { Logger } from "../Model/Logger.js";
import type { RouteConfiguration } from "../../declarations/RouteConfiguration.js";
import { BaseEndpoint } from "../Endpoints/BaseEndpoint.js";
import { HTTPStatusCodeEnum } from "./HTTP/HTTPStatusCodeEnum";
import type { Context } from "./Context.js";
import type { Request } from "./Client/Request.js";

interface ConstructorOf<ClassName>
{
	/* eslint-disable-next-line @typescript-eslint/prefer-function-type */
	new(...args: Array<unknown>): ClassName;
}

class Dispatcher
{
	private static ENDPOINTS: Array<ConstructorOf<BaseEndpoint>> = [];
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
	 * static GetEndpoints
	 */
	public static GetEndpoints(): Array<ConstructorOf<BaseEndpoint>>
	{
		return this.ENDPOINTS;
	}

	/**
	 * RegisterEndpoints
	 */
	public static async RegisterEndpoints(): Promise<void>
	{
		const ROOT_DIRECTORY: string = await FileSystem.ComputeRootDirectory();

		this.ENDPOINTS = await Dispatcher.ParseDirectoryForEndpoints(`${ROOT_DIRECTORY}/build/main/Endpoints`);

		console.log(this.ENDPOINTS);
	}

	private static IsConstructorOfBaseEndpoint(value: unknown): value is ConstructorOf<BaseEndpoint>
	{
		return value instanceof Function && value.prototype instanceof BaseEndpoint;
	}

	private static async ParseDirectoryForEndpoints(directory: string): Promise<Array<ConstructorOf<BaseEndpoint>>>
	{
		const CONTENTS: Array<Dirent> = await FileSystem.ReadDirectory(directory);
		const ENDPOINTS: Array<ConstructorOf<BaseEndpoint>> = [];

		for (const ENTITY of CONTENTS)
		{
			const FILEPATH: string = `${directory}/${ENTITY.name}`;

			if (ENTITY.isDirectory())
			{
				ENDPOINTS.concat(await Dispatcher.ParseDirectoryForEndpoints(FILEPATH));
			}
			else if (ENTITY.isFile())
			{
				if (ENTITY.name.endsWith(".mjs") && !ENTITY.name.endsWith(".spec.mjs"))
				{
					console.log(`Loading file: "${FILEPATH}".`);

					try
					{
						const CONTENT: unknown = await import(FILEPATH);

						if (TypeGuard.IsRecord(CONTENT))
						{
							const KEY: string = ENTITY.name.replace(/\..*$/, "");
							console.log(`KEY: ${KEY}`);

							if (TypeGuard.IsString(KEY))
							{
								const EXPORT: unknown = CONTENT[KEY];

								console.log("Found export");

								if (Dispatcher.IsConstructorOfBaseEndpoint(EXPORT))
								{
									console.log("Export is base endpoint");
									ENDPOINTS.push(EXPORT);
								}
							}
						}
					}
					catch (error: unknown)
					{
						console.log(`Error with file: "${FILEPATH}".`);

						if (error instanceof Error)
						{
							const LOGGER: Logger = new Logger();

							await LOGGER.logError(error);
						}
						else
						{
							console.log("Something threw a literal!: ", error);
						}
					}
				}
			}
		}

		return ENDPOINTS;
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

				let message: string = "An error occured.";

				if (error instanceof Error)
				{
					message = `An error occured: "${error.message}"`;
				}

				this.context.getResponse().send(message);
			}
		}
	}
}

export { Dispatcher };
