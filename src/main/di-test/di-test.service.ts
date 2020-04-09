import { Injectable } from '@nestjs/common';

@Injectable()
export class DiTestService {
    testClass() {
        console.log("DI-TEST-MODULE-1");
    }
}
