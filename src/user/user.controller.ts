import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import type { UserCreateInput } from 'generated/prisma/models';
import { GetUser } from 'src/auth/get-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: UserCreateInput) {
    return this.userService.create(createUserDto);
  }

  @Get(':email')
  findOne(@Param('email') email: string, @GetUser() userId: string) {
    console.log({
      userId,
    });
    return this.userService.findOne(email);
  }
}
