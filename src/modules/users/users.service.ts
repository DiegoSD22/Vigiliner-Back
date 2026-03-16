import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/prisma';
import { CreateUserDto, UpdateUserDto } from './dto';

const BCRYPT_ROUNDS = 10;
const DEFAULT_ROLE_SLUG = 'org-admin';
const SUPER_ADMIN_ROLE = 'super-admin';

interface ActorContext {
  organizationId: string;
  roles?: string[];
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createInOrganization(
    createUserDto: CreateUserDto,
    targetOrganizationId: string,
    actor: ActorContext,
  ) {
    await this.assertCanAccessOrganization(actor, targetOrganizationId);
    await this.ensureOrganizationExists(targetOrganizationId);
    return this.create(createUserDto, targetOrganizationId);
  }

  async findAllByOrganization(
    targetOrganizationId: string,
    actor: ActorContext,
  ) {
    await this.assertCanAccessOrganization(actor, targetOrganizationId);
    await this.ensureOrganizationExists(targetOrganizationId);
    return this.findAll(targetOrganizationId);
  }

  async findOneByOrganization(
    userId: string,
    targetOrganizationId: string,
    actor: ActorContext,
  ) {
    await this.assertCanAccessOrganization(actor, targetOrganizationId);
    await this.ensureOrganizationExists(targetOrganizationId);
    return this.findOne(userId, targetOrganizationId);
  }

  async updateInOrganization(
    userId: string,
    updateUserDto: UpdateUserDto,
    targetOrganizationId: string,
    actor: ActorContext,
  ) {
    await this.assertCanAccessOrganization(actor, targetOrganizationId);
    await this.ensureOrganizationExists(targetOrganizationId);
    return this.update(userId, updateUserDto, targetOrganizationId);
  }

  async removeInOrganization(
    userId: string,
    targetOrganizationId: string,
    actor: ActorContext,
  ) {
    await this.assertCanAccessOrganization(actor, targetOrganizationId);
    await this.ensureOrganizationExists(targetOrganizationId);
    return this.remove(userId, targetOrganizationId);
  }

