import { IsBase64, IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsBase64()
  @IsOptional()
  image: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
