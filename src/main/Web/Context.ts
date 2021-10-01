import type { Request } from "./Client/Request.js";
import type { Response } from "./Server/Response.js";
import type { ContextConfigurationInterface } from "./Context/ContextConfigurationInterface.js";

class Context
{
	private request: Request|undefined;
	private response: Response|undefined;

	/**
	 * constructor
	 */
	private constructor()
	{

	}

	/**
	 * Create
	 */
	public static Create(configuration: ContextConfigurationInterface): Context
	{
		const CONTEXT: Context = new Context();

		CONTEXT.setRequest(configuration.request);
		CONTEXT.setResponse(configuration.response);

		return CONTEXT;
	}

	/**
	 * getRequest
	 */
	public getRequest(): Request
	{
		if (this.request === undefined)
		{
			throw new Error("Context is in an unexpected state where the `request` property is undefined.");
		}

		return this.request;
	}

	/**
	 * setRequest
	 */
	public setRequest(request: Request): void
	{
		this.request = request;
	}

	/**
	 * getResponse
	 */
	public getResponse(): Response
	{
		if (this.response === undefined)
		{
			throw new Error("Context is in an unexpected state where the `response` property is undefined.");
		}

		return this.response;
	}

	/**
	 * setResponse
	 */
	public setResponse(response: Response): void
	{
		this.response = response;
	}
}

export { Context };
