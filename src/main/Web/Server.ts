import type { IncomingMessage, ServerResponse, RequestListener } from "http";
import type { ServerOptions } from "https";
import { Server as HTTPSServer } from "https";
import { Kernel } from "../System/Kernel.js";
import { Configuration } from "../Model/Configuration.js";
import { FileSystem } from "../System/FileSystem.js";
import { Request } from "./Client/Request.js";
import { Response } from "./Server/Response.js";
import { Context } from "./Context.js";
import { PortsEnum } from "./Server/PortsEnum.js";
import type { ServerConfigurationInterface } from "./Server/ServerConfigurationInterface.js";
import { Dispatcher } from "./Dispatcher.js";

class Server extends HTTPSServer
{
	private port: number = PortsEnum.DEFAULT_HTTPS;

	/**
	 * constructor
	 */
	private constructor(options: ServerOptions, listener: RequestListener)
	{
		super(options, listener);
	}

	/**
	 * Create
	 */
	public static async Create(configuration?: ServerConfigurationInterface|undefined): Promise<Server>
	{
		let scoped_configuration: ServerConfigurationInterface|undefined = configuration;

		if (scoped_configuration === undefined)
		{
			const SERVER_CONFIGURATION: Record<string, unknown> = await Configuration.Load("server");

			if (!Server.IsServerConfiguration(SERVER_CONFIGURATION))
			{
				throw new Error("Invalid configuration file provided for server.");
			}

			scoped_configuration = SERVER_CONFIGURATION;
		}

		let key_path: string = "";
		let key: Buffer = Buffer.from("");

		if (scoped_configuration.key !== undefined)
		{
			key_path = `${Kernel.GetRootDirectory()}${scoped_configuration.key}`;
			key = await FileSystem.ReadFileAsBuffer(key_path);
		}

		let certificate_path: string = "";
		let certificate: Buffer = Buffer.from("");

		if (scoped_configuration.certificate !== undefined)
		{
			certificate_path = `${Kernel.GetRootDirectory()}${scoped_configuration.certificate}`;
			certificate = await FileSystem.ReadFileAsBuffer(certificate_path);
		}

		// await Dispatcher.RegisterEndpoints();

		const SERVER: Server = new Server(
			{
				key: key,
				cert: certificate,
				IncomingMessage: Request,
				ServerResponse: Response
			},
			async (request: IncomingMessage, response: ServerResponse): Promise<void> =>
			{
				if (!(request instanceof Request) || !(response instanceof Response))
				{
					throw new Error("Impossible situation.");
				}

				const CONTEXT: Context = Context.Create(
					{
						request: request,
						response: response
					}
				);

				const DISPATCHER: Dispatcher = Dispatcher.Create(CONTEXT);

				return await DISPATCHER.prepareContext();
			}
		);

		if (scoped_configuration.httpPort !== undefined)
		{
			SERVER.setPort(scoped_configuration.httpPort);
		}

		return SERVER;
	}

	// @TODO: Look into this validation method as it could be made more robust.
	/**
	 * IsServerConfiguration
	 */
	public static IsServerConfiguration(configuration: Record<string, unknown>): configuration is ServerConfigurationInterface
	{
		let valid: boolean = true;

		valid = configuration["httpPort"] === undefined || (typeof configuration["httpPort"] === "number");

		return valid;
	}

	/**
	 * start
	 */
	public start(): void
	{
		this.listen(this.port);
		console.log("Server started.");
	}

	/**
	 * setPort
	 */
	public setPort(port: number): void
	{
		if (!Number.isInteger(port) || port < PortsEnum.LOWEST_AVAILABLE || port > PortsEnum.HIGHEST_AVAILABLE)
		{
			throw new Error(`"port" parameter isn't with range of valid ports. Must be an integer between ${PortsEnum.LOWEST_AVAILABLE.toString()} and ${PortsEnum.HIGHEST_AVAILABLE.toString()}`);
		}

		this.port = port;
	}
}

export { Server };
