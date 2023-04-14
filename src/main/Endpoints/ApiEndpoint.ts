// import type { Context } from "../Web/Context";
import { BaseEndpoint } from "./BaseEndpoint.js";

class ApiEndpoint extends BaseEndpoint
{
	protected regexp: RegExp = /^\/api\/district\/([0-9]+)?$/;
	protected pretty: string = "/api/district/$1";

	protected override variables: Record<string, unknown> =
	{
		id: "$1"
	};
}

export { ApiEndpoint };
