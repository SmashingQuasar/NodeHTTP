declare interface StandardAjaxResponse
{
    success: boolean;
    message: string;
    data?: Record<string, any>;
}