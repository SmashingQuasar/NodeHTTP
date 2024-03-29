interface RawRouteConfiguration
{
	name: string;
	regexp: string;
	pretty: string;
	controller: string;
	action: string;
	variables: {
		[key: string]: string;
	};
}

export { RawRouteConfiguration };
