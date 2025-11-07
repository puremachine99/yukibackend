import { Injectable } from '@nestjs/common';
import { CreateRevenueSummaryDto } from './dto/create-revenue-summary.dto';
import { UpdateRevenueSummaryDto } from './dto/update-revenue-summary.dto';

@Injectable()
export class RevenueSummaryService {
  create(createRevenueSummaryDto: CreateRevenueSummaryDto) {
    return 'This action adds a new revenueSummary';
  }

  findAll() {
    return `This action returns all revenueSummary`;
  }

  findOne(id: number) {
    return `This action returns a #${id} revenueSummary`;
  }

  update(id: number, updateRevenueSummaryDto: UpdateRevenueSummaryDto) {
    return `This action updates a #${id} revenueSummary`;
  }

  remove(id: number) {
    return `This action removes a #${id} revenueSummary`;
  }
}
