import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService, OrganizationStatus } from '@/prisma';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    const resolvedSlug = await this.resolveUniqueSlug(createOrganizationDto.name);

    const organization = await this.prisma.organization.create({
      data: {
        name: createOrganizationDto.name,
        slug: resolvedSlug,
        status: createOrganizationDto.status || OrganizationStatus.ACTIVE,
      },
    });

    return {
      message: 'Organización creada exitosamente',
      data: organization,
    };
  }

  async findAll() {
    const organizations = await this.prisma.organization.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return {
      message: 'Organizaciones obtenidas exitosamente',
      data: organizations,
    };
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            users: true,
            roles: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    return {
      message: 'Organización obtenida exitosamente',
      data: organization,
    };
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    await this.ensureOrganizationExists(id);

    const organization = await this.prisma.organization.update({
      where: { id },
      data: {
        ...(updateOrganizationDto.name ? { name: updateOrganizationDto.name } : {}),
        ...(updateOrganizationDto.status
          ? { status: updateOrganizationDto.status }
          : {}),
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return {
      message: 'Organización actualizada exitosamente',
      data: organization,
    };
  }

  async remove(id: string) {
    await this.ensureOrganizationExists(id);

    await this.prisma.organization.update({
      where: { id },
      data: {
        status: OrganizationStatus.ARCHIVED,
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Organización archivada exitosamente',
      data: {
        id,
      },
    };
  }

  private async ensureOrganizationExists(id: string) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }
  }

  private async resolveUniqueSlug(input: string): Promise<string> {
    const normalizedBase = this.normalizeSlug(input);
    let candidate = normalizedBase;
    let suffix = 1;

    while (true) {
      const existing = await this.prisma.organization.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });

      if (!existing) {
        return candidate;
      }

      const suffixText = `-${suffix}`;
      candidate = `${normalizedBase.slice(0, 100 - suffixText.length)}${suffixText}`;
      suffix += 1;
    }
  }

  private normalizeSlug(input: string): string {
    const normalized = input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized.slice(0, 100) || `org-${Date.now()}`;
  }
}
