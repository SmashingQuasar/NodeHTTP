import type { Request } from "../Web/Client/Request.js";
import { TypeGuard } from "../Validation/TypeGuard.js";
import { JWT } from "../Web/JWT.js";
import { Configuration } from "../Model/Configuration.js";

class Authorization
{
	private constructor()
	{

	}

	/**
	 * ValidateToken
	 */
	public static async ValidateToken(token: string): Promise<boolean>
	{
		const API_CONFIGURATION: Record<string, unknown> = await Configuration.Load("api");

		if (
			!TypeGuard.HasProperty(API_CONFIGURATION, "secret")
			|| !TypeGuard.IsString(API_CONFIGURATION.secret)
		)
		{
			throw new Error("API has invalid configuration.");
		}

		try
		{
			const TOKEN: JWT = JWT.Parse(token, API_CONFIGURATION.secret);
			JWT.ValidateClaims(TOKEN.getClaims());
		}
		catch (error: unknown)
		{
			return false;
		}

		return true;
	}

	/**
	 * ValidateRequest
	 */
	public static async ValidateRequest(request: Request): Promise<boolean>
	{
		const AUTHORIZATION_HEADER: string|Array<string>|null = request.getHeader("authorization");

		if (!TypeGuard.IsString(AUTHORIZATION_HEADER))
		{
			return false;
		}

		const TOKEN: string = AUTHORIZATION_HEADER.replace(/^bearer /i, "");

		return await Authorization.ValidateToken(TOKEN);
	}
}

export { Authorization };
