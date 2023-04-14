import type { CoordinatesInterface } from "../../../Model/CoordinatesInterface.js";

interface ApplicantUpdateInterface
{
	id: number;
	label: string;
	coordinates: Array<CoordinatesInterface>;
	regionalBureaus: Array<number>;
}

export type { ApplicantUpdateInterface };
