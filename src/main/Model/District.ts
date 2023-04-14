import { promises as FSystem } from "fs";
import { TypeGuard } from "../Validation/TypeGuard.js";
import type { InsertReturnPayloadInterface } from "../System/Database/InsertReturnPayloadInterface.js";
import type { Database } from "../System/Database.js";
import { Kernel } from "../System/Kernel.js";
import { FileSystem } from "../System/FileSystem.js";
import type { DistrictInterface } from "./District/DistrictInterface.js";
import type { CoordinatesInterface } from "./CoordinatesInterface.js";
import { DistrictEnum } from "./District/DistrictEnum.js";
import { RegionalBureau } from "./RegionalBureau.js";

class District
{
	private id: number|null;
	private label: string;
	private coordinates: Array<CoordinatesInterface>|null;
	private regionalBureaus: Array<number|string|RegionalBureau>;

	private constructor(object: DistrictInterface)
	{
		this.id = null;
		this.label = object.label;
		this.coordinates = object.coordinates.length > 0 ? object.coordinates : null;
		this.regionalBureaus = object.regionalBureaus;
	}

	/**
	 * Create
	 */
	public static async Create(object: unknown): Promise<District>
	{
		if (!District.IsDistrictInterface(object))
		{
			throw new Error("Invalid creation payload.");
		}

		const DISTRICT: District = new District(object);

		await DISTRICT.computeRegionalBureaus();

		return DISTRICT;
	}

