interface ApplicantInterface
{
	oldId: number;
	firstname: string;
	lastname: string;
	gender: "male"|"female";
	address: string;
	supplement: string;
	postalCode: string;
	profile: string;
	specialCase: boolean;
	decision: string;
	city: string;
	country: string;
	latitude: string;
	longitude: string;
}

export type { ApplicantInterface };
