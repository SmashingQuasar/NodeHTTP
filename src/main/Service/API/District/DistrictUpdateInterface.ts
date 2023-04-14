import type { CoordinatesInterface } from "../../../Model/CoordinatesInterface.js";

interface DistrictUpdateInterface
{
	id: number;
	label: string;
	coordinates: Array<CoordinatesInterface>;
	regionalBureaus: Array<number>;
}

export type { DistrictUpdateInterface };
