import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDTO {
  @IsEmail({}, { message: 'Email tidak valid' })
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @IsNotEmpty()
  password: string;
}
