class TypeGuard
{
	public static IsDefined<Type = unknown>(value: Type): value is NonNullable<Type>
	{
		return (value !== undefined) && (value !== null);
	}

	public static IsBoolean(value: unknown): value is boolean
	{
		return (typeof value === "boolean");
	}

	public static IsString(value: unknown): value is string
	{
		return (typeof value === "string");
	}

	public static IsNumber(value: unknown): value is number
	{
		return typeof value === "number";
	}

	public static IsArray<Type = unknown>(value: unknown): value is Array<Type>
	{
		return Array.isArray(value);
	}

	public static IsRecord<KeyType extends string|number|symbol = string>(value: unknown): value is Record<KeyType, unknown>
	{
		return (typeof value === "object") && (value !== null);
	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	public static IsObject(value: unknown): value is object
	{
		return (typeof value === "object") && (value !== null);
	}

	// eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/no-shadow
	public static HasProperty<KeyName extends string>(value: object, property: KeyName): value is { [property in KeyName]: unknown }
	{
		return property in value;
	}
}

export { TypeGuard };
