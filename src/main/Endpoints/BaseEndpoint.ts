import type { Context } from "../Web/Context.js";
import type { Request } from "../Web/Client/Request.js";
import type { Response } from "../Web/Server/Response.js";

class BaseEndpoint
{
	protected static readonly REGEXP: RegExp = /^\/?$/;
	protected static readonly PRETTY: string = "/";
	protected static readonly METHOD: string = "GET";
	protected static readonly CONTENT_TYPE: string = "";
	protected static readonly TEMPLATE: string = "";

	protected variables: Record<string, unknown> = {};

	protected readonly context: Context;

	/**
	 * constructor
	 */
	public constructor(context: Context)
	{
		this.context = context;
	}

	/**
	 * GetRegExp
	 */
	public static GetRegExp(): RegExp
	{
		return this.REGEXP;
	}

	/**
	 * GetPretty
	 */
	public static GetPretty(): string
	{
		return this.PRETTY;
	}

	/**
	 * GetMethod
	 */
	public static GetMethod(): string
	{
		return this.METHOD;
	}

	/**
	 * GetContentType
	 */
	public static GetContentType(): string
	{
		return this.CONTENT_TYPE;
	}

	/**
	 * GetTemplate
	 */
	public static GetTemplate(): string
	{
		return this.TEMPLATE;
	}

	/**
	 * execute
	 */
	/* eslint-disable-next-line max-len */
	/* eslint-disable-next-line @typescript-eslint/brace-style, @typescript-eslint/no-empty-function, @typescript-eslint/require-await, class-methods-use-this */
	public async execute(): Promise<void> {}

	/**
	 * getContext
	 */
	public getContext(): Context
	{
		return this.context;
	}

	/**
	 * getRequest
	 */
	public getRequest(): Request
	{
		return this.getContext().getRequest();
	}

	/**
	 * getResponse
	 */
	public getResponse(): Response
	{
		return this.getContext().getResponse();
	}

	/**
	 * getVariables
	 */
	public getVariables(): Record<string, unknown>
	{
		return this.variables;
	}

	/**
	 * setVariables
	 */
	public setVariables(variables: Record<string, unknown>): void
	{
		this.variables = variables;
	}
}

export { BaseEndpoint };
