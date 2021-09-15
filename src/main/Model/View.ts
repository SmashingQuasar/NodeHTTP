import { promises as FileSystem, Stats } from "fs";
import { Templating } from "./Templating.js";
import { System } from "./System.js";

class View
{
    protected layout: string|null = null;
    protected content: string = "";
    protected parameters: any;
    protected publicDirectory: string = "";
    
    /**
     * constructor
     */
    public constructor(parameters?: any)
    {
        this.parameters = parameters;
    }

    /**
     * build
     */
    public async build()
    {
        this.publicDirectory = `${System.RootDirectory}/www`;
        
        if (this.layout !== null && this.layout !== "")
        {
            const STATS: Stats = await FileSystem.stat(`${this.publicDirectory}/${this.layout}`);

            if (STATS.isFile() === false)
            {
                throw new Error(`Requested layout ${this.layout} is not a file.`);
            }

            let content: Buffer|string = await FileSystem.readFile(`${this.publicDirectory}/${this.layout}`, { encoding: "utf-8" });

            if (typeof content === "string" && content.match(/{{main}}/) !== null)
            {
                content = content.replace(/{{main}}/, this.content);
                this.content = content;
            }
        }
    }

    /**
     * include
     */
    public async include(path: string)
    {
        const TEMPLATING: Templating = new Templating();
        this.content += await TEMPLATING.render(path, this.parameters);
    }

    /**
     * render
     */
    public async render(): Promise<string>
    {
        return this.content;
    }

    /**
     * getContent
     */
    public getContent(): string
    {
        return this.content;    
    }
}

export { View };
