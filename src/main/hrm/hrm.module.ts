import { Module } from '@nestjs/common';
import { HrmController } from './hrm.controller';
import { BaseModule } from '../base/base.module';
import { HrmService } from './hrm.service';

@Module({
  imports: [BaseModule],
  controllers: [HrmController],
  providers: [HrmService],
})
export class HrmModule {
  
}