import { Injectable, NotFoundException } from '@nestjs/common';
import { UserCreateInput } from 'generated/prisma/models';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  create(userCreateInput: UserCreateInput) {
    return this.prisma.user.create({
      data: userCreateInput,
    });
  }

  async findOne(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return {
      ...user,
      password: undefined,
    };
  }
}
