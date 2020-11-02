import { Module } from '@nestjs/common';
import { WfController } from './wf.controller';
import { BaseModule } from '../base/base.module';
import { WfService } from './wf.service';

@Module({
  imports: [BaseModule],
  controllers: [WfController],
  providers: [WfService],
})
export class WfModule {
  
}