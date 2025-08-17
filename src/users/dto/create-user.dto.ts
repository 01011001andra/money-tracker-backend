import {
  IsString,
  IsEmail,
  MinLength,
  IsBase64,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  image: string;

  @IsString()
  password: string;
}
