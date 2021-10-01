const enum Millisecond
// Eslint does not understand const enum and interprets it as a variable declaration in constant context.
/* eslint-disable-next-line */
{
	SECOND = 1000,
	MINUTE = 60000,
	HOUR = 3600000,
	DAY = 86400000
}

export { Millisecond };
