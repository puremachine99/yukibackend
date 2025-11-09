import { PartialType } from '@nestjs/mapped-types';
import { CreateAdPlanDto } from './create-ad-plan.dto';

export class UpdateAdPlanDto extends PartialType(CreateAdPlanDto) {}
