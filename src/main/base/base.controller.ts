import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BaseService } from './base.service';
import { ConnectDto } from './dto/connect.dto';
import { ConnectResult, ModuleUsageResult } from './base.interface';

@ApiTags('基础模块')
@Controller()
export class BaseController {
  constructor(private readonly baseService: BaseService) {}

  @ApiOperation({ summary: 'Hello World' })
  @Get('/api/hello')
  getHelloWorld(): { status: number, msg: string } {
    //return this.baseService.getHelloWorld();
    return {
      status: 0,
      msg: 'Hello World From Nest Server !'
    }
  }

  @ApiOperation({ summary: '登陆 ecology 9.0 系统' })
  @Post('/api/login')
  login(): { status: number, msg: string } {
    const msg = this.baseService.login();
    return {
      status: 0,
      msg: msg,
    }
  }

  // @ApiOperation({ summary: '连接数据库' })
  // @Post('/api/connect')
  // async connect(@Body() connectDto: ConnectDto): Promise<ConnectResult> {
  //   const { ...dbConfig } = connectDto;
  //   const baseInfo = await this.baseService.connect(dbConfig);
  //   return {
  //     status: 0,
  //     msg: "ok",
  //     BaseInfo: baseInfo
  //   }
  // }

  @ApiOperation({ summary: '各模块使用情况' })
  @Get('/api/moduleusage')
  async getModuleUsage(): Promise<ModuleUsageResult> {
    const moduleusage = await this.baseService.getModuleUsage();
    return {
      status: 0,
      msg: "ok",
      datas: moduleusage
    }
  }

}