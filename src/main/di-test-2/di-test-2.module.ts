import { Module } from '@nestjs/common';
import { DiTestService2 } from './di-test-2.service';
import { DiTestModule } from '../di-test/di-test.module';

@Module({
    providers: [DiTestService2],
    imports: [DiTestModule]
})
export class DiTest2Module {}
