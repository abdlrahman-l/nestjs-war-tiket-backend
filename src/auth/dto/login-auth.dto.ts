import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDTO {
  @IsEmail({}, { message: 'Email tidak valid' })
  email: string;

  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @IsNotEmpty()
  password: string;
}
