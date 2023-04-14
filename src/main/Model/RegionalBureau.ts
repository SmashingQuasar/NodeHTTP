import { promises as FSystem } from "fs";
import { TypeGuard } from "../Validation/TypeGuard.js";
import type { InsertReturnPayloadInterface } from "../System/Database/InsertReturnPayloadInterface.js";
import type { Database } from "../System/Database.js";
import { FileSystem } from "../System/FileSystem.js";
import { Kernel } from "../System/Kernel.js";
import type { RegionalBureauInterface } from "./RegionalBureau/RegionalBureauInterface.js";
import type { CoordinatesInterface } from "./CoordinatesInterface.js";
import type { District } from "./District.js";
import { RegionalBureauEnum } from "./RegionalBureau/RegionalBureauEnum.js";

class RegionalBureau
{
	private id: number|null;
	private label: string;
	private coordinates: Array<Array<CoordinatesInterface>>|null;
	private districts: Array<number|District>|null;

	private constructor(object: RegionalBureauInterface)
	{
		this.id = null;
		this.label = object.label;
		this.coordinates = object.coordinates.length > 0 ? object.coordinates : null;
		this.districts = object.districts;
	}

	/**
	 * Create
	 */
	public static Create(object: unknown): RegionalBureau
	{
		if (!RegionalBureau.IsRegionalBureauInterface(object))
		{
			throw new Error("Invalid creation payload.");
		}

		const REGIONAL_BUREAU: RegionalBureau = new RegionalBureau(object);

		return REGIONAL_BUREAU;
	}

	/**
	 * IsRegionalBureauInterface
	 */
	public static IsRegionalBureauInterface(value: unknown): value is RegionalBureauInterface
	{
		if (!TypeGuard.IsRecord(value))
		{
			return false;
		}

		if (
			!TypeGuard.HasProperty(value, "label")
			|| !TypeGuard.HasProperty(value, "coordinates")
			|| !RegionalBureau.IsArrayCoordinatesInterface(value.coordinates)
			|| !TypeGuard.HasProperty(value, "districts")
		)
		{
			return false;
		}

		return true;
	}

	/**
	 * IsCoordinatesInterface
	 */
	public static IsCoordinatesInterface(value: unknown): value is CoordinatesInterface
	{
		if (!TypeGuard.IsRecord(value))
		{
			return false;
		}

		if (
			!TypeGuard.HasProperty(value, "latitude")
			|| !TypeGuard.HasProperty(value, "longitude")
		)
		{
			return false;
		}

		return true;
	}

	/**
	 * IsArrayCoordinatesInterface
	 */
	public static IsArrayCoordinatesInterface(value: unknown): value is Array<Array<CoordinatesInterface>>
	{
		if (!TypeGuard.IsArray(value))
		{
			return false;
		}

		for (const ITEM of value)
		{
			if (!RegionalBureau.IsCoordinatesInterface(ITEM))
			{
				return false;
			}
		}

		return true;
	}

	/**
	 * GetById
	 */
	public static async GetById(id: number): Promise<RegionalBureau|null>
	{
		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		const RESULT: Record<string, string|number|boolean>|undefined = await DATABASE.query(
			"SELECT * FROM regional_bureau WHERE id = :id",
			{
				id: id
			}
		);

		if (RESULT === undefined)
		{
			return null;
		}

		const REGIONAL_BUREAU: RegionalBureau = RegionalBureau.Create(
			{
				label: RESULT["label"],
				coordinates: [],
				districts: null
			}
		);

		const ID: string|number|boolean|undefined = RESULT["id"];

		if (!TypeGuard.IsNumber(ID))
		{
			throw new Error("Database returned non numeric ID.");
		}

		REGIONAL_BUREAU.id = ID;

		await REGIONAL_BUREAU.computeCoordinates();

		return REGIONAL_BUREAU;
	}

	/**
	 * GetByLabel
	 */
	public static async GetByLabel(label: string): Promise<RegionalBureau|null>
	{
		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		const RESULT: Record<string, string|number|boolean>|undefined = await DATABASE.query(
			"SELECT * FROM regional_bureau WHERE label = :label",
			{
				label: label
			}
		);

		if (RESULT === undefined)
		{
			return null;
		}

		const REGIONAL_BUREAU: RegionalBureau = RegionalBureau.Create(
			{
				label: RESULT["label"],
				coordinates: [],
				districts: null
			}
		);

		const ID: string|number|boolean|undefined = RESULT["id"];

		if (!TypeGuard.IsNumber(ID))
		{
			throw new Error("Database returned non numeric ID.");
		}

		REGIONAL_BUREAU.id = ID;

		await REGIONAL_BUREAU.computeCoordinates();

		return REGIONAL_BUREAU;
	}

