import { promises as FileSystem } from "fs";
import type { Stats } from "fs";
import type { QueryParameter } from "../../declarations/QueryParameter.js";
import { Kernel } from "../System/Kernel.js";
import { Templating } from "./Templating.js";

class View
{
	protected layout: string|undefined = undefined;
	protected content: string = "";
	protected parameters: QueryParameter = {};
	protected publicDirectory: string = "";

	/**
	 * constructor
	 */
	public constructor(parameters: QueryParameter = {})
	{
		this.parameters = parameters;
	}

	/**
	 * build
	 */
	public async build(): Promise<void>
	{
		this.publicDirectory = `${Kernel.GetRootDirectory()}/www`;

		if (this.layout !== undefined && this.layout !== "")
		{
			const STATS: Stats = await FileSystem.stat(`${this.publicDirectory}/${this.layout}`);

			if (!STATS.isFile())
			{
				throw new Error(`Requested layout ${this.layout} is not a file.`);
			}

			let content: string = await FileSystem.readFile(`${this.publicDirectory}/${this.layout}`, { encoding: "utf-8" });

			if (content.includes("{{main}}"))
			{
				content = content.replace("{{main}}", this.content);
				this.content = content;
			}
		}
	}

	/**
	 * include
	 */
	public async include(path: string): Promise<void>
	{
		const TEMPLATING: Templating = new Templating();
		this.content += await TEMPLATING.render(path, this.parameters);
	}

	/**
	 * render
	 */
	public async render(): Promise<string>
	{
		return await Promise.resolve(this.content);
	}

	/**
	 * getContent
	 */
	public getContent(): string
	{
		return this.content;
	}
}

export { View };
