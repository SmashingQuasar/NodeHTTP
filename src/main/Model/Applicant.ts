import { TypeGuard } from "../Validation/TypeGuard.js";
import type { InsertReturnPayloadInterface } from "../System/Database/InsertReturnPayloadInterface.js";
import type { Database } from "../System/Database.js";
import { Kernel } from "../System/Kernel.js";
import type { ApplicantInterface } from "./Applicant/ApplicantInterface.js";

class Applicant
{
	private id: number|null;
	private readonly oldId: number;
	private firstname: string;
	private lastname: string;
	private gender: "male"|"female";
	private address: string;
	private supplement: string;
	private postalCode: string;
	private profile: string;
	private specialCase: boolean;
	private decision: string;
	private city: string;
	private country: string;
	private latitude: string;
	private longitude: string;

	private constructor(object: ApplicantInterface)
	{
		this.id = null;
		this.oldId = object.oldId;
		this.firstname = object.firstname;
		this.lastname = object.lastname;
		this.gender = object.gender;
		this.address = object.address;
		this.supplement = object.supplement;
		this.postalCode = object.postalCode;
		this.profile = object.profile;
		this.specialCase = object.specialCase;
		this.decision = object.decision;
		this.city = object.city;
		this.country = object.country;
		this.latitude = object.latitude;
		this.longitude = object.longitude;
	}

	/**
	 * Create
	 */
	public static Create(object: unknown): Applicant
	{
		if (!Applicant.IsApplicantInterface(object))
		{
			throw new Error("Invalid creation payload.");
		}

		const APPLICANT: Applicant = new Applicant(object);

		return APPLICANT;
	}

	/**
	 * IsApplicantInterface
	 */
	public static IsApplicantInterface(value: unknown): value is ApplicantInterface
	{
		if (!TypeGuard.IsRecord(value))
		{
			return false;
		}

		if (
			!TypeGuard.HasProperty(value, "firstname")
			|| !TypeGuard.HasProperty(value, "lastname")
			|| !TypeGuard.HasProperty(value, "gender")
			|| !TypeGuard.HasProperty(value, "address")
			|| !TypeGuard.HasProperty(value, "supplement")
			|| !TypeGuard.HasProperty(value, "postalCode")
			|| !TypeGuard.HasProperty(value, "profile")
			|| !TypeGuard.HasProperty(value, "specialCase")
			|| !TypeGuard.HasProperty(value, "decision")
			|| !TypeGuard.HasProperty(value, "city")
			|| !TypeGuard.HasProperty(value, "country")
			|| !TypeGuard.HasProperty(value, "latitude")
			|| !TypeGuard.HasProperty(value, "longitude")
		)
		{
			return false;
		}

		return true;
	}

	/**
	 * GetAll
	 */
	public static async GetAll(): Promise<Array<Record<string, number>>>
	{
		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		const RESULTS: Array<unknown> = await DATABASE.queryAll("SELECT id FROM applicant", {});

		const CONTENT: Array<Record<string, number>> = [];

		for (const RESULT of RESULTS)
		{
			if (TypeGuard.IsRecord(RESULT) && TypeGuard.HasProperty(RESULT, "id") && TypeGuard.IsNumber(RESULT.id))
			{
				CONTENT.push(
					{
						id: RESULT.id
					}
				);
			}
		}

		return CONTENT;
	}