  async create(createUserDto: CreateUserDto, organizationId: string) {
    await this.ensureUniqueEmail(createUserDto.email);

    const username = await this.resolveUniqueUsername(
      createUserDto.username || createUserDto.email.split('@')[0],
    );

    const password = await bcrypt.hash(createUserDto.password, BCRYPT_ROUNDS);
    const roleSlugs = this.normalizeRoleSlugs(createUserDto.roleSlugs);
    const roles = await this.resolveRolesBySlugs(roleSlugs, organizationId);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: createUserDto.email,
          username,
          name: createUserDto.name,
          password,
          organizationId,
        },
      });

      await tx.userRole.createMany({
        data: roles.map((role) => ({
          userId: createdUser.id,
          roleId: role.id,
          organizationId,
        })),
        skipDuplicates: true,
      });

      return tx.user.findUnique({
        where: { id: createdUser.id },
        select: this.userSelect(organizationId),
      });
    });

    return {
      message: 'Usuario creado exitosamente',
      data: user,
    };
  }

  async findAll(organizationId: string) {
    const users = await this.prisma.user.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      select: this.userSelect(organizationId),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      message: 'Usuarios obtenidos exitosamente',
      data: users,
    };
  }

  async findOne(id: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      select: this.userSelect(organizationId),
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return {
      message: 'Usuario obtenido exitosamente',
      data: user,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, organizationId: string) {
    await this.ensureUserExists(id, organizationId);

    if (updateUserDto.email) {
      await this.ensureUniqueEmail(updateUserDto.email, id);
    }

    if (updateUserDto.username) {
      await this.ensureUniqueUsername(this.normalizeUsername(updateUserDto.username), id);
    }

    const hashedPassword = updateUserDto.password
      ? await bcrypt.hash(updateUserDto.password, BCRYPT_ROUNDS)
      : undefined;

    const user = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          ...(updateUserDto.email ? { email: updateUserDto.email } : {}),
          ...(updateUserDto.username
            ? { username: this.normalizeUsername(updateUserDto.username) }
            : {}),
          ...(updateUserDto.name ? { name: updateUserDto.name } : {}),
          ...(hashedPassword ? { password: hashedPassword } : {}),
        },
      });

      if (updateUserDto.roleSlugs) {
        const roleSlugs = this.normalizeRoleSlugs(updateUserDto.roleSlugs);
        const roles = await this.resolveRolesBySlugs(roleSlugs, organizationId);

        await tx.userRole.deleteMany({
          where: {
            userId: id,
            organizationId,
          },
        });

        await tx.userRole.createMany({
          data: roles.map((role) => ({
            userId: id,
            roleId: role.id,
            organizationId,
          })),
          skipDuplicates: true,
        });
      }

      return tx.user.findUnique({
        where: { id },
        select: this.userSelect(organizationId),
      });
    });

    return {
      message: 'Usuario actualizado exitosamente',
      data: user,
    };
  }

  async remove(id: string, organizationId: string) {
    await this.ensureUserExists(id, organizationId);

    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({
        where: {
          userId: id,
          organizationId,
        },
      }),
      this.prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      }),
    ]);

    return {
      message: 'Usuario eliminado exitosamente',
      data: { id },
    };
  }

  private userSelect(organizationId: string) {
    return {
      id: true,
      email: true,
      username: true,
      name: true,
      organizationId: true,
      createdAt: true,
      updatedAt: true,
      roles: {
        where: {
          organizationId,
        },
        include: {
          role: {
            select: {
              id: true,
              name: true,
              slug: true,
              scope: true,
              isSystem: true,
            },
          },
        },
      },
    };
  }

  private normalizeRoleSlugs(roleSlugs?: string[]): string[] {
    const normalized = (roleSlugs && roleSlugs.length > 0
      ? roleSlugs
      : [DEFAULT_ROLE_SLUG]
    ).map((slug) => slug.trim());

    const unique = Array.from(new Set(normalized));

    if (unique.some((slug) => !slug)) {
      throw new BadRequestException('Los roles no pueden contener valores vacíos');
    }

    return unique;
  }

  private async resolveRolesBySlugs(roleSlugs: string[], organizationId: string) {
    const roles = await this.prisma.role.findMany({
      where: {
        slug: { in: roleSlugs },
        OR: [
          { organizationId },
          { isSystem: true },
        ],
      },
      select: {
        id: true,
        slug: true,
      },
    });

    if (roles.length !== roleSlugs.length) {
      const found = new Set(roles.map((role) => role.slug));
      const missing = roleSlugs.filter((slug) => !found.has(slug));
      throw new BadRequestException(
        `Roles no válidos para esta organización: ${missing.join(', ')}`,
      );
    }

    return roles;
  }

  private async ensureUserExists(id: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  private async ensureOrganizationExists(organizationId: string) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!organization) {
      throw new NotFoundException(
        `Organización con ID ${organizationId} no encontrada`,
      );
    }
  }

  private async assertCanAccessOrganization(
    actor: ActorContext,
    targetOrganizationId: string,
  ) {
    const actorRoles = actor.roles || [];
    const isSuperAdmin = actorRoles.includes(SUPER_ADMIN_ROLE);

    if (isSuperAdmin) {
      return;
    }

    if (actor.organizationId !== targetOrganizationId) {
      throw new ForbiddenException(
        'No tienes permisos para gestionar usuarios de esta organización',
      );
    }
  }

  private normalizeUsername(input: string): string {
    const normalized = input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized.slice(0, 50) || `user-${Date.now()}`;
  }

  private async resolveUniqueUsername(base: string): Promise<string> {
    const normalizedBase = this.normalizeUsername(base);
    let candidate = normalizedBase;
    let suffix = 1;

    while (true) {
      const exists = await this.prisma.user.findUnique({
        where: { username: candidate },
        select: { id: true },
      });

      if (!exists) {
        return candidate;
      }

      const suffixText = `-${suffix}`;
      candidate = `${normalizedBase.slice(0, 50 - suffixText.length)}${suffixText}`;
      suffix += 1;
    }
  }

  private async ensureUniqueEmail(email: string, currentId?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing && existing.id !== currentId) {
      throw new ConflictException('El email ya está registrado');
    }
  }

  private async ensureUniqueUsername(username: string, currentId?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existing && existing.id !== currentId) {
      throw new ConflictException('El username ya está registrado');
    }
  }
}
