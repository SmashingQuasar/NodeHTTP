/* eslint-disable max-nested-callbacks, max-lines-per-function */
import * as assert from "assert";
import { describe, it } from "mocha";
// import { Millisecond } from "../../../declarations/Millisecond.js";

// const TOMORROW: Date = new Date();
// TOMORROW.setDate(TOMORROW.getDate() + 1);

// const AFTER_TOMORROW: Date = new Date(TOMORROW);
// AFTER_TOMORROW.setDate(AFTER_TOMORROW.getDate() + 1);

// const NEXT_WEEK: Date = new Date();
// NEXT_WEEK.setTime(NEXT_WEEK.getTime() + Millisecond.WEEK);

// const TWO_WEEKS: Date = new Date(NEXT_WEEK.getTime() + Millisecond.WEEK);

describe(
	"Car",
	(): void =>
	{
		describe(
			"#Create",
			(): void =>
			{
				it(
					"should fail when not given a Record<string, unknown> type.",
					(): void =>
					{
						assert.throws(
							(): void =>
							{
								throw new Error("Toto");
							}
						);
					}
				);
			}
		);
	}
);
