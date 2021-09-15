declare interface JobConfiguration
{
    key: string;
    mainDomain: string;
    tableName: string;
    name: string;
    address: string;
    delay: number;
    parameters: Array<string>;
    conditions: Array<JobCondition>;
}
