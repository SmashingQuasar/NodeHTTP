const enum LogLevel
// Eslint does not understand const enum and interprets it as a variable declaration in constant context.
/* eslint-disable-next-line */
{
	DEBUG = "debug",
	INFO = "info",
	NOTICE = "notice",
	WARNING = "warning",
	ERROR = "error",
	CRITICAL = "critical",
	ALERT = "alert",
	EMERGENCY = "emergency"
}

export { LogLevel };
