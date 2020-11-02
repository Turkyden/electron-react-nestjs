import { Module } from '@nestjs/common';
import { BaseController } from './base.controller';
import { BaseService } from './base.service';

@Module({
  imports: [],
  controllers: [BaseController],
  providers: [BaseService],
  exports: [BaseService]
})
export class BaseModule {
  
}