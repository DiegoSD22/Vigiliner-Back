import { faker } from '@faker-js/faker';

export interface SeedOrganization {
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  users: Array<{
    name: string;
    email: string;
    username: string;
    password: string;
  }>;
}

const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'ChangeMe123!';
const orgCount = Number(process.env.SEED_ORG_COUNT || 3);
const usersPerOrg = Number(process.env.SEED_USERS_PER_ORG || 5);
const randomSeed = Number(process.env.SEED_RANDOM_SEED || 20260305);

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

function safePositiveInt(value: number, fallback: number): number {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export function generateSeedOrganizations(): SeedOrganization[] {
  faker.seed(randomSeed);

  const totalOrgs = safePositiveInt(orgCount, 3);
  const totalUsersPerOrg = safePositiveInt(usersPerOrg, 5);
  const organizations: SeedOrganization[] = [];

  for (let orgIndex = 1; orgIndex <= totalOrgs; orgIndex += 1) {
    const orgName = faker.company.name();
    const orgSlug = `org-${orgIndex}-${normalizeSlug(orgName)}`.slice(0, 100);

    const users: SeedOrganization['users'] = [];

    for (
      let userIndex = 1;
      userIndex <= totalUsersPerOrg;
      userIndex += 1
    ) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = `user.${orgIndex}.${userIndex}@seed.vigiliner.local`;

      users.push({
        name: `${firstName} ${lastName}`,
        email,
        username: `user-${orgIndex}-${userIndex}`,
        password: defaultPassword,
      });
    }

    if (orgIndex === 1) {
      users.unshift({
        name: 'Super Admin',
        email: 'super-admin@seed.vigiliner.local',
        username: 'super-admin',
        password: '12345678',
      });
    }

    organizations.push({
      name: orgName,
      slug: orgSlug,
      status: 'ACTIVE',
      users,
    });
  }

  return organizations;
}
