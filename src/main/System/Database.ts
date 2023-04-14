import { createPool } from "mariadb";
import type { PoolConnection } from "mariadb";
import { Configuration } from "../Model/Configuration.js";
import { TypeGuard } from "../Validation/TypeGuard.js";
import type { InsertReturnPayloadInterface } from "./Database/InsertReturnPayloadInterface.js";
import type { DatabaseConfigurationInterface } from "./Database/DatabaseConfigurationInterface.js";

class Database
{
	private readonly connection: PoolConnection;

	private constructor(connection: PoolConnection)
	{
		this.connection = connection;
	}

	/**
	 * Create
	 */
	public static async Create(): Promise<Database>
	{
		const DATABASE_CONFIGURATION: Record<string, unknown> = await Configuration.Load("database");

		if (!Database.IsDatabaseConfiguration(DATABASE_CONFIGURATION))
		{
			throw new Error("Invalid configuration file provided.");
		}

		const POOL = createPool(DATABASE_CONFIGURATION);
		const CONNECTION = await POOL.getConnection();
		const DATABASE: Database = new Database(CONNECTION);

		return DATABASE;
	}

	/**
	 * IsDatabaseConfiguration
	 */
	public static IsDatabaseConfiguration(value: unknown): value is DatabaseConfigurationInterface
	{
		if (!TypeGuard.IsRecord(value))
		{
			return false;
		}

		if (!TypeGuard.HasProperty(value, "socketPath") || !TypeGuard.IsString(value.socketPath))
		{
			return false;
		}

		if (!TypeGuard.HasProperty(value, "user") || !TypeGuard.IsString(value.user))
		{
			return false;
		}

		if (!TypeGuard.HasProperty(value, "password") || !TypeGuard.IsString(value.password))
		{
			return false;
		}

		if (!TypeGuard.HasProperty(value, "database") || !TypeGuard.IsString(value.database))
		{
			return false;
		}

		return true;
	}

	/**
	 * IsInsertReturnPayload
	 */
	public static IsInsertReturnPayload(value: unknown): value is InsertReturnPayloadInterface
	{
		if (!TypeGuard.IsRecord(value))
		{
			return false;
		}

		if (!TypeGuard.HasProperty(value, "affectedRows") || !TypeGuard.IsNumber(value.affectedRows))
		{
			return false;
		}

		if (!TypeGuard.HasProperty(value, "insertId") || !TypeGuard.IsNumber(value.insertId))
		{
			return false;
		}

		if (!TypeGuard.HasProperty(value, "warningStatus") || !TypeGuard.IsNumber(value.warningStatus))
		{
			return false;
		}

		return true;
	}

	/**
	 * getConnection
	 */
	public getConnection(): PoolConnection
	{
		return this.connection;
	}

	/**
	 *  insert
	 */
	public async insert(query: string, values: Array<string>|Record<string, string|number|boolean>): Promise<InsertReturnPayloadInterface>
	{
		const RETURN: unknown = await this.connection.query(
			{
				namedPlaceholders: true,
				sql: query
			},
			values
		);

		if (!Database.IsInsertReturnPayload(RETURN))
		{
			throw new Error("Insert request ended up in odd result.");
		}

		return RETURN;
	}

	/**
	 *  update
	 */
	public async update(query: string, values: Array<string>|Record<string, string|number|boolean>): Promise<InsertReturnPayloadInterface>
	{
		const RETURN: unknown = await this.connection.query(
			{
				namedPlaceholders: true,
				sql: query
			},
			values
		);

		if (!Database.IsInsertReturnPayload(RETURN))
		{
			throw new Error("Update request ended up in odd result.");
		}

		return RETURN;
	}

	/**
	 * delete
	 */
	public async delete(query: string, values: Array<string>|Record<string, string|number|boolean>): Promise<InsertReturnPayloadInterface>
	{
		const RETURN: unknown = await this.connection.query(
			{
				namedPlaceholders: true,
				sql: query
			},
			values
		);

		if (!Database.IsInsertReturnPayload(RETURN))
		{
			throw new Error("Delete request ended up in odd result.");
		}

		return RETURN;
	}

	/**
	 * query
	 */
	public async query(query: string, values: Array<string>|Record<string, string|number|boolean>): Promise<Record<string, string|number|boolean>|undefined>
	{
		const ROWS: Array<Record<string, string|number|boolean>> = await this.connection.query(
			{
				namedPlaceholders: true,
				sql: query
			},
			values
		) as Array<Record<string, string|number|boolean>>;

		const RESULT: Record<string, string|number|boolean>|undefined = ROWS[0];

		if (RESULT === undefined)
		{
			throw new Error("Database failure.");
		}

		return RESULT;
	}

	/**
	 * queryAll
	 */
	public async queryAll(query: string, values: Array<string>|Record<string, string|number|boolean>): Promise<Array<unknown>>
	{
		const ROWS: unknown = await this.connection.query(
			{
				namedPlaceholders: true,
				sql: query
			},
			values
		);

		if (!TypeGuard.IsArray(ROWS))
		{
			return [];
		}

		const RESULT: Array<unknown> = [];

		for (const ROW of ROWS)
		{
			RESULT.push(ROW);
		}

		return RESULT;
	}
}

export { Database };
