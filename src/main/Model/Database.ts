import { createConnection, Connection } from "mysql2/promise";
import { promises as FileSystem } from "fs";
import { System } from "./System.js";
import { RowDataPacket, OkPacket, ResultSetHeader } from "mysql2";

class Database
{
    private static Connection?: Connection;
    private static Configuration?: DatabaseConfiguration;

    private constructor() {}

    /**
     * GetConnection
     */
    public static async GetConnection(): Promise<Connection|undefined>
    {
        if (Database.Connection === undefined)
        {
            await Database.CreateConnection();
        }

        return Database.Connection;
    }

    /**
     * CreateConnection
     */
    public static async CreateConnection(): Promise<Connection>
    {
        if (Database.Configuration === undefined)
        {
            await Database.LoadConfiguration();
        }

        const CONNECTION: Connection = await createConnection(Database.Configuration === undefined ? {} : Database.Configuration);
    
        Database.Connection = CONNECTION;

        return CONNECTION;
    }

    /**
     * LoadConfiguration
     */
    public static async LoadConfiguration(): Promise<void>
    {
        const CONFIGURATION_FILE: string = await FileSystem.readFile(`${System.RootDirectory}/build/resources/configuration/database.json`, { encoding: "utf-8" });
        const CONFIGURATION: DatabaseConfiguration = await JSON.parse(CONFIGURATION_FILE);

        Database.Configuration = CONFIGURATION;
    }

    /**
     * GetMatrix
     */
    public static async GetMatrix(query: string): Promise<Array<RowDataPacket>|Array<Array<RowDataPacket>>|Array<OkPacket>>
    {
        const CONNECTION: Connection|undefined = await Database.GetConnection();

        if (CONNECTION === undefined)
        {
            const MESSAGE: string = "Unable to initialize connection.";
            System.Logger.error(MESSAGE);

            throw new Error(MESSAGE);
        }
        
        const RESULTS: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader = (await CONNECTION.execute(query))[0];
        
        if (!Array.isArray(RESULTS))
        {
            System.Logger.error("MySQL query returned an OkPacket or ResultSetHeader object when a Array<RowDataPacket> was expected.");
            return [];
        }

        return RESULTS;
    }
}

export { Database };