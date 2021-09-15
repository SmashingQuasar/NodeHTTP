import { Job } from "./Job.js";
import { System } from "./System.js";
import { Configuration } from "./Configuration.js";

class JobHandler
{
    private jobs: Record<string, Job> = {};
    private configuration: JobHandlerConfiguration = {
        tableName: "",
        mainDomain: ""
    };

    /**
     * initialize
     */
    public async initialize(): Promise<void>
    {
        const PIMCORE_CONFIGURATION: PimcoreConfiguration = await Configuration.Load("pimcore");

        this.configuration.tableName = PIMCORE_CONFIGURATION.tableName;
        this.configuration.mainDomain = PIMCORE_CONFIGURATION.mainDomain;
    }

    /**
     * register
     */
    public async register(configuration: JobConfiguration): Promise<void>
    {
        configuration.tableName = this.configuration.tableName;
        configuration.mainDomain = this.configuration.mainDomain;
        this.jobs[configuration.key] = new Job(configuration);

        System.Logger.info(`Registered job "${configuration.name}" (${configuration.key}).`);
    }

    /**
     * unregister
     */
    public unregister(configuration: JobConfiguration): void
    {
        delete this.jobs[configuration.key];
        System.Logger.info(`Unregistered job "${configuration.name}" (${configuration.key}).`);
    }

    /**
     * getPimcoreTableName
     */
    public getPimcoreTableName(): string
    {
        return this.configuration.tableName;
    }

    /**
     * startAll
     */
    public async startAll(): Promise<void>
    {
        const JOBS_KEYS: Array<string> = Object.keys(this.jobs);

        JOBS_KEYS.forEach(
            async (key: string): Promise<void> => {
                await this.jobs[key].start();
            }
        );
    }
}

export { JobHandler };
