import { faker } from "@faker-js/faker";

export function generateMockUsers(count: number = 10): User[] {
	return Array.from({ length: count }).map(() => ({
		id: faker.string.uuid(),
		fullname: faker.person.fullName(),
		email: faker.internet.email(),
		createdAt: faker.date.past().toISOString(),
	}));
}