	/**
	 * save
	 */
	public async save(): Promise<number>
	{
		if (this.id === null)
		{
			await this.insert();
		}
		else
		{
			await this.update();
		}

		if (this.id !== null)
		{
			const ROOT_DIRECTORY: string = await FileSystem.ComputeRootDirectory();
			const FILEPATH: string = `${ROOT_DIRECTORY}/build/resources/data/regional_bureau/${this.id.toString().padStart(RegionalBureauEnum.ID_PAD_LENGTH, "0")}.json`;

			await FSystem.writeFile(FILEPATH, JSON.stringify(this.coordinates));
		}

		if (!TypeGuard.IsNumber(this.id))
		{
			throw new Error("Something went horribly wrong with the CRUD operations.");
		}

		return this.id;
	}

	/**
	 * delete
	 */
	public async delete(): Promise<boolean>
	{
		if (this.id === null)
		{
			throw new Error("Unable to update applicant with null ID.");
		}

		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		await DATABASE.insert(
			`DELETE FROM regional_bureau
			WHERE
				id = :id
			`,
			{
				id: this.id
			}
		);

		return true;
	}

	/**
	 * getId
	 */
	public getId(): number|null
	{
		return this.id;
	}

	/**
	 * getLabel
	 */
	public getLabel(): string
	{
		return this.label;
	}

	/**
	 * setLabel
	 */
	public setLabel(value: string): void
	{
		this.label = value;
	}

	/**
	 * getCoordinates
	 */
	public async getCoordinates(): Promise<Array<Array<CoordinatesInterface>>|null>
	{
		if (this.coordinates === null)
		{
			await this.computeCoordinates();
		}

		return this.coordinates;
	}

	/**
	 * setCoordinates
	 */
	public setCoordinates(coordinates: Array<Array<CoordinatesInterface>>): void
	{
		this.coordinates = coordinates;
	}

	/**
	 * getDistricts
	 */
	public async getDistricts(): Promise<Array<District|number>|null>
	{
		console.log(this.districts);

		if (this.districts === null)
		{
			await this.computeDistricts();
		}

		return this.districts;
	}

	/**
	 * setDistricts
	 */
	public setDistricts(districts: Array<District|number>): void
	{
		this.districts = districts;
	}

	private async computeDistricts(): Promise<void>
	{
		if (this.id === null)
		{
			throw new Error("Impossible to computed coordinates for a regional bureau without an ID.");
		}

		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		const DISTRICT_IDS: Array<unknown> = await DATABASE.queryAll(
			`SELECT
				district_id
			FROM
				regional_bureau_district
			WHERE
				regional_bureau_id = :id
			`,
			{
				id: this.id
			}
		);

		const DISTRICTS: Array<number> = [];

		for (const RESULT of DISTRICT_IDS)
		{
			if (TypeGuard.IsRecord(RESULT) && TypeGuard.HasProperty(RESULT, "district_id") && TypeGuard.IsNumber(RESULT.district_id))
			{
				DISTRICTS.push(RESULT.district_id);
			}
		}

		this.districts = DISTRICTS;
	}

	private async computeCoordinates(): Promise<void>
	{
		if (this.id === null)
		{
			throw new Error("Impossible to computed coordinates for a regional bureau without an ID.");
		}

		const FILEPATH: string = `${Kernel.GetRootDirectory()}/build/resources/data/regional_bureau/${this.id.toString().padStart(RegionalBureauEnum.ID_PAD_LENGTH, "0")}.json`;

		if (!await FileSystem.FileExists(FILEPATH))
		{
			throw new Error(`Regional bureau with ID "${this.id.toString()}" does not have a coordinates file.`);
		}

		const FILE: string = await FileSystem.ReadTextFile(FILEPATH);

		const COORDINATES: unknown = await JSON.parse(FILE);

		if (!RegionalBureau.IsArrayCoordinatesInterface(COORDINATES))
		{
			throw new Error(`Invalid coordinates file format provided for regional bureau with ID "${this.id.toString()}".`);
		}

		this.coordinates = COORDINATES;
	}

	private async insert(): Promise<number>
	{
		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		const RESULT: InsertReturnPayloadInterface = await DATABASE.insert(
			`INSERT INTO regional_bureau (
				label
			)
			VALUES (
				:label
			)`,
			{
				label: this.label
			}
		);

		this.id = RESULT.insertId;

		return this.id;
	}

	private async update(): Promise<boolean>
	{
		if (this.id === null)
		{
			throw new Error("Unable to update regional_bureau with null ID.");
		}

		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		await DATABASE.insert(
			`UPDATE regional_bureau
			SET
				label = :label
			WHERE
				id = :id
			`,
			{
				label: this.label,
				id: this.id
			}
		);

		return true;
	}
}

export { RegionalBureau };
