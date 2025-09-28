import { PartialType } from '@nestjs/mapped-types';
import { CreateN8nDto } from './create-n8n.dto';

export class UpdateN8nDto extends PartialType(CreateN8nDto) {}
