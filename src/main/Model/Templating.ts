import type { Stats } from "fs";
import { basename } from "path";
import { promises as FileSystem } from "fs";
import type { QueryParameter } from "../../declarations/QueryParameter.js";
import { Kernel } from "../System/Kernel.js";
import type { View as AbstractView } from "./View.js";

class Templating
{
	protected publicDirectory: string = "";

	/**
	 * render
	 */
	public async render(path: string, parameters?: QueryParameter): Promise<string|undefined>
	{
		this.publicDirectory = `${Kernel.GetRootDirectory()}/www`;

		try
		{
			const FULL_PATH: string = `${this.publicDirectory}/${path}`;
			const FILE_STATS: Stats = await FileSystem.stat(FULL_PATH);

			if (!FILE_STATS.isFile())
			{
				throw new Error(`Attempted to render path "${FULL_PATH}". Directory found.`);
				//@TODO: Log path is a directory error
			}

			const FILE: string = await FileSystem.readFile(FULL_PATH, { encoding: "utf-8" });
			let template: string = FILE;

			if (parameters !== undefined)
			{
				const PARAMETERS_NAMES: Array<string> = Object.keys(parameters);

				for (const PARAMETER of PARAMETERS_NAMES)
				{
					const LOCAL_REGEXP: RegExp = new RegExp(`{{${PARAMETER}}}`);
					/* eslint-disable-next-line no-template-curly-in-string */
					template = template.replace(LOCAL_REGEXP, "${PARAMETER}");
				}
			}

			/* Layout */
			const REGEXP: RegExp = /{{layout: *([^}]+)}}/;
			const LAYOUT: RegExpExecArray|null = REGEXP.exec(template);

			let layout: string = "";

			if (LAYOUT !== null && LAYOUT[1] !== undefined)
			{
				layout = LAYOUT[1];
			}

			template = template.replace(/{{layout: *([^}]+)}}/, "");

			/* Includes */

			template = template.replace(/{{include: *([^}]+)}}/g, "`;\r\nawait this.include('$1');\r\nthis.content += `");

			/* For loop */

			template = template.replace(/{{for: *([^}]+)}}/g, "`;\r\nfor ($1)\r\n{\r\nthis.content += `");
			template = template.replace(/{{endfor}}/g, "`;\r\n}\r\nthis.content += `");

			/* If statement */

			template = template.replace(/{{if: *([^}]+)}}/g, "`;\r\nif ($1)\r\n{\r\nthis.content += `");
			template = template.replace(/{{else if: *([^}]+)}}/g, "`;\r\n}\r\nelse if ($1) {\r\nthis.content += `");
			template = template.replace(/{{else}}/g, "`;\r\n}\r\nelse\r\n{\r\nthis.content += `");
			template = template.replace(/{{endif}}/g, "`;\r\n}\r\nthis.content += `");
			/* eslint-disable-next-line no-template-curly-in-string */
			template = template.replace(/{{([^}]+)}}/g, "${$1}");

			template = `
import { View as AbstractView } from "${Kernel.GetRootDirectory()}/build/main/Model/View.js";

class View extends AbstractView
{
	constructor(parameters)
	{
		super(parameters);
		this.layout = '${layout}';
	}
	async render()
	{
		this.content = \`${template}\`;
		return this.content;
	}
}
export { View };
`;

			// const SAVE_DIRECTORY_MATCH: RegExpMatchArray|null = path.match(/(.*)\/[^/]+\.html$/)
			// let save_directory: string = "";
			// console.log(SAVE_DIRECTORY_MATCH);

			// if (SAVE_DIRECTORY_MATCH !== null)
			// {
			//     save_directory = `${__DIRNAME__}/../../cache/${SAVE_DIRECTORY_MATCH[1]}`;
			// }
			// else
			// {
			//     save_directory = `${__DIRNAME__}/../../cache`;
			// }

			const FILENAME: string = basename(path);

			const SAVE_PATH: string = path.replace(new RegExp(`/?${FILENAME}`), "");

			const DESTINATION_DIRECTORY: string = `${Kernel.GetRootDirectory()}/build/cache/${SAVE_PATH}`;

			await FileSystem.mkdir(DESTINATION_DIRECTORY, { recursive: true });

			const FULL_FILE_PATH: string = `${DESTINATION_DIRECTORY}/${FILENAME}.mjs`;

			await FileSystem.writeFile(FULL_FILE_PATH, template);

			/* eslint-disable @typescript-eslint/no-unsafe-assignment */
			/* eslint-disable @typescript-eslint/naming-convention */
			/* eslint-disable @typescript-eslint/no-unsafe-call */
			const { View } = await import(FULL_FILE_PATH);
			const VIEW: AbstractView = new View(parameters) as AbstractView;
			/* eslint-enable @typescript-eslint/no-unsafe-assignment */
			/* eslint-enable @typescript-eslint/naming-convention */
			/* eslint-enable @typescript-eslint/no-unsafe-call */

			// console.log(template);

			await VIEW.render();
			await VIEW.build();
			const CONTENT: string = VIEW.getContent();

			return CONTENT;
		}
		catch (error: unknown)
		{
			console.log("------------------------------------------");
			console.log(error);
			console.log(`Attempted to render path "${path}". File not found.`);
			console.log("------------------------------------------");
			//TODO Log file not found error here

			return undefined;
		}
	}
}

export { Templating };
