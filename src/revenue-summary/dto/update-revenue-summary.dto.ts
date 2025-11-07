import { PartialType } from '@nestjs/mapped-types';
import { CreateRevenueSummaryDto } from './create-revenue-summary.dto';

export class UpdateRevenueSummaryDto extends PartialType(CreateRevenueSummaryDto) {}
