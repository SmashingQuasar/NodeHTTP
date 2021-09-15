import { promises as fs } from "fs";
import { FileSystem } from "./FileSystem.js";
import { System } from "./System.js";

class Configuration
{
    /**
     * Load
     */
    public static async Load<T extends object>(name: string): Promise<T>
    {

        const FILE_EXISTS: boolean = await FileSystem.FileExists(`${System.RootDirectory}/build/resources/configuration/${name}.json`);
    
        console.log(FILE_EXISTS);

        const FILE: string = await fs.readFile(`${System.RootDirectory}/build/resources/configuration/${name}.json`, { encoding: "utf-8" });


        const CONFIGURATION: T = JSON.parse(FILE);

        return CONFIGURATION;
    }
}

export { Configuration };
