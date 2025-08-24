import { PartialType } from '@nestjs/mapped-types';
import { CreateBffDto } from './create-bff.dto';

export class UpdateBffDto extends PartialType(CreateBffDto) {}
