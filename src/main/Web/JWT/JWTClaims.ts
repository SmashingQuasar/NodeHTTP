interface JWTClaims
{
	// Issued At
	iat?: number;
	// Not Before
	nbf?: number;
	// Expire
	exp?: number;
	// Issuer
	iss?: string;
	// JWT ID
	jti?: string;
	// Subject
	sub?: string;
	// Audience
	aud?: Array<string>|string;
}

export type { JWTClaims };
