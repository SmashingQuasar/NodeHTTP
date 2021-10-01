import type { Stats } from "fs";
import { promises as fs } from "fs";
import type { FileSystemError } from "../../declarations/FileSystemError.js";
// import { Logger } from "./Logger.js";
// import { System } from "./System.js";

class FileSystem
{
	/**
	 * IsFileSystemError
	 */
	public static IsFileSystemError(error: unknown): error is FileSystemError
	{
		/* eslint-disable-next-line */
		// @ts-ignore
		return (error instanceof Error) && (typeof error.code === "string");
	}

	/**
	 * FileExists
	 */
	public static async FileExists(file_path: string): Promise<boolean>
	{
		try
		{
			const STAT: Stats = await fs.stat(file_path);

			return STAT.isFile();
		}
		catch (error: unknown)
		{
			if (FileSystem.IsFileSystemError(error))
			{
				switch (error.code)
				{
					case "ENOENT":
						return false;

					case "EACCES":
						console.log(`Requested file ${file_path} cannot be loaded. File exists but reader got denied permissions. Error code: EACCES.`);

						return false;

					default:
						console.log(`Requested file ${file_path} could not be loaded due to an unhandled error. Error code: ${error.code}.`);

						return false;
				}
			}
		}

		return false;
	}

	/**
	 * ReadFile
	 */
	public static async ReadFile(file_path: string): Promise<Buffer|string>
	{
		const EXISTS: boolean = await FileSystem.FileExists(file_path);

		if (!EXISTS)
		{
			throw new Error(`Requested file ${file_path} does not exists.`);
		}

		const FILE: Buffer|string = await fs.readFile(file_path);

		return FILE;
	}

	/**
	 * ReadFileAsBuffer
	 */
	public static async ReadFileAsBuffer(file_path: string): Promise<Buffer>
	{
		const FILE: Buffer|string = await FileSystem.ReadFile(file_path);

		if (typeof FILE === "string")
		{
			return Buffer.from(FILE);
		}

		return FILE;
	}

	/**
	 * ReadTextFile
	 */
	public static async ReadTextFile(file_path: string): Promise<string>
	{
		const EXISTS: boolean = await FileSystem.FileExists(file_path);

		if (!EXISTS)
		{
			throw new Error(`Requested file ${file_path} does not exists.`);
		}

		const FILE: string = await fs.readFile(file_path, { encoding: "utf-8" });

		return FILE;
	}

	/**
	 * OpenFile
	 */
	public static async OpenFile(file_path: string, flags: string): Promise<fs.FileHandle>
	{
		const EXISTS: boolean = await FileSystem.FileExists(file_path);

		if (!EXISTS)
		{
			throw new Error(`Requested file ${file_path} does not exists.`);
		}

		const FILE: fs.FileHandle = await fs.open(file_path, flags);

		return FILE;
	}
}

export { FileSystem };
