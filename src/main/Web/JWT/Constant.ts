const enum Constant
// Eslint does not understand const enum and interprets it as a variable declaration in constant context.
/* eslint-disable-next-line */
{
	TOKEN_HEADER_INDEX = 0,
	TOKEN_CLAIMS_INDEX = 1,
	TOKEN_SIGNATURE_INDEX = 2,
	TOKEN_PARTS = 3
}

export { Constant };
