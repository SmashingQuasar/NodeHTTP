import type { Hmac } from "crypto";
import { createHmac } from "crypto";
import { TypeGuard } from "../Validation/TypeGuard.js";
import type { Token, Secret } from "./JWT/types.js";
import type { JWTHeader } from "./JWT/JWTHeader.js";
import type { JWTClaims } from "./JWT/JWTClaims.js";
import type { JWTInterface } from "./JWT/JWTInterface.js";
import { Constant } from "./JWT/Constant.js";
import { Base64URL } from "./Base64URL.js";
import { OpenSSLAlgorithmEnum } from "./JWT/OpenSSLAlgorithmEnum.js";

class JWT
{
	private secret!: Secret;
	private header!: JWTHeader;
	private claims!: JWTClaims;

	private constructor(algorithm: OpenSSLAlgorithmEnum, secret: Secret, claims: JWTClaims)
	{
		this.header = {
			typ: "JWT",
			alg: OpenSSLAlgorithmEnum.SHA512
		};

		this.setAlgorithm(algorithm, secret);
		this.setClaims(claims);
	}

	/**
	 * Create
	 */
	public static Create(value: unknown): JWT
	{
		if (!JWT.IsJWTInterface(value))
		{
			throw new Error("Invalid value validation");
		}

		const TOKEN: JWT = new JWT(value.header.alg, value.secret, value.claims);

		return TOKEN;
	}

	/**
	 * static IsJWTInterface
	 */
	public static IsJWTInterface(value: unknown): value is JWTInterface
	{
		if (!TypeGuard.IsRecord(value))
		{
			return false;
		}

		if (
			!TypeGuard.HasProperty(value, "secret")
			|| !TypeGuard.HasProperty(value, "header")
			|| !TypeGuard.HasProperty(value, "claims")
		)
		{
			return false;
		}

		return true;
	}

	public static Parse(encoded_token: string, secret: Secret): JWT
	{
		if (!JWT.IsEncodedToken(encoded_token))
		{
			throw new Error("Invalid JWT");
		}

		if (!JWT.IsSecret(secret))
		{
			throw new Error("Invalid secret");
		}

		const PARTS = encoded_token.split(".");

		if (!JWT.IsToken(PARTS))
		{
			throw new Error("There is an error in the validating RegExp");
		}

		const HEADER: unknown = JSON.parse(Base64URL.Decode(PARTS[Constant.TOKEN_HEADER_INDEX]));

		if (!JWT.IsHeader(HEADER))
		{
			throw new Error("Invalid JWT header");
		}

		const SIGNATURE: string = JWT.ComputeSignature(HEADER.alg, secret, `${PARTS[Constant.TOKEN_HEADER_INDEX]}.${PARTS[Constant.TOKEN_CLAIMS_INDEX]}`);

		if (SIGNATURE !== PARTS[Constant.TOKEN_SIGNATURE_INDEX])
		{
			throw new Error("Invalid token signature");
		}

		const CLAIMS: unknown = JSON.parse(Base64URL.Decode(PARTS[Constant.TOKEN_CLAIMS_INDEX]));

		if (!JWT.IsClaims(CLAIMS))
		{
			throw new Error("Claims is not an object");
		}

		const TOKEN: JWT = new JWT(HEADER.alg, secret, CLAIMS);

		return TOKEN;
	}

	public static ValidateClaims(claims: JWTClaims): void
	{
		const NOW: number = Date.now();

		if (
			TypeGuard.IsDefined(claims.iat)
			&& claims.iat > NOW
		)
		{
			throw new Error("JWT issued in the future");
		}

		if (
			TypeGuard.IsDefined(claims.nbf)
			&& claims.nbf < NOW
		)
		{
			throw new Error("JWT is not active yet");
		}

		if (
			TypeGuard.IsDefined(claims.exp)
			&& claims.exp < NOW
		)
		{
			throw new Error("JWT is expired");
		}

		if (
			TypeGuard.IsDefined(claims.iat)
			&& TypeGuard.IsDefined(claims.nbf)
			&& claims.iat > claims.nbf
		)
		{
			throw new Error("Inconsistent 'iat > nbf'");
		}

		if (
			TypeGuard.IsDefined(claims.iat)
			&& TypeGuard.IsDefined(claims.exp)
			&& claims.iat > claims.exp
		)
		{
			throw new Error("Inconsistent 'iat > exp'");
		}

		if (
			TypeGuard.IsDefined(claims.nbf)
			&& TypeGuard.IsDefined(claims.exp)
			&& claims.nbf > claims.exp
		)
		{
			throw new Error("Inconsistent 'nbf > exp'");
		}
	}

	private static IsEncodedToken(encoded_token: string): boolean
	{
		return /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+){2}$/.test(encoded_token);
	}

	private static IsSecret(secret: Secret): boolean
	{
		return !(TypeGuard.IsString(secret) && secret.length === 0);
	}

	private static IsToken(parts: Array<string>): parts is Token
	{
		return parts.length === Constant.TOKEN_PARTS;
	}

	private static IsHeader(header: unknown): header is JWTHeader
	{
		return (
			TypeGuard.IsObject(header)
			&& TypeGuard.HasProperty(header, "alg")
			&& TypeGuard.IsString(header.alg)
		);
	}

	private static ComputeSignature(algorithm: string, secret: Secret, payload: string): string
	{
		const HMAC: Hmac = createHmac(algorithm, secret);
		const HASH: Buffer = HMAC.update(payload).digest();
		const SIGNATURE: string = Base64URL.Encode(HASH.toString("binary"));

		return SIGNATURE;
	}

	private static IsClaims(claims: unknown): claims is JWTClaims
	{
		return TypeGuard.IsObject(claims);
	}

	public setAlgorithm(algorithm: OpenSSLAlgorithmEnum, secret: Secret): void
	{
		if (!JWT.IsSecret(secret))
		{
			throw new Error("Invalid secret");
		}

		this.header.alg = algorithm;
		this.secret = secret;
	}

	public getAlgorithm(): string
	{
		return this.header.alg;
	}

	public setClaims(claims: JWTClaims): void
	{
		this.claims = claims;
	}

	public getClaims(): JWTClaims
	{
		const RESULT: unknown = JSON.parse(JSON.stringify(this.claims));

		if (!JWT.IsClaims(RESULT))
		{
			throw new Error("Impossible situation.");
		}

		return RESULT;
	}

	public toString(): string
	{
		const HEADER: string = Base64URL.Encode(JSON.stringify(this.header));
		const CLAIMS: string = Base64URL.Encode(JSON.stringify(this.claims));
		const PAYLOAD: string = `${HEADER}.${CLAIMS}`;
		const SIGNATURE: string = JWT.ComputeSignature(this.header.alg, this.secret, PAYLOAD);
		const SECURE_TOKEN: string = `${PAYLOAD}.${SIGNATURE}`;

		return SECURE_TOKEN;
	}
}

export { JWT };