	/**
	 * GetById
	 */
	public static async GetById(id: number): Promise<Applicant|null>
	{
		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		const RESULT: Record<string, string|number|boolean>|undefined = await DATABASE.query(
			"SELECT * FROM applicant WHERE id = :id",
			{
				id: id
			}
		);

		if (RESULT === undefined)
		{
			return null;
		}

		const APPLICANT: Applicant = Applicant.Create(
			{
				firstname: RESULT["firstname"],
				lastname: RESULT["lastname"],
				gender: RESULT["gender"],
				address: RESULT["address"],
				supplement: RESULT["supplement"],
				postalCode: RESULT["postal_code"],
				profile: RESULT["profile"],
				specialCase: RESULT["special_case"] === 1,
				decision: RESULT["decision"],
				city: RESULT["city"],
				country: RESULT["country"],
				latitude: RESULT["latitude"],
				longitude: RESULT["longitude"]
			}
		);

		const ID: string|number|boolean|undefined = RESULT["id"];

		if (!TypeGuard.IsNumber(ID))
		{
			throw new Error("Database returned non numeric ID.");
		}

		APPLICANT.id = ID;

		return APPLICANT;
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
			`DELETE FROM applicant
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
	 * getOldId
	 */
	public getOldId(): number
	{
		return this.oldId;
	}

	/**
	 * getFirstname
	 */
	public getFirstname(): string
	{
		return this.firstname;
	}

	/**
	 * setFirstname
	 */
	public setFirstname(value: string): void
	{
		this.firstname = value;
	}

	/**
	 * getLastname
	 */
	public getLastname(): string
	{
		return this.lastname;
	}

	/**
	 * setLastname
	 */
	public setLastname(value: string): void
	{
		this.lastname = value;
	}

	/**
	 * getAddress
	 */
	public getAddress(): string
	{
		return this.address;
	}

	/**
	 * getGender
	 */
	public getGender(): "male"|"female"
	{
		return this.gender;
	}

	/**
	 * setGender
	 */
	public setGender(value: "male"|"female"): void
	{
		this.gender = value;
	}

	/**
	 * setAddress
	 */
	public setAddress(value: string): void
	{
		this.address = value;
	}

	/**
	 * getSupplement
	 */
	public getSupplement(): string
	{
		return this.supplement;
	}

	/**
	 * setSupplement
	 */
	public setSupplement(value: string): void
	{
		this.supplement = value;
	}

	/**
	 * getPostalCode
	 */
	public getPostalCode(): string
	{
		return this.postalCode;
	}

	/**
	 * setPostalCode
	 */
	public setPostalCode(value: string): void
	{
		this.postalCode = value;
	}

	/**
	 * getProfile
	 */
	public getProfile(): string
	{
		return this.profile;
	}

	/**
	 * setProfile
	 */
	public setProfile(value: string): void
	{
		this.profile = value;
	}

	/**
	 * getSpecialCase
	 */
	public getSpecialCase(): boolean
	{
		return this.specialCase;
	}

	/**
	 * setSpecialCase
	 */
	public setSpecialCase(value: boolean): void
	{
		this.specialCase = value;
	}

	/**
	 * getDecision
	 */
	public getDecision(): string
	{
		return this.decision;
	}

	/**
	 * setDecision
	 */
	public setDecision(value: string): void
	{
		this.decision = value;
	}

	/**
	 * getCity
	 */
	public getCity(): string
	{
		return this.city;
	}

	/**
	 * setCity
	 */
	public setCity(value: string): void
	{
		this.city = value;
	}

	/**
	 * getCountry
	 */
	public getCountry(): string
	{
		return this.country;
	}

	/**
	 * setCountry
	 */
	public setCountry(value: string): void
	{
		this.country = value;
	}

	/**
	 * getLatitude
	 */
	public getLatitude(): string
	{
		return this.latitude;
	}

	/**
	 * setLatitude
	 */
	public setLatitude(value: string): void
	{
		this.latitude = value;
	}

	/**
	 * getLongitude
	 */
	public getLongitude(): string
	{
		return this.longitude;
	}

	/**
	 * setLongitude
	 */
	public setLongitude(value: string): void
	{
		this.longitude = value;
	}

	private async insert(): Promise<number>
	{
		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		const RESULT: InsertReturnPayloadInterface = await DATABASE.insert(
			`INSERT INTO applicant (
				firstname,
				lastname,
				gender,
				address,
				supplement,
				postal_code,
				city,
				country,
				profile,
				special_case,
				decision,
				latitude,
				longitude
			)
			VALUES (
				:firstname,
				:lastname,
				:gender,
				:address,
				:supplement,
				:postal_code,
				:city,
				:country,
				:profile,
				:specialCase,
				:decision,
				:latitude,
				:longitude
			)`,
			{
				firstname: this.firstname,
				lastname: this.lastname,
				gender: this.gender,
				address: this.address,
				supplement: this.supplement,
				postal_code: this.postalCode,
				city: this.city,
				country: this.country,
				profile: this.profile,
				specialCase: this.specialCase,
				decision: this.decision,
				latitude: this.latitude,
				longitude: this.longitude
			}
		);

		this.id = RESULT.insertId;

		return this.id;
	}

	private async update(): Promise<boolean>
	{
		if (this.id === null)
		{
			throw new Error("Unable to update applicant with null ID.");
		}

		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		await DATABASE.insert(
			`UPDATE applicant
			SET
				firstname = :firstname,
				lastname = :lastname,
				gender = :gender,
				address = :address,
				supplement = :supplement,
				postal_code = :postal_code,
				city = :city,
				country = :country,
				profile = :profile,
				special_case = :specialCase,
				decision = :decision,
				latitude = :latitude,
				longitude = :longitude
			WHERE
				id = :id
			`,
			{
				firstname: this.firstname,
				lastname: this.lastname,
				gender: this.gender,
				address: this.address,
				supplement: this.supplement,
				postal_code: this.postalCode,
				city: this.city,
				country: this.country,
				profile: this.profile,
				specialCase: this.specialCase,
				decision: this.decision,
				latitude: this.latitude,
				longitude: this.longitude,
				id: this.id
			}
		);

		return true;
	}
}

export { Applicant };
