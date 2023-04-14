import { promises as fs } from "fs";
// import { Kernel } from "../System/Kernel.js";
import { FileSystem } from "../System/FileSystem.js";

class Configuration
{
	/**
	 * Load
	 */
	public static async Load<T extends Record<string, unknown>>(name: string): Promise<T>
	{
		const ROOT_DIR: string = await FileSystem.ComputeRootDirectory();
		const FILEPATH: string = `${ROOT_DIR}/build/resources/configuration/${name}.json`;
		const FILE_EXISTS: boolean = await FileSystem.FileExists(FILEPATH);

		if (!FILE_EXISTS)
		{
			throw new Error(`Requested configuration file does not exist. Requested file: "${FILEPATH}"`);
		}

		try
		{
			const FILE: string = await fs.readFile(`${ROOT_DIR}/build/resources/configuration/${name}.json`, { encoding: "utf-8" });
			const CONFIGURATION: T = JSON.parse(FILE) as T;

			return CONFIGURATION;
		}
		catch (error: unknown)
		{
			console.group("Error occured.");
			console.log(typeof error);
			/* eslint-disable */
			//@ts-ignore
			console.log(Object.getPrototypeOf(error).name);
			/* eslint-enable */
			console.log(error);
			console.groupEnd();

			throw error;
		}
	}
}

export { Configuration };
