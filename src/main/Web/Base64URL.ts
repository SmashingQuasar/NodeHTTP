class Base64URL
{
	public static Encode(value: string): string
	{
		const BUFFER: Buffer = Buffer.from(value, "utf8");
		const BASE64: string = BUFFER.toString("base64");
		const ENCODED_VALUE: string = BASE64.replaceAll("+", "-")
			.replaceAll("/", "_")
			.replaceAll("=", "");

		return ENCODED_VALUE;
	}

	public static Decode(encoded_value: string): string
	{
		const BASE64: string = encoded_value.replaceAll("-", "+").replaceAll("_", "/");
		const BUFFER: Buffer = Buffer.from(BASE64, "base64");
		const VALUE: string = BUFFER.toString("utf8");

		return VALUE;
	}
}

export { Base64URL };
