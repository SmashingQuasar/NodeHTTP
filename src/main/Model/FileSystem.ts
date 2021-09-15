import { promises as fs, Stats } from "fs";
// import { Logger } from "./Logger.js";
// import { System } from "./System.js";

class FileSystem
{
    /**
     * FileExists
     */
    public static async FileExists(file_path: string): Promise<boolean>
    {
        try
        {
            const STAT: Stats = await fs.stat(file_path);

            return STAT.isFile();
        }
        catch (error)
        {
            switch (error.code)
            {
                case "ENOENT":
                    return false;

                case "EACCES":
                    console.log(`Requested file ${file_path} cannot be loaded. File exists but reader got denied permissions. Error code: EACCES.`);
                    throw error;
                    
                default:
                    console.log(`Requested file ${file_path} could not be loaded due to an unhandled error. Error code: ${error.code}.`);
                    throw error;
            }
        }
    }

    /**
     * ReadFile
     */
    public static async ReadFile(file_path: string): Promise<Buffer | string>
    {
        if (!FileSystem.FileExists(file_path))
        {
            throw new Error(`Requested file ${file_path} does not exists.`);
        }

        const FILE: Buffer | string = await fs.readFile(file_path);

        return FILE;
    }

    /**
     * ReadTextFile
     */
    public static async ReadTextFile(file_path: string): Promise<string>
    {
        if (!FileSystem.FileExists(file_path))
        {
            throw new Error(`Requested file ${file_path} does not exists.`);
        }

        const FILE: string = await fs.readFile(file_path, { encoding: "utf-8" });

        return FILE;
    }

    /**
     * OpenFile
     */
    public static async OpenFile(file_path: string, flags: string): Promise<fs.FileHandle>
    {
        if (!FileSystem.FileExists(file_path))
        {
            throw new Error(`Requested file ${file_path} does not exists.`);
        }

        const FILE: fs.FileHandle = await fs.open(file_path, flags);
        
        return FILE;
    }
}

export { FileSystem };
