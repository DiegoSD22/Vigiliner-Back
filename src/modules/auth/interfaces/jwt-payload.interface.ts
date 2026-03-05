export interface JwtPayload {
  sub: string;
  email: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
}
