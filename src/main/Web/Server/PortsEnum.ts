const enum PortsEnum
// Eslint does not understand const enum and interprets it as a variable declaration in constant context.
/* eslint-disable-next-line */
{
	LOWEST_AVAILABLE = 1,
	HIGHEST_AVAILABLE = 65535,
	DEFAULT_HTTPS = 443,
	DEFAULT_HTTP = 80
}

export { PortsEnum };
