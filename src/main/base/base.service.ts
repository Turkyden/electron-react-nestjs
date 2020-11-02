import { Injectable } from '@nestjs/common';
import { DBConfig, BaseInfo, ConnectBaseInfo, ModuleUsage } from './base.interface';
const sql = require('mssql');

@Injectable()
export class BaseService {

  private count: number = 0;

  private dbConfig: DBConfig = {
    user: "",
    password: "",
    server: "",
    database: "",
    port: 1433,
    startdate: ''
  };
  
  public baseInfo: BaseInfo = {
    hrmcount: 0,
    companyname: '',
    license: '',
    startdate: '',
    workdays: 0,
    cdate: '',
  };

  getHelloWorld(): string {
    this.count++;
    return 'Hello World! count: ' + this.count;
  }

  /**
   * Login in ecology9.0 and get the user info.
   * TODO:
   * - [x] return some text
   * - [ ] query sql
   */
  login(): string {
    return 'Login System';
  }
  

  /**
   * Connect to the database.
   * @param dbConfig your database login info
   */
  async connect(dbConfig?: DBConfig): Promise<ConnectBaseInfo> {

    /**
     * Computed the between star date and end date.
     * @param startDateStr 'yyyy-mm-dd'
     * @param endDateStr 'yyyy-mm-dd'
     */
    const getDaysBetween = (startDateStr: string, endDateStr: string) => {
      const startDate = Date.parse(startDateStr);
      const endDate = Date.parse(endDateStr);
      return (endDate - startDate) / (1 * 24 * 60 * 60 * 1000);
    }

    /**
     * 获取当前日期
     */
    const getNowFormatDate = () => {
      const date = new Date();
      const year = date.getFullYear();
      let month: any = date.getMonth() + 1;
      let strDate: any = date.getDate();
      if (month >= 1 && month <= 9) {
        month = "0" + month;
      }
      if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
      }
      return `${year}-${month}-${strDate}`;
    }

    // const user = "sa";
    // const password = "ecology";
    // const server = "192.168.30.12";
    // const port = "1433";
    // const database = "e9foridea";
    // const startdate = "2015-05-22";

    if(dbConfig){
      this.dbConfig = dbConfig;
    }

    const { user, password, server, port, database, startdate } = this.dbConfig;

    //await sql.close();

    await sql.connect(`mssql://${user}:${password}@${server}:${port}/${database}`);

    const { recordset: res1 } = await sql.query`SELECT COUNT(*)sum FROM HrmResource WHERE status IN ( 0, 1, 2, 3 )`;

    const { recordset: res2 } = await sql.query`SELECT companyname,license FROM license`;

    this.baseInfo = {
      hrmcount: res1[0].sum,
      companyname: res2[0].companyname,
      license: res2[0].license,
      startdate: startdate,
      workdays: getDaysBetween(startdate, getNowFormatDate()),
      cdate: getNowFormatDate()
    };

    return this.baseInfo
  }

  /**
   * Get the module usage info in ecology.
   */
  async getModuleUsage() : Promise<ModuleUsage[]> {
    const { workdays } = this.baseInfo;
    await this.connect();
    const { recordset } = await sql.query`
      SELECT  '工作流程' name ,
      COUNT(*) sum ,
      COUNT(*) / ${workdays} avg
      FROM    workflow_requestbase
      UNION ALL
      SELECT  '知识管理' name ,
          COUNT(*) sum ,
          COUNT(*) / ${workdays} avg
      FROM    DocDetail
      UNION ALL
      SELECT  '人力资源' name ,
          COUNT(*) sum ,
          COUNT(*) / ${workdays} avg
      FROM    HrmResource
      UNION ALL
      SELECT  '工作微博' name ,
          COUNT(*) sum ,
          COUNT(*) / ${workdays} avg
      FROM    blog_discuss
      UNION ALL
      SELECT  '客户模块' name ,
          COUNT(*) sum ,
          COUNT(*) / ${workdays} avg
      FROM    CRM_CustomerInfo
      UNION ALL
      SELECT  '项目模块' name ,
          COUNT(*) sum ,
          COUNT(*) / ${workdays} avg
      FROM    Prj_ProjectInfo
      UNION ALL
      SELECT  '会议管理' name ,
          COUNT(*) sum ,
          COUNT(*) / ${workdays} avg
      FROM    Meeting
      UNION ALL
      SELECT  '资产模块' name ,
          COUNT(*) sum ,
          COUNT(*) / ${workdays} avg
      FROM    cptcapital
      UNION ALL
      SELECT  '日程管理' name ,
          COUNT(*) sum ,
          COUNT(*) / ${workdays} avg
      FROM    WorkPlan
      UNION ALL
      SELECT  '表单建模' name ,
          COUNT(*) sum ,
          COUNT(*) / ${workdays} avg
      FROM    modeinfo
      UNION ALL
      SELECT  '移动建模' name ,
          COUNT(*) sum ,
          COUNT(*) / ${workdays} avg
      FROM    Mobilemode_API
      UNION ALL
      SELECT  '短信功能' name ,
          COUNT(*) sum ,
          COUNT(*) / ${workdays} avg
      FROM    SMS_Message`;
    
    return recordset;
  }
}