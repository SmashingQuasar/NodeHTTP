import type { CoordinatesInterface } from "../../../Model/CoordinatesInterface.js";

interface DistrictCreationInterface
{
	label: string;
	coordinates: Array<CoordinatesInterface>;
	regionalBureaus: Array<number>;
}

export type { DistrictCreationInterface };
