declare interface RouteConfiguration
{
    name: string;
    regexp: RegExp;
    pretty: string;
    controller: string;
    action: string;
    variables: {
        [key: string]: string;
    }
}
