import type { CoordinatesInterface } from "../CoordinatesInterface.js";
import type { District } from "../District.js";

interface RegionalBureauInterface
{
	label: string;
	coordinates: Array<Array<CoordinatesInterface>>;
	districts: Array<number|District>|null;
}

export { RegionalBureauInterface };
