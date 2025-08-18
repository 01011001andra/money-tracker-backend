import { IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  categoryId: string;
}
