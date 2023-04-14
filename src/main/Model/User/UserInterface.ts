interface UserInterface
{
	id: number;
	firstname: string;
	lastname: string;
	email: string;
	hash: string|undefined;
	active: boolean;
}

export type { UserInterface };