	/**
	 * IsDistrictInterface
	 */
	public static IsDistrictInterface(value: unknown): value is DistrictInterface
	{
		if (!TypeGuard.IsRecord(value))
		{
			return false;
		}

		if (
			!TypeGuard.HasProperty(value, "label")
			|| !TypeGuard.HasProperty(value, "coordinates")
			|| !TypeGuard.HasProperty(value, "regionalBureaus")
			|| !TypeGuard.IsArray(value.regionalBureaus)
			|| !District.IsArrayCoordinatesInterface(value.coordinates)
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
	public static IsArrayCoordinatesInterface(value: unknown): value is Array<CoordinatesInterface>
	{
		if (!TypeGuard.IsArray(value))
		{
			return false;
		}

		for (const ITEM of value)
		{
			if (!District.IsCoordinatesInterface(ITEM))
			{
				return false;
			}
		}

		return true;
	}

	/**
	 * GetById
	 */
	public static async GetById(id: number): Promise<District|null>
	{
		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		const RESULT: Record<string, string|number|boolean>|undefined = await DATABASE.query(
			"SELECT * FROM district WHERE id = :id",
			{
				id: id
			}
		);

		if (RESULT === undefined)
		{
			return null;
		}

		const BUREAUS: Record<string, string|number|boolean>|undefined = await DATABASE.query(
			`SELECT
				regional_bureau_id
			FROM
				regional_bureau_district
			WHERE
				district_id = :id`,
			{
				id: id
			}
		);

		console.log(BUREAUS);

		const DISTRICT: District = await District.Create(
			{
				label: RESULT["label"],
				coordinates: [],
				regionalBureaus: []
			}
		);

		const ID: string|number|boolean|undefined = RESULT["id"];

		if (!TypeGuard.IsNumber(ID))
		{
			throw new Error("Database returned non numeric ID.");
		}

		DISTRICT.id = ID;

		return DISTRICT;
	}

	/**
	 * computeRegionalBureaus
	 */
	public async computeRegionalBureaus(): Promise<void>
	{
		const EXISTING_REGIONAL_BUREAUS: Array<RegionalBureau> = [];

		await Promise.all(
			this.regionalBureaus.map(
				async (value: RegionalBureau|number|string): Promise<void> =>
				{
					let bureau: RegionalBureau|number|string|null = value;

					if (TypeGuard.IsNumber(bureau))
					{
						bureau = await RegionalBureau.GetById(bureau);
					}

					if (TypeGuard.IsString(bureau))
					{
						bureau = await RegionalBureau.GetByLabel(bureau);
					}

					if (bureau instanceof RegionalBureau)
					{
						EXISTING_REGIONAL_BUREAUS.push(bureau);
					}
				}
			)
		);

		this.regionalBureaus = EXISTING_REGIONAL_BUREAUS;
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
			const FILEPATH: string = `${ROOT_DIRECTORY}/build/resources/data/district/${this.id.toString().padStart(DistrictEnum.ID_PAD_LENGTH, "0")}.json`;

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
			throw new Error("Unable to update district with null ID.");
		}

		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		await DATABASE.insert(
			`DELETE FROM district
			WHERE
				id = :id
			`,
			{
				id: this.id
			}
		);

		await DATABASE.query(
			`DELETE FROM regional_bureau_district
			WHERE district_id = :id
			`,
			{
				district_id: this.id
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
	public async getCoordinates(): Promise<Array<CoordinatesInterface>|null>
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
	public setCoordinates(coordinates: Array<CoordinatesInterface>): void
	{
		this.coordinates = coordinates;
	}

	/**
	 * getRegionalBureaus
	 */
	public getRegionalBureaus(): Array<number|RegionalBureau|string>
	{
		return this.regionalBureaus;
	}

	private async computeCoordinates(): Promise<void>
	{
		if (this.id === null)
		{
			throw new Error("Impossible to computed coordinates for a regional bureau without an ID.");
		}

		const FILEPATH: string = `${Kernel.GetRootDirectory()}/build/resources/data/district/${this.id.toString().padStart(DistrictEnum.ID_PAD_LENGTH, "0")}.json`;

		if (!await FileSystem.FileExists(FILEPATH))
		{
			throw new Error(`Regional bureau with ID "${this.id.toString()}" does not have a coordinates file.`);
		}

		const FILE: string = await FileSystem.ReadTextFile(FILEPATH);

		const COORDINATES: unknown = await JSON.parse(FILE);

		if (!District.IsArrayCoordinatesInterface(COORDINATES))
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
			`INSERT INTO district (
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

		await DATABASE.delete(
			`DELETE FROM regional_bureau_district
			WHERE district_id = :id
			`,
			{
				id: this.id
			}
		);

		await Promise.all(
			this.regionalBureaus.map(
				async (bureau: RegionalBureau|number|string): Promise<void> =>
				{
					let bureau_id: number|null = 0;

					if (bureau instanceof RegionalBureau)
					{
						bureau_id = bureau.getId();
					}
					else if (TypeGuard.IsString(bureau))
					{
						throw new Error("Don't do this.");
					}
					else
					{
						bureau_id = bureau;
					}

					if (bureau_id !== null && this.id !== null)
					{
						await DATABASE.insert(
							`INSERT INTO regional_bureau_district (
								district_id,
								regional_bureau_id
							)
							VALUES (
								:district_id,
								:regional_bureau_id
							)`,
							{
								district_id: this.id,
								regional_bureau_id: bureau_id
							}
						);
					}
				}
			)
		);

		return this.id;
	}

	private async update(): Promise<boolean>
	{
		if (this.id === null)
		{
			throw new Error("Unable to update district with null ID.");
		}

		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		await DATABASE.insert(
			`UPDATE district
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

		await DATABASE.delete(
			`DELETE FROM regional_bureau_district
			WHERE district_id = :id
			`,
			{
				id: this.id
			}
		);

		await Promise.all(
			this.regionalBureaus.map(
				async (bureau: RegionalBureau|number|string): Promise<void> =>
				{
					let bureau_id: number|null = 0;

					if (bureau instanceof RegionalBureau)
					{
						bureau_id = bureau.getId();
					}
					else if (TypeGuard.IsString(bureau))
					{
						throw new Error("Don't do this.");
					}
					else
					{
						bureau_id = bureau;
					}

					if (bureau_id !== null && this.id !== null)
					{
						await DATABASE.insert(
							`INSERT INTO regional_bureau_district (
								district_id,
								regional_bureau_id
							)
							VALUES (
								:district_id,
								:regional_bureau_id
							)`,
							{
								district_id: this.id,
								regional_bureau_id: bureau_id
							}
						);
					}
				}
			)
		);

		return true;
	}
}

export { District };
