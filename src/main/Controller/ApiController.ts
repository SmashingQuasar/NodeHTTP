// import * as nodemail from "nodemailer";
import { API } from "../Service/API.js";
import type { Response } from "../Web/Server/Response.js";
import type { Context } from "../Web/Context.js";
// import type { Database } from "../System/Database.js";
/* eslint-disable class-methods-use-this */
import { HTTPStatusCodeEnum } from "../Web/HTTP/HTTPStatusCodeEnum.js";
// import { Kernel } from "../System/Kernel.js";
import { User } from "../Model/User.js";
import { JWT } from "../Web/JWT.js";
import { Configuration } from "../Model/Configuration.js";
import { TypeGuard } from "../Validation/TypeGuard.js";
import { OpenSSLAlgorithmEnum } from "../Web/JWT/OpenSSLAlgorithmEnum.js";
import { Time } from "../Model/Time.js";
import { Millisecond } from "../../declarations/Millisecond.js";
import { RegionalBureau } from "../Model/RegionalBureau.js";
import { District } from "../Model/District.js";
import { Applicant } from "../Model/Applicant.js";
import { Authorization } from "../Service/Authorization.js";

class ApiController
{
	/**
	 * defaultAction
	 */
	public async defaultAction(context: Context): Promise<void>
	{
		const RESPONSE: Response = context.getResponse();

		if (context.getRequest().method !== "POST")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.METHOD_NOT_ALLOWED;
			RESPONSE.send("Method Not Allowed");

			return;
		}

		if (context.getRequest().getContentType() !== "application/json")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		const USER: User|null = await User.GetByEmail("root@parti-animaliste.fr");

		if (USER === null)
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.NOT_FOUND;
			RESPONSE.send("Not Found");

