import type { IncomingHttpHeaders } from "http";
// import type { Socket } from "net";
import { IncomingMessage } from "http";
import type { ParsedUrlQuery } from "querystring";
import { parse as parseQuery } from "querystring";
import type { RequestFileInterface } from "./Request/RequestFileInterface.js";

class Request extends IncomingMessage
{
	private requestedPath: string = "";
	private pathFragments: Array<string> = [];
	private query: ParsedUrlQuery = {};
	private request: ParsedUrlQuery = {};
	private rawBody: string = "";
	private body: Record<string, unknown>|string = "";
	// private readonly headers: IncomingHttpHeaders;
	/* eslint-disable */
	private contentType: string = "";
	private boundary: string = "";
	/* eslint-enable */

	/**
	 * getRawBody
	 */
	public getRawBody(): string
	{
		return this.rawBody;
	}

	/**
	 * initialize
	 */
	public initialize(): void
	{
		if (this.headers["content-type"] !== undefined)
		{
			this.contentType = this.headers["content-type"];

			if (this.contentType.includes("multipart/form-data;"))
			{
				const SPLITTED_CONTENT_TYPE: Array<string> = this.contentType.split("=");

				if (SPLITTED_CONTENT_TYPE[0] !== undefined && SPLITTED_CONTENT_TYPE[1] !== undefined)
				{
					this.boundary = `--${SPLITTED_CONTENT_TYPE[1]}`;
				}
				else
				{
					//TODO Log the error of received header
				}

				this.contentType = "multipart/form-data";
			}
		}

		if (this.url === undefined)
		{
			this.url = "";
		}

		const SPLITTED_URL: Array<string> = this.url.split("?");

		if (SPLITTED_URL[0] === undefined)
		{
			throw new Error("Unexpected error with URL splitting.");
		}

		this.requestedPath = SPLITTED_URL[0];

		if (SPLITTED_URL[1] !== undefined)
		{
			this.query = parseQuery(SPLITTED_URL[1]);
		}

		let path_fragments: Array<string> = this.requestedPath.split("/");

		path_fragments = path_fragments.filter(
			(value: string): boolean =>
			{
				return value.length !== 0;
			}
		);

		this.pathFragments = path_fragments;
	}

	/**
	 * listenForContent
	 */
	public async listenForContent(): Promise<string>
	{
		return await new Promise(
			(accept): void =>
			{
				let body: string = "";

				this.addListener(
					"data",
					(chunk: Buffer): void =>
					{
						body += chunk.toString("binary");
					}
				);

				this.addListener(
					"end",
					(): void =>
					{
						accept(body);
					}
				);
			}
		);
	}

	/**
	 * setRawBody
	 */
	public setRawBody(value: string): void
	{
		this.rawBody = value;

		switch (this.getContentType())
		{
			case "application/json":

				try
				{
					this.body = JSON.parse(this.rawBody) as Record<string, unknown>;
				}
				catch (error: unknown)
				{
					//TODO: Add error log here
				}

			break;

			case "application/x-www-form-urlencoded":

				this.request = parseQuery(this.rawBody);

			break;

			case "multipart/form-data":

				const PARTS: Array<string> = this.rawBody.split(this.boundary);
				const FILES: Array<RequestFileInterface> = [];

				PARTS.forEach(
					(part: string, index: number): void =>
					{
						if (index !== 0 && index < PARTS.length - 1)
						{
							const NAME_MATCHES: RegExpExecArray|null = /name="([^"]+)";?\s+/i.exec(part);
							let name: string = "";

							if (NAME_MATCHES !== null && NAME_MATCHES[1] !== undefined)
							{
								name = NAME_MATCHES[1].trim();
							}

							const FILENAME_MATCHES: RegExpExecArray|null = /filename="([^\n]+)";?\s+/i.exec(part);
							let filename: string = "";

							if (FILENAME_MATCHES !== null && FILENAME_MATCHES[1] !== undefined)
							{
								filename = FILENAME_MATCHES[1].trim();
							}

							const CONTENT_TYPE_MATCHES: RegExpExecArray|null = /Content-Type: ([^\s]+)\s+/i.exec(part);
							let content_type: string = "";

							if (CONTENT_TYPE_MATCHES !== null && CONTENT_TYPE_MATCHES[1] !== undefined)
							{
								content_type = CONTENT_TYPE_MATCHES[1].trim();
							}

							// Splitting on double Carriage Return + Line Feed is the distinctive point between preamble and content.
							const SPLITTED_PART: Array<string> = part.split("\r\n\r\n");

							if (SPLITTED_PART[1] === undefined)
							{
								throw new Error("Invalid multipart/form-data body received.");
							}

							if (filename === "")
							{
								this.request[name] = SPLITTED_PART[1];
							}
							else
							{
								FILES.push(
									{
										name: filename,
										mimeType: content_type,
										content: SPLITTED_PART[1]
									}
								);
							}
						}
					}
				);

			break;

			default:

				this.body = this.rawBody;

			break;
		}
	}

	/**
	 * getBody
	 */
	public getBody(): Record<string, unknown>|string
	{
		return this.body;
	}

	/**
	 * getBoundary
	 */
	public getBoundary(): string
	{
		return this.boundary;
	}

	/**
	 * getContentType
	 */
	public getContentType(): string
	{
		return this.contentType;
	}

	/**
	 * getHeaders
	 */
	public getHeaders(): IncomingHttpHeaders
	{
		return this.headers;
	}

	/**
	 * getHeader
	 */
	public getHeader(name: keyof IncomingHttpHeaders): string|Array<string>|null
	{
		let scoped_name: string = name.toString();
		scoped_name = scoped_name.toLowerCase();

		const HEADER: string|Array<string>|undefined = this.headers[scoped_name];

		if (HEADER !== undefined)
		{
			return HEADER;
		}

		return null;
	}

	/**
	 * getQuery
	 */
	public getQuery(): ParsedUrlQuery
	{
		return this.query;
	}

	/**
	 * setQuery
	 */
	public setQuery(query: ParsedUrlQuery): void
	{
		this.query = query;
	}

	/**
	 * getRequestedPath
	 */
	public getRequestedPath(): string
	{
		return this.requestedPath;
	}

	/**
	 * getPathFragments
	 */
	public getPathFragments(): Array<string>
	{
		return this.pathFragments;
	}

	/**
	 * getRequest
	 */
	public getRequest(): ParsedUrlQuery
	{
		return this.request;
	}
}

export { Request };
