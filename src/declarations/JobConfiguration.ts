import type { JobCondition } from "./JobCondition.js";

interface JobConfiguration
{
	key: string;
	mainDomain: string;
	tableName: string;
	name: string;
	address: string;
	delay: number;
	parameters: Array<string>;
	conditions: Array<JobCondition>;
}

export { JobConfiguration };
