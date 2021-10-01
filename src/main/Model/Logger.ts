import { promises as FileSystem } from "fs";
import { LogLevel } from "../../declarations/LogLevel.js";
import { Kernel } from "../System/Kernel.js";
import { Time } from "./Time.js";

class Logger
{
	private filePath: string = "";
	private fileName: string = "";

	/**
	 * initialize
	 */
	public initialize(): void
	{
		const KERNEL: Kernel = Kernel.GetInstance();
		this.filePath = KERNEL.getDefaultLogDirectory();
		this.fileName = KERNEL.getDefaultLogName();
	}

	/**
	 * write
	 */
	public async write(level: LogLevel, message: string): Promise<void>
	{
		const FILE: FileSystem.FileHandle = await FileSystem.open(`${this.filePath}/${this.fileName}.log`, "a");

		const LEVEL: string = level.toUpperCase();

		const DATE: Time = new Time();
		const FORMATTED_DATE: string = DATE.format("Y-m-d H:i:s");

		const LOG_LINE: string = `[${FORMATTED_DATE}] [${LEVEL}] - ${message}\n`;

		console.log(LOG_LINE);
		await FILE.write(LOG_LINE);
		await FILE.close();
	}

	/**
	 * logError
	 */
	public async logError(error: unknown): Promise<void>
	{
		if (!(error instanceof Error))
		{
			throw new Error("Logger.logError can only handle Error and it's derivates.");
		}

		let stack: string = "";

		if (error.stack !== undefined)
		{
			stack = error.stack;
		}

		const MESSAGE: string = `An error occured!\n-------------------------\nMessage: "${error.message}"\nStack trace:\n${stack}\n-------------------------`;

		await this.error(MESSAGE);
	}

	/**
	 * debug
	 */
	public async debug(message: string): Promise<void>
	{
		await this.write(LogLevel.DEBUG, message);
	}

	/**
	 * info
	 */
	public async info(message: string): Promise<void>
	{
		await this.write(LogLevel.INFO, message);
	}

	/**
	 * notice
	 */
	public async notice(message: string): Promise<void>
	{
		await this.write(LogLevel.NOTICE, message);
	}

	/**
	 * warning
	 */
	public async warning(message: string): Promise<void>
	{
		await this.write(LogLevel.WARNING, message);
	}

	/**
	 * error
	 */
	public async error(message: string): Promise<void>
	{
		await this.write(LogLevel.ERROR, message);
	}

	/**
	 * critical
	 */
	public async critical(message: string): Promise<void>
	{
		await this.write(LogLevel.CRITICAL, message);
	}

	/**
	 * alert
	 */
	public async alert(message: string): Promise<void>
	{
		await this.write(LogLevel.ALERT, message);
	}

	/**
	 * emergency
	 */
	public async emergency(message: string): Promise<void>
	{
		await this.write(LogLevel.EMERGENCY, message);
	}

	/**
	 * setFilePath
	 */
	public setFilePath(file_path: string): void
	{
		this.filePath = file_path;
	}

	/**
	 * getFilePath
	 */
	public getFilePath(): string
	{
		return this.filePath;
	}

	/**
	 * setFileName
	 */
	public setFileName(file_name: string): void
	{
		this.fileName = file_name;
	}

	/**
	 * getFileName
	 */
	public getFileName(): string
	{
		return this.fileName;
	}
}

export { Logger };
