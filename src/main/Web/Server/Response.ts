// import type { IncomingMessage } from "http";
import { ServerResponse } from "http";
import { createGzip } from "zlib";
import type { Gzip } from "zlib";
import type { HTTPStatusCodeEnum } from "../HTTP/HTTPStatusCodeEnum";

class Response extends ServerResponse
{
	private content: string = "";

	/**
	 * send
	 */
	public send(content?: string|Buffer|undefined): void
	{
		this.setHeader("Content-Encoding", "gzip");

		// @TODO: Make response compression great again
		const ENCODER: Gzip = createGzip();
		ENCODER.pipe(this);
		ENCODER.write(content ?? this.content);
		ENCODER.end();
	}

	/**
	 * getContent
	 */
	public getContent(): string
	{
		return this.content;
	}

	/**
	 * setContent
	 */
	public setContent(content: string): void
	{
		this.content = content;
	}

	/**
	 * setStatusCode
	 */
	public setStatusCode(status_code: HTTPStatusCodeEnum): void
	{
		this.statusCode = status_code;
	}
}

export { Response };
