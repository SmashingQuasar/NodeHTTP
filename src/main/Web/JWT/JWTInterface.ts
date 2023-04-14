import type { Secret } from "./types.js";
import type { JWTHeader } from "./JWTHeader.js";
import type { JWTClaims } from "./JWTClaims.js";

interface JWTInterface
{
	secret: Secret;
	header: JWTHeader;
	claims: JWTClaims;
}

export { JWTInterface };
