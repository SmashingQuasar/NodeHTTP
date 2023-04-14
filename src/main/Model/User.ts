import type { Hash } from "crypto";
import { createHash } from "crypto";
import { OpenSSLAlgorithmEnum } from "../Web/JWT/OpenSSLAlgorithmEnum.js";
import { TypeGuard } from "../Validation/TypeGuard.js";
import type { InsertReturnPayloadInterface } from "../System/Database/InsertReturnPayloadInterface.js";
import type { Database } from "../System/Database.js";
import { Kernel } from "../System/Kernel.js";
import type { UserInterface } from "./User/UserInterface.js";
import type { RegionalBureau } from "./RegionalBureau.js";

class User
{
	private id: number|null;
	private firstname: string;
	private lastname: string;
	private email: string;
	private active: boolean;
	private hash: string|null;
	private readonly regionalBureaus: Array<RegionalBureau|number>|null;

	private constructor(object: UserInterface)
	{
		this.id = null;
		this.firstname = object.firstname;
		this.lastname = object.lastname;
		this.email = object.email;
		this.active = object.active;
		this.hash = object.hash === undefined ? null : object.hash;
		this.regionalBureaus = [];
	}

	/**
	 * Create
	 */
	public static Create(object: unknown): User
	{
		if (!User.IsUserInterface(object))
		{
			throw new Error("Invalid creation payload.");
		}

		const USER: User = new User(object);

		return USER;
	}

	/**
	 * IsUserInterface
	 */
	public static IsUserInterface(value: unknown): value is UserInterface
	{
		if (!TypeGuard.IsRecord(value))
		{
			return false;
		}

		if (
			!TypeGuard.HasProperty(value, "firstname")
			|| !TypeGuard.HasProperty(value, "lastname")
			|| !TypeGuard.HasProperty(value, "email")
			|| !TypeGuard.HasProperty(value, "active")
		)
		{
			return false;
		}

		return true;
	}

	/**
	 * GetById
	 */
	public static async GetById(id: number): Promise<User|null>
	{
		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		const RESULT: Record<string, string|number|boolean>|undefined = await DATABASE.query(
			"SELECT * FROM user WHERE id = :id",
			{
				id: id
			}
		);

		if (RESULT === undefined)
		{
			return null;
		}

		const USER: User = User.Create(
			{
				firstname: RESULT["firstname"],
				lastname: RESULT["lastname"],
				email: RESULT["email"],
				hash: RESULT["hash"],
				active: RESULT["active"]
			}
		);

		const ID: string|number|boolean|undefined = RESULT["id"];

		if (!TypeGuard.IsNumber(ID))
		{
			throw new Error("Database returned non numeric ID.");
		}

		USER.id = ID;

		return USER;
	}

	/**
	 * GetByEmail
	 */
	public static async GetByEmail(email: string): Promise<User|null>
	{
		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		const RESULT: Record<string, string|number|boolean>|undefined = await DATABASE.query(
			"SELECT * FROM user WHERE email = :email",
			{
				email: email
			}
		);

		if (RESULT === undefined)
		{
			return null;
		}

		console.log(RESULT["hash"]);

		const USER: User = User.Create(
			{
				firstname: RESULT["firstname"],
				lastname: RESULT["lastname"],
				email: RESULT["email"],
				hash: RESULT["hash"],
				active: RESULT["active"]
			}
		);

		const ID: string|number|boolean|undefined = RESULT["id"];

		if (!TypeGuard.IsNumber(ID))
		{
			throw new Error("Database returned non numeric ID.");
		}

		USER.id = ID;

		return USER;
	}

	/**
	 * generateHash
	 */
	public generateHash(password: string): string
	{
		const HASH: Hash = createHash(OpenSSLAlgorithmEnum.SHA512);

		HASH.update(password);

		this.hash = HASH.digest("hex");

		return this.hash;
	}

	/**
	 * isValidPassword
	 */
	public isValidPassword(password: string): boolean
	{
		const HASH: Hash = createHash(OpenSSLAlgorithmEnum.SHA512);

		HASH.update(password);

		const HASHED_INPUT: string = HASH.digest("hex");

		console.log(this.hash, HASHED_INPUT);

		return this.hash === HASHED_INPUT;
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
			`DELETE FROM user
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
	 * getEmail
	 */
	public getEmail(): string
	{
		return this.email;
	}

	/**
	 * setEmail
	 */
	public setEmail(value: string): void
	{
		this.email = value;
	}

	/**
	 * getActive
	 */
	public getActive(): boolean
	{
		return this.active;
	}

	/**
	 * setHash
	 */
	public setHash(value: string): void
	{
		this.hash = value;
	}

	/**
	 * getHash
	 */
	public getHash(): string|null
	{
		return this.hash;
	}

	/**
	 * setActive
	 */
	public setActive(value: boolean): void
	{
		this.active = value;
	}

	/**
	 * getRegionalBureaus
	 */
	public async getRegionalBureaus(lite: boolean = true): Promise<Array<RegionalBureau|number>|null>
	{
		if (this.id === null)
		{
			throw new Error("Non-saved users cannot have associated regional bureaus.");
		}

		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		const RESULT: Record<string, string|number|boolean>|undefined = await DATABASE.query(
			`SELECT
				regional_bureau_id
			FROM
				user_regional_bureau
			WHERE
				user_id = :id
			`,
			{
				id: this.id
			}
		);

		if (!lite)
		{
			console.log(RESULT);
		}

		return this.regionalBureaus;
	}

	private async insert(): Promise<number>
	{
		const KERNEL: Kernel = Kernel.GetInstance();
		const DATABASE: Database = await KERNEL.getDb();

		const RESULT: InsertReturnPayloadInterface = await DATABASE.insert(
			`INSERT INTO user (
				firstname,
				lastname,
				email,
				hash,
				active
			)
			VALUES (
				:firstname,
				:lastname,
				:email,
				:hash,
				:active
			)`,
			{
				firstname: this.firstname,
				lastname: this.lastname,
				email: this.email,
				hash: this.hash === null ? "" : this.hash,
				active: this.active
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
			`UPDATE user
			SET
				firstname = :firstname,
				lastname = :lastname,
				email = :email,
				hash = :hash,
				active = :active
			WHERE
				id = :id
			`,
			{
				firstname: this.firstname,
				lastname: this.lastname,
				email: this.email,
				active: this.active,
				hash: this.hash === null ? "" : this.hash,
				id: this.id
			}
		);

		return true;
	}
}

export { User };
