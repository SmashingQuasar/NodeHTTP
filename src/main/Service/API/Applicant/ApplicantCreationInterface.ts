interface ApplicantCreationInterface
{
	firstname: string;
	lastname: string;
	gender: "male"|"female";
	address: string;
	supplement: string;
	postalCode: string;
	profile: string;
	city: string;
	country: string;
	latitude: string;
	longitude: string;
}

export type { ApplicantCreationInterface };
