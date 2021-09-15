import { ClientRequest, IncomingMessage } from "http";
import { request as https_request } from "https";
import { OkPacket, RowDataPacket } from "mysql2";
import { Database } from "./Database.js";
import { System } from "./System.js";

class Job
{
    private name: string;
    private mainDomain: string;
    private address: string;
    private delay: number;
    private parameters: Array<string>;
    private timeout?: NodeJS.Timeout;
    private tableName: string;
    private conditions: Array<JobCondition>;

    /**
     * constructor
     */
    public constructor(configuration: JobConfiguration)
    {
        this.name = configuration.name;
        this.mainDomain = configuration.mainDomain;
        this.address = configuration.address;
        this.delay = configuration.delay;
        this.parameters = configuration.parameters;
        this.tableName = configuration.tableName;
        this.conditions = configuration.conditions;
    }

    /**
     * start
     */
    public async start(): Promise<void>
    {
        await this.execute();

        this.timeout = setTimeout(
            (): void => {
                this.start();
            },
            this.delay * 1000
        );
    }

    /**
     * stop
     */
    public stop()
    {
        if (this.timeout !== undefined)
        {
            clearTimeout(this.timeout);
        }
    }

    /**
     * execute
     */
    public async execute(): Promise<void>
    {
        let query: string = `SELECT * FROM ${this.tableName}`;
        const CONDITIONS: Array<string> = [];

        this.conditions.forEach(
            (condition): void => {
                CONDITIONS.push(`${condition.property} = ${condition.value}`);
            }
        );

        if (CONDITIONS.length > 0)
        {
            query = `${query} WHERE ${CONDITIONS.join(" AND ")}`;
        }
        
        const RESULTS: Array<RowDataPacket>|Array<Array<RowDataPacket>>|Array<OkPacket> = await Database.GetMatrix(query);

        RESULTS.forEach(
            async (result: RowDataPacket|Array<RowDataPacket>|OkPacket): Promise<void> => {
                //@ts-ignore
                const ORDER_ID = result.order_id;
                const PARAMETERS: Record<string, string> = {};

                this.parameters.forEach(
                    (parameter): void => {
                        //@ts-ignore
                        if (result[parameter] !== undefined)
                        {
                            //@ts-ignore
                            PARAMETERS[parameter] = result[parameter];
                        }
                    }
                );

                let content: string = "";
                
                const FULL_ADDRESS: string = `https://${this.mainDomain}${this.address}`;

                const REQUEST: ClientRequest = https_request(
                    FULL_ADDRESS,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );

                const REQUEST_JSON: string = JSON.stringify(PARAMETERS);

                REQUEST.addListener(
                    "response",
                    (response: IncomingMessage): void => {
                        
                        response.addListener(
                            "data",
                            (chunk: string) => {
                                content += chunk;
                            }
                        );

                        response.addListener(
                            "end",
                            (): void => {
                                try
                                {
                                    const RESPONSE: StandardAjaxResponse = JSON.parse(content);

                                    if (RESPONSE.success)
                                    {
                                        System.Logger.info(`Successfully executed job ${this.name} on address "${FULL_ADDRESS}" with body "${REQUEST_JSON}".`)
                                    }
                                    else
                                    {
                                        System.Logger.error(`Failed to execut job ${this.name} on address "${FULL_ADDRESS}" with body "${REQUEST_JSON}".`);
                                        System.Logger.error(`Received message: "${RESPONSE.message}".`);
                                    }
                                }
                                catch (error)
                                {
                                    System.Logger.logError(error);
                                }

                            }
                        );
                    }
                );
        
                REQUEST.addListener(
                    "error",
                    (error): void => {
                        System.Logger.logError(error);
                    }
                );

                REQUEST.end(REQUEST_JSON);
            }
        );

    }

    /**
     * getName
     */
    public getName(): string
    {
        return this.name;    
    }
}

export { Job };
