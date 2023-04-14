const enum OpenSSLAlgorithmEnum
// Eslint does not understand const enum and interprets it as a variable declaration in constant context.
/* eslint-disable-next-line */
{
	RSA_MD4 = "MD4",
	RSA_MD5 = "MD5",
	RSA_RIPEMD160 = "RIPEMD160",
	RSA_SHA1 = "SHA1",
	RSA_SHA1_2 = "RSA-SHA1",
	RSA_SHA224 = "SHA224",
	RSA_SHA256 = "SHA256",
	RSA_SHA3_224 = "SHA3-224",
	RSA_SHA3_256 = "SHA3-256",
	RSA_SHA3_384 = "SHA3-384",
	RSA_SHA3_512 = "SHA3-512",
	RSA_SHA384 = "SHA384",
	RSA_SHA512 = "SHA512",
	RSA_SHA512_224 = "SHA512-224",
	RSA_SHA512_256 = "SHA512-256",
	RSA_SM3 = "SM3",
	BLAKE_2B512 = "BLAKE2b512",
	BLAKE_2S256 = "BLAKE2s256",
	ID_RSASSA_PKCS1_V1_5_WITH_SHA3_224 = "SHA3-224",
	ID_RSASSA_PKCS1_V1_5_WITH_SHA3_256 = "SHA3-256",
	ID_RSASSA_PKCS1_V1_5_WITH_SHA3_384 = "SHA3-384",
	ID_RSASSA_PKCS1_V1_5_WITH_SHA3_512 = "SHA3-512",
	MD4 = "MD4",
	MD4_WIWHT_RSA_ENCRYPTION = "MD4",
	MD5 = "MD5",
	MD5_SHA1 = "MD5-SHA1",
	MD5_WITH_RSA_ENCRYPTION = "MD5",
	RIPEMD = "RIPEMD160",
	RIPEMD160 = "RIPEMD160",
	RIPEMD_160_WITH_RSA = "RIPEMD160",
	RMD160 = "RIPEMD160",
	SHA1 = "SHA1",
	SHA1_WITH_RSA_ENCRYPTION = "SHA1",
	SHA224 = "SHA224",
	SHA224_WITH_RSA_ENCRYPTION = "SHA224",
	SHA256 = "SHA256",
	SHA256_WITH_RSA_ENCRYPTION = "SHA256",
	SHA3_224 = "SHA3-224",
	SHA3_256 = "SHA3-256",
	SHA3_384 = "SHA3-384",
	SHA3_512 = "SHA3-512",
	SHA384 = "SHA384",
	SHA384_WITH_RSA_ENCRYPTION = "SHA384",
	SHA512 = "SHA512",
	SHA512_224 = "SHA512-224",
	SHA512_224_WITH_RSA_ENCRYPTION = "SHA512-224",
	SHA512_256 = "SHA512-256",
	SHA512_256_WITH_RSA_ENCRYPTION = "SHA512-256",
	SHA512_WITH_RSA_ENCRYPTION = "SHA512",
	SHAKE128 = "SHAKE128",
	SHAKE256 = "SHAKE256",
	SM3 = "SM3",
	SM3_WITH_RSA_ENCRYPTION = "SM3",
	SSL3_MD5 = "MD5",
	SSL3_SHA1 = "SHA1",
	WHIRLPOOL = "whirlpool"
}

export { OpenSSLAlgorithmEnum };
