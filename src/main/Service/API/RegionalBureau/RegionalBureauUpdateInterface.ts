import type { CoordinatesInterface } from "../../../Model/CoordinatesInterface.js";

interface RegionalBureauUpdateInterface
{
	id: number;
	label: string;
	coordinates: Array<Array<CoordinatesInterface>>;
}

export type { RegionalBureauUpdateInterface };
