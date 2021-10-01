import type { Request } from "../Client/Request.js";
import type { Response } from "../Server/Response.js";

interface ContextConfigurationInterface
{
	request: Request;
	response: Response;
}

export type { ContextConfigurationInterface };
