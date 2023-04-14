import type { OpenSSLAlgorithmEnum } from "./OpenSSLAlgorithmEnum.js";

interface JWTHeader
{
	typ: "JWT";
	alg: OpenSSLAlgorithmEnum;
}

export type { JWTHeader };