			return;
		}

		const CONTENT: string = JSON.stringify({ success: true });

		RESPONSE.setHeader("Content-Type", "application/json");
		RESPONSE.send(CONTENT);
	}

	/**
	 * authenticateAction
	 */
	public async authenticateAction(context: Context): Promise<void>
	{
		const RESPONSE: Response = context.getResponse();

		if (context.getRequest().method !== "POST")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.METHOD_NOT_ALLOWED;
			RESPONSE.send("Method Not Allowed");

			return;
		}

		if (context.getRequest().getContentType() !== "application/json")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		const BODY = context.getRequest().getBody();

		if (!API.IsAuthenticationPayloadInterface(BODY))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		const USER: User|null = await User.GetByEmail(BODY.email);

		if (USER === null)
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.UNAUTHORIZED;
			RESPONSE.send("Unauthorized 1");

			return;
		}

		if (!USER.isValidPassword(BODY.password))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.UNAUTHORIZED;
			RESPONSE.send("Unauthorized 2");

			return;
		}

		if (!USER.getActive())
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.UNAUTHORIZED;
			RESPONSE.send("Unauthorized 3");

			return;
		}

		const API_CONFIGURATION: Record<string, unknown> = await Configuration.Load("api");

		if (!TypeGuard.HasProperty(API_CONFIGURATION, "secret") || !TypeGuard.IsString(API_CONFIGURATION.secret))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.INTERNAL_SERVER_ERROR;
			RESPONSE.send("Internal Server Error");

			return;
		}

		const NOW: number = Time.now();
		const NEXT_WEEK: Time = new Time();
		NEXT_WEEK.setTime(NOW + Millisecond.WEEK);

		const TOKEN: JWT = JWT.Create(
			{
				secret: API_CONFIGURATION.secret,
				header: {
					typ: "JWT",
					alg: OpenSSLAlgorithmEnum.SHA512
				},
				claims: {
					iat: NOW,
					exp: NEXT_WEEK.getTime(),
					sub: USER.getId()
				}
			}
		);

		const CONTENT: string = JSON.stringify({ success: true, token: TOKEN.toString() });

		RESPONSE.setHeader("Content-Type", "application/json");
		RESPONSE.send(CONTENT);
	}

	/**
	 * regenerateTokenAction
	 */
	public async regenerateTokenAction(context: Context): Promise<void>
	{
		const RESPONSE: Response = context.getResponse();

		if (context.getRequest().method !== "POST")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.METHOD_NOT_ALLOWED;
			RESPONSE.send("Method Not Allowed");

			return;
		}

		if (context.getRequest().getContentType() !== "application/json")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		if (!await Authorization.ValidateRequest(context.getRequest()))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.UNAUTHORIZED;
			RESPONSE.send("Unauthorized");
		}
	}

	/**
	 * createRegionalBureau
	 */
	public async createRegionalBureauAction(context: Context): Promise<void>
	{
		const RESPONSE: Response = context.getResponse();

		if (context.getRequest().method !== "POST")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.METHOD_NOT_ALLOWED;
			RESPONSE.send("Method Not Allowed");

			return;
		}

		if (context.getRequest().getContentType() !== "application/json")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		if (!await Authorization.ValidateRequest(context.getRequest()))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.UNAUTHORIZED;
			RESPONSE.send("Unauthorized");

			return;
		}

		const BODY = context.getRequest().getBody();

		if (!API.IsRegionalBureauCreationInterface(BODY))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		const REGIONAL_BUREAU: RegionalBureau = RegionalBureau.Create(
			{
				label: BODY.label,
				coordinates: BODY.coordinates,
				districts: []
			}
		);
		await REGIONAL_BUREAU.save();

		const CONTENT: string = JSON.stringify({ success: true, id: REGIONAL_BUREAU.getId() });

		RESPONSE.setHeader("Content-Type", "application/json");
		RESPONSE.send(CONTENT);
	}

	/**
	 * updateRegionalBureau
	 */
	public async updateRegionalBureauAction(context: Context): Promise<void>
	{
		const RESPONSE: Response = context.getResponse();

		if (context.getRequest().method !== "POST")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.METHOD_NOT_ALLOWED;
			RESPONSE.send("Method Not Allowed");

			return;
		}

		if (context.getRequest().getContentType() !== "application/json")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		if (!await Authorization.ValidateRequest(context.getRequest()))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.UNAUTHORIZED;
			RESPONSE.send("Unauthorized");

			return;
		}

		const BODY = context.getRequest().getBody();

		if (!API.IsRegionalBureauUpdateInterface(BODY))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		const REGIONAL_BUREAU: RegionalBureau|null = await RegionalBureau.GetById(BODY.id);

		if (REGIONAL_BUREAU === null)
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.NOT_FOUND;
			RESPONSE.send("Not Found");

			return;
		}

		REGIONAL_BUREAU.setLabel(BODY.label);
		REGIONAL_BUREAU.setCoordinates(BODY.coordinates);

		await REGIONAL_BUREAU.save();

		const CONTENT: string = JSON.stringify({ success: true, id: REGIONAL_BUREAU.getId() });

		RESPONSE.setHeader("Content-Type", "application/json");
		RESPONSE.send(CONTENT);
	}

	/**
	 * getRegionalBureau
	 */
	public async getRegionalBureauAction(context: Context): Promise<void>
	{
		const RESPONSE: Response = context.getResponse();

		if (context.getRequest().method !== "GET")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.METHOD_NOT_ALLOWED;
			RESPONSE.send("Method Not Allowed");

			return;
		}

		const VARIABLES: unknown = context.getRequest().getQuery();

		if (
			!TypeGuard.IsRecord(VARIABLES)
			|| !TypeGuard.HasProperty(VARIABLES, "id")
		)
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		const ID: number = Number(VARIABLES.id);

		if (!await Authorization.ValidateRequest(context.getRequest()))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.UNAUTHORIZED;
			RESPONSE.send("Unauthorized");

			return;
		}

		const REGIONAL_BUREAU: RegionalBureau|null = await RegionalBureau.GetById(ID);

		if (REGIONAL_BUREAU === null)
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.NOT_FOUND;
			RESPONSE.send("Not Found");

			return;
		}

		const CONTENT: string = JSON.stringify(
			{
				success: true,
				data: {
					id: REGIONAL_BUREAU.getId(),
					label: REGIONAL_BUREAU.getLabel(),
					coordinates: await REGIONAL_BUREAU.getCoordinates()
				}
			}
		);

		RESPONSE.setHeader("Content-Type", "application/json");
		RESPONSE.send(CONTENT);
	}

	/**
	 * getRegionalBureauDistrictsAction
	 */
	public async getRegionalBureauDistrictsAction(context: Context): Promise<void>
	{
		const RESPONSE: Response = context.getResponse();

		if (context.getRequest().method !== "GET")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.METHOD_NOT_ALLOWED;
			RESPONSE.send("Method Not Allowed");

			return;
		}

		const VARIABLES: unknown = context.getRequest().getQuery();

		if (
			!TypeGuard.IsRecord(VARIABLES)
			|| !TypeGuard.HasProperty(VARIABLES, "id")
		)
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		const ID: number = Number(VARIABLES.id);

		if (!await Authorization.ValidateRequest(context.getRequest()))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.UNAUTHORIZED;
			RESPONSE.send("Unauthorized");

			return;
		}

		const REGIONAL_BUREAU: RegionalBureau|null = await RegionalBureau.GetById(ID);

		if (REGIONAL_BUREAU === null)
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.NOT_FOUND;
			RESPONSE.send("Not Found");

			return;
		}

		const CONTENT: string = JSON.stringify(
			{
				success: true,
				data: {
					id: REGIONAL_BUREAU.getId(),
					label: REGIONAL_BUREAU.getLabel(),
					coordinates: await REGIONAL_BUREAU.getCoordinates(),
					districts: await REGIONAL_BUREAU.getDistricts()
				}
			}
		);

		RESPONSE.setHeader("Content-Type", "application/json");
		RESPONSE.send(CONTENT);
	}

	/**
	 * createDistrictAction
	 */
	public async createDistrictAction(context: Context): Promise<void>
	{
		const RESPONSE: Response = context.getResponse();

		if (context.getRequest().method !== "POST")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.METHOD_NOT_ALLOWED;
			RESPONSE.send("Method Not Allowed");

			return;
		}

		if (context.getRequest().getContentType() !== "application/json")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		if (!await Authorization.ValidateRequest(context.getRequest()))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.UNAUTHORIZED;
			RESPONSE.send("Unauthorized");

			return;
		}

		const BODY = context.getRequest().getBody();

		if (!API.IsDistrictCreationInterface(BODY))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		const DISTRICT: District = await District.Create(BODY);
		await DISTRICT.save();

		const CONTENT: string = JSON.stringify({ success: true, id: DISTRICT.getId() });

		RESPONSE.setHeader("Content-Type", "application/json");
		RESPONSE.send(CONTENT);
	}

	/**
	 * updateDistrictAction
	 */
	public async updateDistrictAction(context: Context): Promise<void>
	{
		const RESPONSE: Response = context.getResponse();

		if (context.getRequest().method !== "POST")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.METHOD_NOT_ALLOWED;
			RESPONSE.send("Method Not Allowed");

			return;
		}

		if (context.getRequest().getContentType() !== "application/json")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		if (!await Authorization.ValidateRequest(context.getRequest()))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.UNAUTHORIZED;
			RESPONSE.send("Unauthorized");

			return;
		}

		const BODY = context.getRequest().getBody();

		if (!API.IsDistrictUpdateInterface(BODY))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		const DISTRICT: District|null = await District.GetById(BODY.id);

		if (DISTRICT === null)
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.NOT_FOUND;
			RESPONSE.send("Not Found");

			return;
		}

		DISTRICT.setLabel(BODY.label);
		DISTRICT.setCoordinates(BODY.coordinates);

		await DISTRICT.save();

		const CONTENT: string = JSON.stringify({ success: true, id: DISTRICT.getId() });

		RESPONSE.setHeader("Content-Type", "application/json");
		RESPONSE.send(CONTENT);
	}

	/**
	 * getDistrictAction
	 */
	public async getDistrictAction(context: Context): Promise<void>
	{
		const RESPONSE: Response = context.getResponse();

		if (context.getRequest().method !== "GET")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.METHOD_NOT_ALLOWED;
			RESPONSE.send("Method Not Allowed");

			return;
		}

		const VARIABLES: unknown = context.getRequest().getQuery();

		if (
			!TypeGuard.IsRecord(VARIABLES)
			|| !TypeGuard.HasProperty(VARIABLES, "id")
		)
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		const ID: number = Number(VARIABLES.id);

		if (!await Authorization.ValidateRequest(context.getRequest()))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.UNAUTHORIZED;
			RESPONSE.send("Unauthorized");

			return;
		}

		const DISTRICT: District|null = await District.GetById(ID);

		if (DISTRICT === null)
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.NOT_FOUND;
			RESPONSE.send("Not Found");

			return;
		}

		const CONTENT: string = JSON.stringify(
			{
				success: true,
				data: {
					id: DISTRICT.getId(),
					label: DISTRICT.getLabel(),
					coordinates: await DISTRICT.getCoordinates()
				}
			}
		);

		RESPONSE.setHeader("Content-Type", "application/json");
		RESPONSE.send(CONTENT);
	}

	/**
	 * createApplicantAction
	 */
	public async createApplicantAction(context: Context): Promise<void>
	{
		const RESPONSE: Response = context.getResponse();

		if (context.getRequest().method !== "POST")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.METHOD_NOT_ALLOWED;
			RESPONSE.send("Method Not Allowed");

			return;
		}

		if (context.getRequest().getContentType() !== "application/json")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		if (!await Authorization.ValidateRequest(context.getRequest()))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.UNAUTHORIZED;
			RESPONSE.send("Unauthorized");

			return;
		}

		const BODY = context.getRequest().getBody();

		if (!API.IsApplicantCreationInterface(BODY))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		const APPLICANT: Applicant = Applicant.Create(BODY);
		await APPLICANT.save();

		const CONTENT: string = JSON.stringify({ success: true, id: APPLICANT.getId() });

		RESPONSE.setHeader("Content-Type", "application/json");
		RESPONSE.send(CONTENT);
	}

	/**
	 * getAllApplicantsAction
	 */
	public async getAllApplicantsAction(context: Context): Promise<void>
	{
		const RESPONSE: Response = context.getResponse();

		if (context.getRequest().method !== "GET")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.METHOD_NOT_ALLOWED;
			RESPONSE.send("Method Not Allowed");

			return;
		}

		if (!await Authorization.ValidateRequest(context.getRequest()))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.UNAUTHORIZED;
			RESPONSE.send("Unauthorized");

			return;
		}

		const APPLICANTS: Array<Record<string, number>> = await Applicant.GetAll();

		const CONTENT: string = JSON.stringify(
			{
				success: true,
				data: APPLICANTS
			}
		);

		RESPONSE.setHeader("Content-Type", "application/json");
		RESPONSE.send(CONTENT);
	}

	/**
	 * getApplicantAction
	 */
	public async getApplicantAction(context: Context): Promise<void>
	{
		const RESPONSE: Response = context.getResponse();

		if (context.getRequest().method !== "GET")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.METHOD_NOT_ALLOWED;
			RESPONSE.send("Method Not Allowed");

			return;
		}

		const VARIABLES: unknown = context.getRequest().getQuery();

		if (
			!TypeGuard.IsRecord(VARIABLES)
			|| !TypeGuard.HasProperty(VARIABLES, "id")
		)
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		const ID: number = Number(VARIABLES.id);

		if (!await Authorization.ValidateRequest(context.getRequest()))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.UNAUTHORIZED;
			RESPONSE.send("Unauthorized");

			return;
		}

		const APPLICANT: Applicant|null = await Applicant.GetById(ID);

		if (APPLICANT === null)
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.NOT_FOUND;
			RESPONSE.send("Not Found");

			return;
		}

		const CONTENT: string = JSON.stringify(
			{
				success: true,
				data: {
					id: APPLICANT.getId(),
					firstname: APPLICANT.getFirstname(),
					lastname: APPLICANT.getLastname(),
					gender: APPLICANT.getGender(),
					address: APPLICANT.getAddress(),
					supplement: APPLICANT.getSupplement(),
					postalCode: APPLICANT.getPostalCode(),
					profile: APPLICANT.getProfile(),
					decision: APPLICANT.getDecision(),
					specialCase: APPLICANT.getSpecialCase(),
					city: APPLICANT.getCity(),
					country: APPLICANT.getCountry(),
					latitude: APPLICANT.getLatitude(),
					longitude: APPLICANT.getLongitude()
				}
			}
		);

		RESPONSE.setHeader("Content-Type", "application/json");
		RESPONSE.send(CONTENT);
	}

	/**
	 * convertGeoJSONAction
	 */
	public async convertGeoJSONAction(context: Context): Promise<void>
	{
		const RESPONSE: Response = context.getResponse();

		if (context.getRequest().method !== "POST")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.METHOD_NOT_ALLOWED;
			RESPONSE.send("Method Not Allowed");

			return;
		}

		if (context.getRequest().getContentType() !== "application/json")
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.BAD_REQUEST;
			RESPONSE.send("Bad Request");

			return;
		}

		if (!await Authorization.ValidateRequest(context.getRequest()))
		{
			RESPONSE.setHeader("Content-Type", "text/html");
			RESPONSE.statusCode = HTTPStatusCodeEnum.UNAUTHORIZED;
			RESPONSE.send("Unauthorized");

			return;
		}

		const CONTENT = context.getRequest().getBody();

		if (!TypeGuard.IsRecord(CONTENT) || !TypeGuard.HasProperty(CONTENT, "features") || !TypeGuard.IsArray(CONTENT.features))
		{
			throw new Error("Bad JSON.");
		}

		const GROUPS: Array<Record<string, unknown>> = [];

		for (const FEATURE of CONTENT.features)
		{
			if (
				TypeGuard.IsRecord(FEATURE)
				&& TypeGuard.HasProperty(FEATURE, "properties")
				&& TypeGuard.IsRecord(FEATURE.properties)
				&& TypeGuard.HasProperty(FEATURE.properties, "REF")
				&& TypeGuard.HasProperty(FEATURE, "geometry")
				&& TypeGuard.IsRecord(FEATURE.geometry)
				&& TypeGuard.HasProperty(FEATURE.geometry, "coordinates")
				&& TypeGuard.IsArray(FEATURE.geometry.coordinates)
			)
			{
				const COORDINATES: Array<unknown> = [];

				for (const COORDINATES_ARRAY of FEATURE.geometry.coordinates)
				{
					const SCOPED_COORDINATES: Array<unknown> = [];

					if (TypeGuard.IsArray(COORDINATES_ARRAY))
					{
						for (const SUB_ARRAY of COORDINATES_ARRAY)
						{
							if (TypeGuard.IsArray(SUB_ARRAY))
							{
								const FIRST_VALUE: unknown = SUB_ARRAY[0];

								if (TypeGuard.IsNumber(FIRST_VALUE))
								{
									SCOPED_COORDINATES.push(
										{
											latitude: SUB_ARRAY[1],
											longitude: SUB_ARRAY[0]
										}
									);
								}
								else
								{
									for (const SUB_VALUES of SUB_ARRAY)
									{
										if (TypeGuard.IsArray(SUB_VALUES))
										{
											SCOPED_COORDINATES.push(
												{
													latitude: SUB_VALUES[1],
													longitude: SUB_VALUES[0]
												}
											);
										}
									}
								}
							}
						}

						COORDINATES.push(SCOPED_COORDINATES);
					}
				}

				GROUPS.push(
					{
						label: FEATURE.properties.REF,
						coordinates: COORDINATES
					}
				);
			}
		}

		RESPONSE.setHeader("Content-Type", "application/json");
		RESPONSE.send(JSON.stringify(GROUPS));
	}
}

export { ApiController };
