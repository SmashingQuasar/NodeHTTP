import { promises as FileSystem } from "fs";
import { System } from "./System.js";

class Logger
{
    private filePath: string = "";
    private fileName: string = "";

    /**
     * constructor
     */
    public constructor()
    {
        this.initialize();
    }

    /**
     * initialize
     */
    public async initialize(): Promise<void>
    {
        this.filePath = System.GetDefaultLogDirectory();
        this.fileName = System.GetDefaultLogName();
    }

    /**
     * write
     */
    public async write(level: LogLevel, message: string): Promise<void>
    {
        const FILE: FileSystem.FileHandle = await FileSystem.open(`${this.filePath}/${this.fileName}.log`, "a");

        const LEVEL: string = level.toUpperCase();

        const DATE: Date = new Date();
        const FULL_YEAR: string = DATE.getUTCFullYear().toString();
        const FULL_MONTH: string = (DATE.getUTCMonth() + 1).toString().padStart(2, "0");
        const FULL_DAY: string = DATE.getUTCDate().toString().padStart(2, "0");
        const FULL_HOURS: string = DATE.getUTCHours().toString().padStart(2, "0");
        const FULL_MINUTES: string = DATE.getUTCMinutes().toString().padStart(2, "0");
        const FULL_SECONDS: string = DATE.getUTCSeconds().toString().padStart(2, "0");
        const FLAT_DATE: string = `${FULL_YEAR}-${FULL_MONTH}-${FULL_DAY} ${FULL_HOURS}:${FULL_MINUTES}:${FULL_SECONDS}`;

        const LOG_LINE: string = `[${FLAT_DATE}] [${LEVEL}] - ${message}\n`;

        console.log(LOG_LINE);
        await FILE.write(LOG_LINE);
        await FILE.close();
    }

    /**
     * logError
     */
    public async logError(error: Error): Promise<void>
    {
        let stack: string = "";
        if (error.stack !== undefined)
        {
            stack = error.stack;
        }

        let message: string = `An error occured!\n-------------------------\nMessage: "${error.message}"\nStack trace:\n${stack}\n-------------------------`;

        await this.error(message);
    }

    /**
     * debug
     */
     public async debug(message: string): Promise<void>
     {
        await this.write("debug", message);
     }

    /**
     * info
     */
     public async info(message: string): Promise<void>
     {
        await this.write("info", message);
     }

    /**
     * notice
     */
     public async notice(message: string): Promise<void>
     {
        await this.write("notice", message);
     }

    /**
     * warning
     */
     public async warning(message: string): Promise<void>
     {
        await this.write("warning", message);
     }

    /**
     * error
     */
     public async error(message: string): Promise<void>
     {
        await this.write("error", message);
     }

    /**
     * critical
     */
     public async critical(message: string): Promise<void>
     {
        await this.write("critical", message);
     }

    /**
     * alert
     */
     public async alert(message: string): Promise<void>
     {
        await this.write("alert", message);
     }

    /**
     * emergency
     */
     public async emergency(message: string): Promise<void>
     {
        await this.write("emergency", message);
     }
        
    /**
     * setFilePath
     */
    public setFilePath(file_path: string): void
    {
        this.filePath = file_path;
    }

    /**
     * getFilePath
     */
    public getFilePath(): string
    {
        return this.filePath;
    }

    /**
     * setFileName
     */
    public setFileName(file_name: string): void
    {
        this.fileName = file_name;
    }

    /**
     * getFileName
     */
    public getFileName(): string
    {
        return this.fileName;
    }
}

export { Logger };
