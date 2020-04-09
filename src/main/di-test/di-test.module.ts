import { Module } from '@nestjs/common';
import { DiTestService } from './di-test.service';

@Module({
    providers: [DiTestService],
    exports: [DiTestService]
})
export class DiTestModule {}
