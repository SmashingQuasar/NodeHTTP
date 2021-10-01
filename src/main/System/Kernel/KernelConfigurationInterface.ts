interface KernelConfigurationInterface extends Record<string, unknown>
{
	defaultLogDirectory: string|undefined;
	defaultLogName: string|undefined;
	startHTTPSServer: boolean|undefined;
	startWebSocket: boolean|undefined;
}

export type { KernelConfigurationInterface };
