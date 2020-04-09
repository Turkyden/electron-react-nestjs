import { Module } from '@nestjs/common';
import { ElectronModule } from './electron/electron.module';
import { DiTestModule } from './di-test/di-test.module';
import { DiTest2Module } from './di-test-2/di-test-2.module';

@Module({
    imports: [ElectronModule, DiTestModule, DiTest2Module]
})
export class AppModule {}
