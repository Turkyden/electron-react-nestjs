import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiTestService } from '../di-test/di-test.service';

@Injectable()
export class DiTestService2 implements OnModuleInit {
    constructor(private readonly diTestService: DiTestService) {}

    onModuleInit(): any {
        this.diTestService.testClass();
    }
}
