import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WfService } from './wf.service';
import { WfResult, WfBase } from './wf.interface';

const Utils = {
  response: <T>(datas: T) => {
    return {
      status: 0,
      msg: datas ? "ok" : "todo",
      datas: datas
    }
  }
}

@ApiTags('流程模块')
@Controller()
export class WfController {
  constructor(private readonly wfService: WfService) {}

  @ApiOperation({ summary: '流程基本数据' })
  @Get('/api/wf/baseInfo')
  async getWfBase(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getWfBase();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '流程因退回没有处理的流程数量' })
  @Get('/api/wf/requestCountBybereject')
  async getRequestCountBybereject(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getRequestCountBybereject();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '流程因退回没有处理的流程列表' })
  @Get('/api/wf/requestListBybereject')
  async getRequestListBybereject(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getRequestListBybereject();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '流程状态分布' })
  @Get('/api/wf/statusDistribute')
  async getStatusDistribute(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getStatusDistribute();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '归档率排名-大类' })
  @Get('/api/wf/archivedRateWftypeRank')
  async getArchivedRateWftypeRank(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getArchivedRateWftypeRank();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '归档时长排名-大类' })
  @Get('/api/wf/archivedTimeWftypeRank')
  async getArchivedTimeWftypeRank(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getArchivedTimeWftypeRank();
    return Utils.response(datas);
  }
  
  @ApiOperation({ summary: '归档率排名-小类' })
  @Get('/api/wf/archivedRateWfidRank')
  async getArchivedRateWfidRank(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getArchivedRateWfidRank();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '归档时长排名-小类' })
  @Get('/api/wf/archivedTimeWfidRank')
  async getArchivedTimeWfidRank(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getArchivedTimeWfidRank();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '用时最短归档流程排名' })
  @Get('/api/wf/archivedTimeAscRank')
  async getArchivedTimeAscRank(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getArchivedTimeAscRank();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '用于最长归档流程排名' })
  @Get('/api/wf/archivedTimeDescRank')
  async getArchivedTimeDescRank(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getArchivedTimeDescRank();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '流程利用率排名-大类' })
  @Get('/api/wf/useRatioRankOfWftype')
  async getUseRatioRankOfWftype(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getUseRatioRankOfWftype();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '流程利用率排名-小类' })
  @Get('/api/wf/useRatioRankOfWfid')
  async getUseRatioRankOfWfid(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getUseRatioRankOfWfid();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '处理过长仍未归档请求' })
  @Get('/api/wf/unArchivedListOftooLongTime')
  async getUnArchivedListOftooLongTime(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getUnArchivedListOftooLongTime();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '提交流程的前十位排名' })
  @Get('/api/wf/submitRank')
  async getSubmitRank(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getSubmitRank();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '请求未处理的排名' })
  @Get('/api/wf/untreatedRank')
  async getUntreatedRank(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getUntreatedRank();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '处理人最多的请求排名' })
  @Get('/api/wf/treatUserRank')
  async getTreatUserRank(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getTreatUserRank();
    return Utils.response(datas);
  }

  /**
   * TODO: 流程有效节点数量统计
   */
  @ApiOperation({ summary: '流程有效节点数量统计' })
  @Get('/api/wf/validNodesRank')
  async getValidNodesRank(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getValidNodesRank();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '有效流程代理统计数量表' })
  @Get('/api/wf/agentUserRank')
  async getAgentUserRank(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getAgentUserRank();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '流程短语使用情况表' })
  @Get('/api/wf/phraseShortUseRank')
  async getPhraseShortUseRank(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getPhraseShortUseRank();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '流程版本情况表' })
  @Get('/api/wf/versionMsg')
  async getVersionMsg(): Promise<WfResult<WfBase>> {
    const datas = await this.wfService.getVersionMsg();
    return Utils.response(datas);
  }

}