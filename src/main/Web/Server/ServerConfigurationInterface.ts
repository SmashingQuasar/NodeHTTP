interface ServerConfigurationInterface extends Record<string, unknown>
{
	httpPort: number|undefined;
	// wsPort: number|undefined;
	certificate: string|undefined;
	key: string|undefined;
}

export { ServerConfigurationInterface };
