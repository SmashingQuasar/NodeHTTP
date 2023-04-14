import { TypeGuard } from "../Validation/TypeGuard.js";
import { RegionalBureau } from "../Model/RegionalBureau.js";
import { District } from "../Model/District.js";
import type { AuthenticationPayloadInterface } from "./API/AuthenticationPayloadInterface.js";
import type { AccountActivationPayloadInterface } from "./API/AccountActivationPayloadInterface.js";
import type { RegionalBureauCreationInterface } from "./API/RegionalBureau/RegionalBureauCreationInterface.js";
import type { RegionalBureauUpdateInterface } from "./API/RegionalBureau/RegionalBureauUpdateInterface.js";
import type { DistrictCreationInterface } from "./API/District/DistrictCreationInterface.js";
import type { DistrictUpdateInterface } from "./API/District/DistrictUpdateInterface.js";
import type { ApplicantCreationInterface } from "./API/Applicant/ApplicantCreationInterface.js";

class API
{
	/**
	 * IsAuthenticationPayloadInterface
	 */
	public static IsAuthenticationPayloadInterface(value: unknown): value is AuthenticationPayloadInterface
	{
		if (!TypeGuard.IsRecord(value))
		{
			return false;
		}

		if (
			!TypeGuard.HasProperty(value, "email")
			|| !TypeGuard.HasProperty(value, "password")
			|| !TypeGuard.IsString(value.email)
			|| !TypeGuard.IsString(value.password)
		)
		{
			return false;
		}

		return true;
	}

	/**
	 * IsRegionalBureauCreationInterface
	 */
	public static IsRegionalBureauCreationInterface(value: unknown): value is RegionalBureauCreationInterface
	{
		if (!TypeGuard.IsRecord(value))
		{
			return false;
		}

		if (
			!TypeGuard.HasProperty(value, "label")
			|| !TypeGuard.HasProperty(value, "coordinates")
			|| !RegionalBureau.IsArrayCoordinatesInterface(value.coordinates)
		)
		{
			return false;
		}

		return true;
	}

	/**
	 * IsRegionalBureauUpdateInterface
	 */
	public static IsRegionalBureauUpdateInterface(value: unknown): value is RegionalBureauUpdateInterface
	{
		if (!TypeGuard.IsRecord(value))
		{
			return false;
		}

		if (
			!TypeGuard.HasProperty(value, "id")
			|| !TypeGuard.HasProperty(value, "label")
			|| !TypeGuard.HasProperty(value, "coordinates")
			|| !RegionalBureau.IsArrayCoordinatesInterface(value.coordinates)
		)
		{
			return false;
		}

		return true;
	}

	/**
	 * IsDistrictCreationInterface
	 */
	public static IsDistrictCreationInterface(value: unknown): value is DistrictCreationInterface
	{
		if (!TypeGuard.IsRecord(value))
		{
			return false;
		}

		if (
			!TypeGuard.HasProperty(value, "label")
			|| !TypeGuard.HasProperty(value, "coordinates")
			|| !District.IsArrayCoordinatesInterface(value.coordinates)
		)
		{
			return false;
		}

		return true;
	}

	/**
	 * IsDistrictUpdateInterface
	 */
	public static IsDistrictUpdateInterface(value: unknown): value is DistrictUpdateInterface
	{
		if (!TypeGuard.IsRecord(value))
		{
			return false;
		}

		if (
			!TypeGuard.HasProperty(value, "id")
			|| !TypeGuard.HasProperty(value, "label")
			|| !TypeGuard.HasProperty(value, "coordinates")
			|| !District.IsArrayCoordinatesInterface(value.coordinates)
		)
		{
			return false;
		}

		return true;
	}

	/**
	 * IsApplicantCreationInterface
	 */
	public static IsApplicantCreationInterface(value: unknown): value is ApplicantCreationInterface
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
			|| !TypeGuard.HasProperty(value, "postalCode")
			|| !TypeGuard.HasProperty(value, "profile")
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
	 * IsAccountActivationRequest
	 */
	public static IsAccountActivationRequest(value: unknown): value is AccountActivationPayloadInterface
	{
		if (!TypeGuard.IsRecord(value))
		{
			return false;
		}

		if (!TypeGuard.HasProperty(value, "email"))
		{
			return false;
		}

		if (!TypeGuard.IsString(value.email))
		{
			return false;
		}

		return true;
	}
}

export { API };
