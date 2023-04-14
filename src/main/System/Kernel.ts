import { Server } from "../Web/Server.js";
import { Logger } from "../Model/Logger.js";
import { Configuration } from "../Model/Configuration.js";
import { FileSystem } from "./FileSystem.js";
import type { KernelConfigurationInterface } from "./Kernel/KernelConfigurationInterface.js";
import { Database } from "./Database.js";

class Kernel
{
	private static Instance: Kernel|undefined;

	private rootDirectory: string = "";
	private readonly logger: Logger;
	private configuration: KernelConfigurationInterface;
	private httpsServer: Server|undefined;
	private db: Database|undefined;

	private constructor()
	{
		if (Kernel.Instance !== undefined)
		{
			throw new Error("System acts as a singleton and cannot have more than one instance at a time.");
		}

		const DEFAULT_CONFIGURATION: KernelConfigurationInterface = {
			defaultLogDirectory: this.rootDirectory,
			defaultLogName: "system",
			startHTTPSServer: false,
			startWebSocket: false
		};

		this.configuration = DEFAULT_CONFIGURATION;
		this.logger = new Logger();
	}

	/**
	 * Create
	 */
	public static async Create(): Promise<Kernel>
	{
		let instance: Kernel|undefined = Kernel.Instance;

		if (instance === undefined)
		{
			instance = new Kernel();
			Kernel.SetInstance(instance);
			await instance.initializeRootDirectory();
			await instance.loadConfiguration();

			instance.getLogger().initialize();
		}

		instance.db = await Database.Create();

		return instance;
	}

	/**
	 * GetRootDirectory
	 */
	public static GetRootDirectory(): string
	{
		const INSTANCE: Kernel|undefined = Kernel.GetInstance();

		return INSTANCE.rootDirectory;
	}

	/**
	 * GetDefaultLogger
	 */
	public static GetDefaultLogger(): Logger
	{
		const INSTANCE: Kernel|undefined = Kernel.GetInstance();

		return INSTANCE.logger;
	}

	/**
	 * GetConfiguration
	 */
	public static GetConfiguration(): KernelConfigurationInterface
	{
		if (Kernel.Instance === undefined)
		{
			throw new Error("Kernel hasn't been started.");
		}

		return Kernel.Instance.configuration;
	}

	/**
	 * GetInstance
	 */
	public static GetInstance(): Kernel
	{
		if (Kernel.Instance === undefined)
		{
			throw new Error("Kernel hasn't been started.");
		}

		return Kernel.Instance;
	}

	private static SetInstance(instance: Kernel): void
	{
		Kernel.Instance = instance;
	}

	private static IsKernelConfiguration(configuration: Record<string, unknown>): configuration is KernelConfigurationInterface
	{
		let valid: boolean = true;

		valid = configuration["defaultLogDirectory"] === undefined || (typeof configuration["defaultLogDirectory"] === "string");
		valid = valid && (configuration["defaultLogName"] === undefined || (typeof configuration["defaultLogName"] === "string"));

		return valid;
	}

	/**
	 * initializeRootDirectory
	 */
	public async initializeRootDirectory(): Promise<void>
	{
		this.rootDirectory = await FileSystem.ComputeRootDirectory();
	}

	/**
	 * loadConfiguration
	 */
	public async loadConfiguration(): Promise<void>
	{
		const SYSTEM_CONFIGURATION: Record<string, unknown> = await Configuration.Load("system");

		if (!Kernel.IsKernelConfiguration(SYSTEM_CONFIGURATION))
		{
			throw new Error("Invalid system configuration provided.");
		}

		this.setConfiguration(SYSTEM_CONFIGURATION);
	}

	/**
	 * start
	 */
	public async start(): Promise<void>
	{
		if (this.configuration.startHTTPSServer)
		{
			await this.startHTTPSServer();
		}
	}

	/**
	 * getDefaultLogDirectory
	 */
	public getDefaultLogDirectory(): string
	{
		return this.configuration.defaultLogDirectory ?? "/";
	}

	/**
	 * getDefaultLogName
	 */
	public getDefaultLogName(): string
	{
		return this.configuration.defaultLogName ?? "general";
	}

	/**
	 * getLogger
	 */
	public getLogger(): Logger
	{
		return this.logger;
	}

	/**
	 * getHTTPSServer
	 */
	public getHTTPSServer(): Server|undefined
	{
		return this.httpsServer;
	}

	/**
	 * getDb
	 */
	public async getDb(): Promise<Database>
	{
		if (this.db === undefined)
		{
			this.db = await Database.Create();
		}

		return this.db;
	}

	private setConfiguration(configuration: KernelConfigurationInterface): void
	{
		this.configuration = configuration;
	}

	/**
	 * startHTTPSServer
	 */
	private async startHTTPSServer(): Promise<void>
	{
		const SERVER: Server = await Server.Create();

		this.httpsServer = SERVER;

		SERVER.start();
	}
}

export { Kernel };
