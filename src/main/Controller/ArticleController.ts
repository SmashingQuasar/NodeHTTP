import type { Response } from "../Web/Server/Response.js";
import { Templating } from "../Model/Templating.js";
import type { Context } from "../Web/Context.js";
/* eslint-disable class-methods-use-this */

class ArticleController
{
	/**
	 * defaultAction
	 */
	public async defaultAction(context: Context): Promise<void>
	{
		let message: string = `Hello world!
		<br />
		Everything seems to be working.
		Received variables: `;

		const VARIABLE_NAMES: Array<string> = Object.keys(context.getRequest().getQuery());

		VARIABLE_NAMES.forEach(
			(name: string) =>
			{
				const VALUE: string|Array<string>|undefined = context.getRequest().getQuery()[name];

				if (typeof VALUE === "string")
				{
					message += `<br />${name}: ${VALUE}`;
				}
			}
		);

		console.log(message);

		const TEMPLATING: Templating = new Templating();
		const CONTENT: string|undefined = await TEMPLATING.render("index.html", { title: "Hello world from templating!" });

		const RESPONSE: Response = context.getResponse();

		RESPONSE.setHeader("Content-Type", "text/html");

		RESPONSE.send(CONTENT);

		// response.write(content);

		// response.end();
	}
}

export { ArticleController };
