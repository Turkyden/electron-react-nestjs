import { Module } from '@nestjs/common';
import { ElectronModule } from './electron/electron.module';
import { BaseModule } from './base/base.module';
import { HrmModule } from './hrm/hrm.module';
import { WfModule } from './wf/wf.module';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';

@Module({
  imports: [
    BaseModule, HrmModule, WfModule, ElectronModule
  ],
})
export class AppModule {}