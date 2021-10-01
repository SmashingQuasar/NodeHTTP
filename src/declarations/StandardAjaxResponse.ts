interface StandardAjaxResponse
{
	success: boolean;
	message: string;
	data?: Record<string, unknown>;
}

export { StandardAjaxResponse };
