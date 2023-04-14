import type { CoordinatesInterface } from "../CoordinatesInterface.js";

interface DistrictInterface
{
	label: string;
	coordinates: Array<CoordinatesInterface>;
	regionalBureaus: Array<number|string>;
}

export { DistrictInterface };
