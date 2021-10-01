// import type { ServerResponse } from "http";
// import { createGzip } from "zlib";
// import type { Gzip } from "zlib";
// import { Controller } from "../Model/Controller.js";
import type { Response } from "../Web/Server/Response.js";
import type { Context } from "../Web/Context.js";
// import type { Request } from "../Web/Client/Request.js";
import { Templating } from "../Model/Templating.js";
// import { System } from "../Model/System.js";
// import { Configuration } from "../Model/Configuration.js";
// import { JobHandler } from "./../Model/JobHandler.js";
/* eslint-disable class-methods-use-this */

class DefaultController
{
	/**
	 * defaultAction
	 */
	public async defaultAction(context: Context): Promise<void>
	{
		// console.log(this);

		// console.log("Received request:");
		// console.log(context.getRequest());
		// const MESSAGE: string = `Hello world!
		// <br />
		// Everything seems to be working.
		// Received variables: `;
/*
		const VARIABLES_NAMES = Object.keys(request.getQuery());

		await Promise.all(
			VARIABLES_NAMES.map(
				(name: string): string =>
				{
					const VALUE: string|Array<string>|undefined = request.getQuery()[name];

					if (typeof VALUE === "string")
					{
						message += `<br />${name}: ${VALUE}`;
					}

					return name;
				}
			)
		);
*/
		// console.log(MESSAGE);
		const TEMPLATING: Templating = new Templating();
		const CONTENT: string|undefined = await TEMPLATING.render("index.html", { title: "Hello world from templating!" });
		// let content: string|undefined = await TEMPLATING.render("views/index.html");

		// console.log(CONTENT);

		const RESPONSE: Response = context.getResponse();

		RESPONSE.setHeader("Content-Type", "text/html");

		RESPONSE.end(CONTENT);

		// response.write(content);

		// response.end();
	}
}

export { DefaultController };
