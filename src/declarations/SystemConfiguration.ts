declare interface SystemConfiguration
{
    httpPort: number|undefined;
    wsPort: number|undefined;
    certificate: string|undefined;
    key: string|undefined;
    defaultLogDirectory: string|undefined;
    defaultLogName: string|undefined;
    defaultLogger: any;
}

