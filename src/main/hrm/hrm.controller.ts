import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HrmService } from './hrm.service';
import { HrmResult, HrmBase, HrmStatus, HrmSex, HrmAge, HrmAntryAge } from './hrm.interface';

const Utils = {
  response: <T>(datas: T) => {
    return {
      status: 0,
      msg: datas ? "ok" : "todo",
      datas: datas
    }
  }
}

@ApiTags('人事模块')
@Controller()
export class HrmController {
  constructor(private readonly hrmService: HrmService) {}

  @ApiOperation({ summary: '人事基本信息' })
  @Get('/api/hrm/base')
  async getHrmBae(): Promise<HrmResult<HrmBase>> {
    const datas = await this.hrmService.getHrmBase();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '人员状态' })
  @Get('/api/hrm/status')
  async getHrmStatus(): Promise<HrmResult<HrmStatus>> {
    const datas = await this.hrmService.getHrmStatus();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '人员性别' })
  @Get('/api/hrm/sex')
  async getHrmSex(): Promise<HrmResult<HrmSex>> {
    const datas = await this.hrmService.getHrmSex();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '人员年龄' })
  @Get('/api/hrm/age')
  async getHrmAge(): Promise<HrmResult<HrmAge>> {
    const datas = await this.hrmService.getHrmAge();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '在职人员司龄分布' })
  @Get('/api/hrm/entryAge')
  async getHrmAntryAge(): Promise<HrmResult<HrmAntryAge>> {
    const datas = await this.hrmService.getHrmAntryAge();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '离职人员司龄分布' })
  @Get('/api/hrm/leaveAge')
  async getHrmLeaveAge(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getHrmLeaveAge();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '离职最多的分部' })
  @Get('/api/hrm/leaveSub')
  async getLeaveSub(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getLeaveSub();
    return Utils.response(datas);
  }
  
  @ApiOperation({ summary: '离职最多的部门' })
  @Get('/api/hrm/leaveDepart')
  async getLeaveDepart(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getLeaveDepart();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '入职年限时间长的人员的名单' })
  @Get('/api/hrm/entryDetail')
  async getEntryDetail(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getEntryDetail();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '符合离职频次最高的人员的名单' })
  @Get('/api/hrm/leaveDetail')
  async getLeaveDetail(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getLeaveDetail();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '长时间未登陆人员名单' })
  @Get('/api/hrm/lastLogindatAsc')
  async getLastLogindatAsc(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getLastLogindatAsc();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '试用期预警人员名单' })
  @Get('/api/hrm/probationLastLogindateAsc')
  async getProbationLastLogindateAsc(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getProbationLastLogindateAsc();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '登陆时间点报表' })
  @Get('/api/hrm/loginTime')
  async getLoginTime(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getLoginTime();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '登陆频次人员名单' })
  @Get('/api/hrm/loginFrequency')
  async getLoginFrequency(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getLoginFrequency();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '时间最早的登陆' })
  @Get('/api/hrm/loginTimeAsc')
  async getLoginTimeAsc(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getLoginTimeAsc();
    return Utils.response(datas);
  }
  
  @ApiOperation({ summary: '经常很早签到的人员的名单' })
  @Get('/api/hrm/earlySignIn')
  async getEarlySignIn(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getEarlySignIn();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '签退时间点报表' })
  @Get('/api/hrm/signOutTime')
  async getSignOutTime(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getSignOutTime();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '时间最晚的签退' })
  @Get('/api/hrm/lateSignOut')
  async getLateSignOut(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getLateSignOut();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '经常很早签退的人员的名单' })
  @Get('/api/hrm/earlySignOut')
  async getEarlySignOut(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getEarlySignOut();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '经常签到的地点排名' })
  @Get('/api/hrm/signInAdress')
  async getSignInAdress(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getSignInAdress();
    return Utils.response(datas);
  }

  /**
   * 简单密码的人员列表
   * TODO: write sql query.
   */
  @ApiOperation({ summary: '简单密码的人员列表' })
  @Get('/api/hrm/easyPassWordUserList')
  async getEasyPassWordUserList(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getEasyPassWordUserList();
    return Utils.response(datas);
  }

  /**
   * 系统内简单密码排名
   * TODO: write sql query.
   */
  @ApiOperation({ summary: '系统内简单密码排名' })
  @Get('/api/hrm/easyPassWordRank')
  async getEasyPassWordRank(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getEasyPassWordRank();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '系统管理员帐号的常见登陆地址' })
  @Get('/api/hrm/sysadminLoginIpRate')
  async getSysadminLoginIpRate(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getSysadminLoginIpRate();
    return Utils.response(datas);
  }

  /**
   * 人员登陆异常
   * TODO: write sql query.
   */
  @ApiOperation({ summary: '人员登陆异常' })
  @Get('/api/hrm/loginAbnormal')
  async getLoginAbnormal(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getLoginAbnormal();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '人员生日分布' })
  @Get('/api/hrm/birthdayDistribute')
  async getBirthdayDistribute(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getBirthdayDistribute();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '人员星座分布' })
  @Get('/api/hrm/signDistribute')
  async getSignDistribute(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getSignDistribute();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '系统中无身份证人员列表' })
  @Get('/api/hrm/noIdCardUserList')
  async getNoIdCardUserList(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getNoIdCardUserList();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '系统中未登记人员生日列表' })
  @Get('/api/hrm/noBirthdayMsgUserList')
  async getNoBirthdayMsgUserList(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getNoBirthdayMsgUserList();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '系统中未登记人员照片列表' })
  @Get('/api/hrm/noImgMsgUserList')
  async getNoImgMsgUserList(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getNoImgMsgUserList();
    return Utils.response(datas);
  }

  @ApiOperation({ summary: '系统中封存部门信息' })
  @Get('/api/hrm/hasSealDepart')
  async getHasSealDepart(): Promise<HrmResult<any>> {
    const datas = await this.hrmService.getHasSealDepart();
    return Utils.response(datas);
  }

}