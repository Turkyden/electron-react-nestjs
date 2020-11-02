import { Injectable } from '@nestjs/common';
import { HrmBase, HrmStatus, HrmSex, HrmAge, HrmAntryAge } from './hrm.interface';
import { BaseService } from '../base/base.service';
const sql = require('mssql');

@Injectable()
export class HrmService {
  constructor(private readonly baseService: BaseService) {}

  /**
   * Get the hrm base
   */
  async getHrmBase(): Promise<HrmBase[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
      SELECT '系统内有人员数量' name ,
        COUNT(*) sum
      FROM HrmResource
    UNION ALL
      SELECT '分配帐号人员数量' name ,
        COUNT(*) sum
      FROM HrmResource
    UNION ALL
      SELECT '未分配帐号人员数量' name ,
        COUNT(*) sum
      FROM HrmResource`;
    return recordset;
  }

  /**
   * Get the hrm status
   */
  async getHrmStatus(): Promise<HrmStatus[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT CASE
        WHEN status = 0 THEN '试用'
        WHEN status = 1 THEN '正式'
        WHEN status = 2 THEN '临时'
        WHEN status = 3 THEN '试用延期'
        WHEN status = 4 THEN '解聘'
        WHEN status = 5 THEN '离职'
        WHEN status = 6 THEN '退休'
        WHEN status = 7 THEN '无效'
        ELSE '其他'
      END name,
      COUNT(*) sum,
      CONVERT(
        DECIMAL(10, 2),
        COUNT(*) * 100.00 / (
          SELECT COUNT(*)
      FROM HrmResource
        )
      ) rate
    FROM HrmResource
    GROUP BY status
    ORDER BY SUM DESC`;
    return recordset;
  }

  /**
   * Get the hrm sex
   */
  async getHrmSex(): Promise<HrmSex[]> {
    await this.baseService.connect();
    const { baseInfo } = this.baseService;
    const { hrmcount } = baseInfo;
    const { recordset } = await sql.query`
    SELECT
      name,
      SUM(sum) sum,
      CONVERT(
        DECIMAL(10, 2), 
        COUNT(*) * 100.00 / ${hrmcount}
      ) rate
    FROM
      (
        SELECT
        CASE WHEN sex = '0' THEN '男性' WHEN sex = '1' THEN '女性' ELSE '其他' END name,
        sex,
        COUNT(*) sum
      FROM
        HrmResource
      WHERE 
        status IN (0, 1, 2, 3)
      GROUP BY 
        sex
      ) t
    GROUP BY 
      name`;
    return recordset;
  }

  /**
   * Get the hrm age
   */
  async getHrmAge(): Promise<HrmAge[]> {
    await this.baseService.connect();
    const { baseInfo } = this.baseService;
    const { hrmcount } = baseInfo;
    const { recordset } = await sql.query`
    SELECT  *, CONVERT(DECIMAL(10, 2), total * 100.00 / ${hrmcount}) rate
    , CONVERT(DECIMAL(10, 2), man * 100.00 / ${hrmcount}) manRate
    , CONVERT(DECIMAL(10, 2), woman * 100.00 / ${hrmcount}) womanRate
FROM    ( SELECT    ( SELECT    COUNT(*) num
                  FROM      HrmResource
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 0
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 0
                                        AND     20
                ) man ,
                ( SELECT    COUNT(*) num
                  FROM      HrmResource t
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 1
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 0
                                        AND     20
                ) woman ,
                COUNT(*) total ,
                '20岁以下' name
      FROM      HrmResource t
      WHERE     status IN ( 0, 1, 2, 3 )
                AND YEAR(GETDATE())
                - YEAR(CASE WHEN ISDATE(birthday) = 1 THEN birthday
                            ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                      END) BETWEEN 0
                            AND     20
    ) tt
UNION ALL
SELECT  *, CONVERT(DECIMAL(10, 2), total * 100.00 / ${hrmcount}) rate
      , CONVERT(DECIMAL(10, 2), man * 100.00 / ${hrmcount}) manRate
      , CONVERT(DECIMAL(10, 2), woman * 100.00 / ${hrmcount}) womanRate
FROM    ( SELECT    ( SELECT    COUNT(*) num
                  FROM      HrmResource
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 0
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 20
                                        AND     25
                ) man ,
                ( SELECT    COUNT(*) num
                  FROM      HrmResource t
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 1
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 20
                                        AND     25
                ) woman ,
                COUNT(*) total ,
                '20-25岁' name
      FROM      HrmResource t
      WHERE     status IN ( 0, 1, 2, 3 )
                AND YEAR(GETDATE())
                - YEAR(CASE WHEN ISDATE(birthday) = 1 THEN birthday
                            ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                      END) BETWEEN 20
                            AND     25
    ) tt
UNION ALL
SELECT  *, CONVERT(DECIMAL(10, 2), total * 100.00 / ${hrmcount}) rate
      , CONVERT(DECIMAL(10, 2), man * 100.00 / ${hrmcount}) manRate
      , CONVERT(DECIMAL(10, 2), woman * 100.00 / ${hrmcount}) womanRate
FROM    ( SELECT    ( SELECT    COUNT(*) num
                  FROM      HrmResource
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 0
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 25
                                        AND     30
                ) man ,
                ( SELECT    COUNT(*) num
                  FROM      HrmResource t
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 1
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 25
                                        AND     30
                ) woman ,
                COUNT(*) total ,
                '25-30岁' name
      FROM      HrmResource t
      WHERE     status IN ( 0, 1, 2, 3 )
                AND YEAR(GETDATE())
                - YEAR(CASE WHEN ISDATE(birthday) = 1 THEN birthday
                            ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                      END) BETWEEN 25
                            AND     30
    ) tt
UNION ALL
SELECT  *, CONVERT(DECIMAL(10, 2), total * 100.00 / ${hrmcount}) rate
      , CONVERT(DECIMAL(10, 2), man * 100.00 / ${hrmcount}) manRate
      , CONVERT(DECIMAL(10, 2), woman * 100.00 / ${hrmcount}) womanRate
FROM    ( SELECT    ( SELECT    COUNT(*) num
                  FROM      HrmResource
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 0
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 30
                                        AND     35
                ) man ,
                ( SELECT    COUNT(*) num
                  FROM      HrmResource t
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 1
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 30
                                        AND     35
                ) woman ,
                COUNT(*) total ,
                '30-35岁' name
      FROM      HrmResource t
      WHERE     status IN ( 0, 1, 2, 3 )
                AND YEAR(GETDATE())
                - YEAR(CASE WHEN ISDATE(birthday) = 1 THEN birthday
                            ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                      END) BETWEEN 30
                            AND     35
    ) tt
UNION ALL
SELECT  *, CONVERT(DECIMAL(10, 2), total * 100.00 / ${hrmcount}) rate
    , CONVERT(DECIMAL(10, 2), man * 100.00 / ${hrmcount}) manRate
    , CONVERT(DECIMAL(10, 2), woman * 100.00 / ${hrmcount}) womanRate
FROM    ( SELECT    ( SELECT    COUNT(*) num
                  FROM      HrmResource
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 0
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 35
                                        AND     40
                ) man ,
                ( SELECT    COUNT(*) num
                  FROM      HrmResource t
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 1
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 35
                                        AND     40
                ) woman ,
                COUNT(*) total ,
                '35-40岁' name
      FROM      HrmResource t
      WHERE     status IN ( 0, 1, 2, 3 )
                AND YEAR(GETDATE())
                - YEAR(CASE WHEN ISDATE(birthday) = 1 THEN birthday
                            ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                      END) BETWEEN 35
                            AND     40
    ) tt
UNION ALL
SELECT  *, CONVERT(DECIMAL(10, 2), total * 100.00 / ${hrmcount}) rate
    , CONVERT(DECIMAL(10, 2), man * 100.00 / ${hrmcount}) manRate
    , CONVERT(DECIMAL(10, 2), woman * 100.00 / ${hrmcount}) womanRate
FROM    ( SELECT    ( SELECT    COUNT(*) num
                  FROM      HrmResource
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 0
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 40
                                        AND     45
                ) man ,
                ( SELECT    COUNT(*) num
                  FROM      HrmResource t
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 1
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 40
                                        AND     45
                ) woman ,
                COUNT(*) total ,
                '40-45岁' name
      FROM      HrmResource t
      WHERE     status IN ( 0, 1, 2, 3 )
                AND YEAR(GETDATE())
                - YEAR(CASE WHEN ISDATE(birthday) = 1 THEN birthday
                            ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                      END) BETWEEN 40
                            AND     45
    ) tt
UNION ALL
SELECT  *, CONVERT(DECIMAL(10, 2), total * 100.00 / ${hrmcount}) rate
    , CONVERT(DECIMAL(10, 2), man * 100.00 / ${hrmcount}) manRate
    , CONVERT(DECIMAL(10, 2), woman * 100.00 / ${hrmcount}) womanRate
FROM    ( SELECT    ( SELECT    COUNT(*) num
                  FROM      HrmResource
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 0
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 45
                                        AND     50
                ) man ,
                ( SELECT    COUNT(*) num
                  FROM      HrmResource t
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 1
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 45
                                        AND     50
                ) woman ,
                COUNT(*) total ,
                '45-50岁' name
      FROM      HrmResource t
      WHERE     status IN ( 0, 1, 2, 3 )
                AND YEAR(GETDATE())
                - YEAR(CASE WHEN ISDATE(birthday) = 1 THEN birthday
                            ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                      END) BETWEEN 45
                            AND     50
    ) tt
UNION ALL
SELECT  *, CONVERT(DECIMAL(10, 2), total * 100.00 / ${hrmcount}) rate
      , CONVERT(DECIMAL(10, 2), man * 100.00 / ${hrmcount}) manRate
      , CONVERT(DECIMAL(10, 2), woman * 100.00 / ${hrmcount}) womanRate
FROM    ( SELECT    ( SELECT    COUNT(*) num
                  FROM      HrmResource
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 0
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 50
                                        AND     55
                ) man ,
                ( SELECT    COUNT(*) num
                  FROM      HrmResource t
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 1
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 50
                                        AND     55
                ) woman ,
                COUNT(*) total ,
                '50-55岁' name
      FROM      HrmResource t
      WHERE     status IN ( 0, 1, 2, 3 )
                AND YEAR(GETDATE())
                - YEAR(CASE WHEN ISDATE(birthday) = 1 THEN birthday
                            ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                      END) BETWEEN 50
                            AND     55
    ) tt
UNION ALL
SELECT  *, CONVERT(DECIMAL(10, 2), total * 100.00 / ${hrmcount}) rate
      , CONVERT(DECIMAL(10, 2), man * 100.00 / ${hrmcount}) manRate
      , CONVERT(DECIMAL(10, 2), woman * 100.00 / ${hrmcount}) womanRate
FROM    ( SELECT    ( SELECT    COUNT(*) num
                  FROM      HrmResource
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 0
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 55
                                        AND     60
                ) man ,
                ( SELECT    COUNT(*) num
                  FROM      HrmResource t
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 1
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 55
                                        AND     60
                ) woman ,
                COUNT(*) total ,
                '55-60岁' name
      FROM      HrmResource t
      WHERE     status IN ( 0, 1, 2, 3 )
                AND YEAR(GETDATE())
                - YEAR(CASE WHEN ISDATE(birthday) = 1 THEN birthday
                            ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                      END) BETWEEN 55
                            AND     60
    ) tt
UNION ALL
SELECT  *, CONVERT(DECIMAL(10, 2), total * 100.00 / ${hrmcount}) rate
      , CONVERT(DECIMAL(10, 2), man * 100.00 / ${hrmcount}) manRate
      , CONVERT(DECIMAL(10, 2), woman * 100.00 / ${hrmcount}) womanRate
FROM    ( SELECT    ( SELECT    COUNT(*) num
                  FROM      HrmResource
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 0
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 60
                                        AND     65
                ) man ,
                ( SELECT    COUNT(*) num
                  FROM      HrmResource t
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 1
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) BETWEEN 60
                                        AND     65
                ) woman ,
                COUNT(*) total ,
                '60-65岁' name
      FROM      HrmResource t
      WHERE     status IN ( 0, 1, 2, 3 )
                AND YEAR(GETDATE())
                - YEAR(CASE WHEN ISDATE(birthday) = 1 THEN birthday
                            ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                      END) BETWEEN 60
                            AND     65
    ) tt
UNION ALL
SELECT  *, CONVERT(DECIMAL(10, 2), total * 100.00 / ${hrmcount}) rate
      , CONVERT(DECIMAL(10, 2), man * 100.00 / ${hrmcount}) manRate
      , CONVERT(DECIMAL(10, 2), woman * 100.00 / ${hrmcount}) womanRate
FROM    ( SELECT    ( SELECT    COUNT(*) num
                  FROM      HrmResource
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 0
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) >= 65
                ) man ,
                ( SELECT    COUNT(*) num
                  FROM      HrmResource t
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 1
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) >= 65
                ) woman ,
                COUNT(*) total ,
                '65岁以上' name
      FROM      HrmResource t
      WHERE     status IN ( 0, 1, 2, 3 )
                AND YEAR(GETDATE())
                - YEAR(CASE WHEN ISDATE(birthday) = 1 THEN birthday
                            ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                      END) >= 65
    ) tt
UNION ALL
SELECT  *, CONVERT(DECIMAL(10, 2), total * 100.00 / ${hrmcount}) rate
      , CONVERT(DECIMAL(10, 2), man * 100.00 / ${hrmcount}) manRate
      , CONVERT(DECIMAL(10, 2), woman * 100.00 / ${hrmcount}) womanRate
FROM    ( SELECT    ( SELECT    COUNT(*) num
                  FROM      HrmResource
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 0
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) = -1
                ) man ,
                ( SELECT    COUNT(*) num
                  FROM      HrmResource t
                  WHERE     status IN ( 0, 1, 2, 3 )
                            AND sex = 1
                            AND YEAR(GETDATE())
                            - YEAR(CASE WHEN ISDATE(birthday) = 1
                                        THEN birthday
                                        ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                                  END) = -1
                ) woman ,
                COUNT(*) total ,
                '未知' name
      FROM      HrmResource t
      WHERE     status IN ( 0, 1, 2, 3 )
                AND YEAR(GETDATE())
                - YEAR(CASE WHEN ISDATE(birthday) = 1 THEN birthday
                            ELSE CONVERT(NVARCHAR(4), DATEPART(YEAR,
                                                          GETDATE()) + 1)
                      END) = -1
    ) tt`;
    return recordset;
  } 

  /**
   * Get the hrm antry age
   */
  async getHrmAntryAge(): Promise<HrmAntryAge[]> {
    await this.baseService.connect();
    const { baseInfo } = this.baseService;
    const { hrmcount } = baseInfo;
    const { recordset } = await sql.query`
    SELECT  COUNT(*) num ,
        '入职一周' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND DATEDIFF(dd, createdate, GETDATE()) <= 7
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职一个月' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND DATEDIFF(dd, createdate, GETDATE()) <= 30
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职三个月' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND DATEDIFF(dd, createdate, GETDATE()) <= 90
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职半年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND DATEDIFF(dd, createdate, GETDATE()) <= 180
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职一年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND DATEADD(yy, -1, GETDATE()) >= createdate
        AND DATEADD(yy, -2, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职两年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND DATEADD(yy, -2, GETDATE()) >= createdate
        AND DATEADD(yy, -3, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职三年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND DATEADD(yy, -3, GETDATE()) >= createdate
        AND DATEADD(yy, -4, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职五年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND DATEADD(yy, -5, GETDATE()) >= createdate
        AND DATEADD(yy, -6, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职八年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND DATEADD(yy, -8, GETDATE()) >= createdate
        AND DATEADD(yy, -9, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '8-10年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND DATEADD(yy, -8, GETDATE()) >= createdate
        AND DATEADD(yy, -10, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '10-15年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND DATEADD(yy, -10, GETDATE()) >= createdate
        AND DATEADD(yy, -15, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '15-20年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND DATEADD(yy, -15, GETDATE()) >= createdate
        AND DATEADD(yy, -20, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '20-30年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND DATEADD(yy, -20, GETDATE()) >= createdate
        AND DATEADD(yy, -30, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '30年以上' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND DATEADD(yy, -30, GETDATE()) >= createdate
    `;
    return recordset;
  }

  /**
  * Get foo hrm leave age
  */
  async getHrmLeaveAge(): Promise<any[]> {
    await this.baseService.connect();
    const { baseInfo } = this.baseService;
    const { hrmcount } = baseInfo;
    const { recordset } = await sql.query`
    SELECT  COUNT(*) num ,
        '入职一周' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status = 5
        AND DATEDIFF(dd, createdate, GETDATE()) <= 7
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职一个月' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status = 5
        AND DATEDIFF(dd, createdate, GETDATE()) <= 30
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职三个月' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status = 5
        AND DATEDIFF(dd, createdate, GETDATE()) <= 90
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职半年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status = 5
        AND DATEDIFF(dd, createdate, GETDATE()) <= 180
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职一年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status = 5
        AND DATEADD(yy, -1, GETDATE()) >= createdate
        AND DATEADD(yy, -2, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职两年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status = 5
        AND DATEADD(yy, -2, GETDATE()) >= createdate
        AND DATEADD(yy, -3, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职三年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status = 5
        AND DATEADD(yy, -3, GETDATE()) >= createdate
        AND DATEADD(yy, -4, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职五年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status = 5
        AND DATEADD(yy, -5, GETDATE()) >= createdate
        AND DATEADD(yy, -6, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '入职八年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status = 5
        AND DATEADD(yy, -8, GETDATE()) >= createdate
        AND DATEADD(yy, -9, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '8-10年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status = 5
        AND DATEADD(yy, -8, GETDATE()) >= createdate
        AND DATEADD(yy, -10, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '10-15年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status = 5
        AND DATEADD(yy, -10, GETDATE()) >= createdate
        AND DATEADD(yy, -15, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '15-20年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status = 5
        AND DATEADD(yy, -15, GETDATE()) >= createdate
        AND DATEADD(yy, -20, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '20-30年' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status = 5
        AND DATEADD(yy, -20, GETDATE()) >= createdate
        AND DATEADD(yy, -30, GETDATE()) < createdate
    UNION ALL
    SELECT  COUNT(*) num ,
        '30年以上' name,
        COUNT(*) / ${hrmcount} scale
    FROM    HrmResource
    WHERE   status = 5
        AND DATEADD(yy, -30, GETDATE()) >= createdate
    `;
    return recordset;
  }

  /**
  * Get foo
  */
  async getLeaveSub(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  TOP 1 COUNT(*) num ,
        ( SELECT    subcompanyname
          FROM      hrmsubcompany t1
          WHERE     t.subcompanyid1 = t1.id
        ) subcompanyname
    FROM    HrmResource t
    WHERE   status = 5
        AND subcompanyid1 IS NOT NULL
    GROUP BY subcompanyid1 ORDER BY num DESC 
    `;
    return recordset;
  }

  /**
  * Get foo
  */
  async getLeaveDepart(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT TOP 1 COUNT(*) num ,
        ( SELECT    departmentname
          FROM      hrmdepartment
          WHERE     t.departmentid = id
        ) departmentname ,
        ( SELECT    subcompanyname
          FROM      hrmdepartment t1 ,
                    hrmsubcompany t2
          WHERE     t.departmentid = t1.id
                    AND t1.subcompanyid1 = t2.id
        ) subcompanyname
    FROM    HrmResource t
    WHERE   status = 5
        AND departmentid IS NOT NULL
    GROUP BY departmentid ORDER BY num DESC 
    `;
    return recordset;
  }

  /**
  * Get foo
  */
  async getEntryDetail(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  COUNT(*) userNum ,
              ( SELECT    COUNT(departmentid)
                FROM      ( SELECT    departmentid
                            FROM      HrmResource
                            WHERE     status IN ( 0, 1, 2, 3 )
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 7
                                      AND departmentid IS NOT NULL
                            GROUP BY  departmentid
                          ) t
              ) departNum ,
              ( SELECT    COUNT(subcompanyid1)
                FROM      ( SELECT    subcompanyid1
                            FROM      HrmResource
                            WHERE     status IN ( 0, 1, 2, 3 )
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 7
                                      AND subcompanyid1 IS NOT NULL
                            GROUP BY  subcompanyid1
                          ) t
              ) subNum ,
              '入职一周' name
          FROM    HrmResource
          WHERE   status IN ( 0, 1, 2, 3 )
              AND DATEDIFF(dd, createdate, GETDATE()) <= 7
          UNION ALL
          SELECT  COUNT(*) userNum ,
              ( SELECT    COUNT(departmentid)
                FROM      ( SELECT    departmentid
                            FROM      HrmResource
                            WHERE     status IN ( 0, 1, 2, 3 )
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 30
                                      AND departmentid IS NOT NULL
                            GROUP BY  departmentid
                          ) t
              ) departNum ,
              ( SELECT    COUNT(subcompanyid1)
                FROM      ( SELECT    subcompanyid1
                            FROM      HrmResource
                            WHERE     status IN ( 0, 1, 2, 3 )
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 30
                                      AND subcompanyid1 IS NOT NULL
                            GROUP BY  subcompanyid1
                          ) t
              ) subNum ,
              '入职一个月' name
          FROM    HrmResource
          WHERE   status IN ( 0, 1, 2, 3 )
              AND DATEDIFF(dd, createdate, GETDATE()) <= 30
          UNION ALL
          SELECT  COUNT(*) userNum ,
              ( SELECT    COUNT(departmentid)
                FROM      ( SELECT    departmentid
                            FROM      HrmResource
                            WHERE     status IN ( 0, 1, 2, 3 )
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 90
                                      AND departmentid IS NOT NULL
                            GROUP BY  departmentid
                          ) t
              ) departNum ,
              ( SELECT    COUNT(subcompanyid1)
                FROM      ( SELECT    subcompanyid1
                            FROM      HrmResource
                            WHERE     status IN ( 0, 1, 2, 3 )
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 90
                                      AND subcompanyid1 IS NOT NULL
                            GROUP BY  subcompanyid1
                          ) t
              ) subNum ,
              '入职三个月' name
          FROM    HrmResource
          WHERE   status IN ( 0, 1, 2, 3 )
              AND DATEDIFF(dd, createdate, GETDATE()) <= 90
          UNION ALL
          SELECT  COUNT(*) userNum ,
              ( SELECT    COUNT(departmentid)
                FROM      ( SELECT    departmentid
                            FROM      HrmResource
                            WHERE     status IN ( 0, 1, 2, 3 )
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 180
                                      AND departmentid IS NOT NULL
                            GROUP BY  departmentid
                          ) t
              ) departNum ,
              ( SELECT    COUNT(subcompanyid1)
                FROM      ( SELECT    subcompanyid1
                            FROM      HrmResource
                            WHERE     status IN ( 0, 1, 2, 3 )
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 180
                                      AND subcompanyid1 IS NOT NULL
                            GROUP BY  subcompanyid1
                          ) t
              ) subNum ,
              '入职半年' name
          FROM    HrmResource
          WHERE   status IN ( 0, 1, 2, 3 )
              AND DATEDIFF(dd, createdate, GETDATE()) <= 180
          UNION ALL
          SELECT  COUNT(*) userNum ,
              ( SELECT    COUNT(departmentid)
                FROM      ( SELECT    departmentid
                            FROM      HrmResource
                            WHERE     status IN ( 0, 1, 2, 3 )
                                      AND DATEADD(yy, -1, GETDATE()) >= createdate
                                      AND DATEADD(yy, -2, GETDATE()) < createdate
                                      AND departmentid IS NOT NULL
                            GROUP BY  departmentid
                          ) t
              ) departNum ,
              ( SELECT    COUNT(subcompanyid1)
                FROM      ( SELECT    subcompanyid1
                            FROM      HrmResource
                            WHERE     status IN ( 0, 1, 2, 3 )
                                      AND DATEADD(yy, -1, GETDATE()) >= createdate
                                      AND DATEADD(yy, -2, GETDATE()) < createdate
                                      AND subcompanyid1 IS NOT NULL
                            GROUP BY  subcompanyid1
                          ) t
              ) subNum ,
              '入职一年' name
          FROM    HrmResource
          WHERE   status IN ( 0, 1, 2, 3 )
              AND DATEADD(yy, -1, GETDATE()) >= createdate
              AND DATEADD(yy, -2, GETDATE()) < createdate
    `;
    return recordset;
  }

  /**
  * Get foo
  */
  async getLeaveDetail(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  COUNT(*) userNum ,
              ( SELECT    COUNT(departmentid)
                FROM      ( SELECT    departmentid
                            FROM      HrmResource
                            WHERE     status = 5
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 7
                                      AND departmentid IS NOT NULL
                            GROUP BY  departmentid
                          ) t
              ) departNum ,
              ( SELECT    COUNT(subcompanyid1)
                FROM      ( SELECT    subcompanyid1
                            FROM      HrmResource
                            WHERE     status = 5
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 7
                                      AND subcompanyid1 IS NOT NULL
                            GROUP BY  subcompanyid1
                          ) t
              ) subNum ,
              '入职一周' name
          FROM    HrmResource
          WHERE   status = 5
              AND DATEDIFF(dd, createdate, GETDATE()) <= 7
          UNION ALL
          SELECT  COUNT(*) userNum ,
              ( SELECT    COUNT(departmentid)
                FROM      ( SELECT    departmentid
                            FROM      HrmResource
                            WHERE     status = 5
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 30
                                      AND departmentid IS NOT NULL
                            GROUP BY  departmentid
                          ) t
              ) departNum ,
              ( SELECT    COUNT(subcompanyid1)
                FROM      ( SELECT    subcompanyid1
                            FROM      HrmResource
                            WHERE     status = 5
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 30
                                      AND subcompanyid1 IS NOT NULL
                            GROUP BY  subcompanyid1
                          ) t
              ) subNum ,
              '入职一个月' name
          FROM    HrmResource
          WHERE   status = 5
              AND DATEDIFF(dd, createdate, GETDATE()) <= 30
          UNION ALL
          SELECT  COUNT(*) userNum ,
              ( SELECT    COUNT(departmentid)
                FROM      ( SELECT    departmentid
                            FROM      HrmResource
                            WHERE     status = 5
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 90
                                      AND departmentid IS NOT NULL
                            GROUP BY  departmentid
                          ) t
              ) departNum ,
              ( SELECT    COUNT(subcompanyid1)
                FROM      ( SELECT    subcompanyid1
                            FROM      HrmResource
                            WHERE     status = 5
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 90
                                      AND subcompanyid1 IS NOT NULL
                            GROUP BY  subcompanyid1
                          ) t
              ) subNum ,
              '入职三个月' name
          FROM    HrmResource
          WHERE   status = 5
              AND DATEDIFF(dd, createdate, GETDATE()) <= 90
          UNION ALL
          SELECT  COUNT(*) userNum ,
              ( SELECT    COUNT(departmentid)
                FROM      ( SELECT    departmentid
                            FROM      HrmResource
                            WHERE     status = 5
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 180
                                      AND departmentid IS NOT NULL
                            GROUP BY  departmentid
                          ) t
              ) departNum ,
              ( SELECT    COUNT(subcompanyid1)
                FROM      ( SELECT    subcompanyid1
                            FROM      HrmResource
                            WHERE     status = 5
                                      AND DATEDIFF(dd, createdate, GETDATE()) <= 180
                                      AND subcompanyid1 IS NOT NULL
                            GROUP BY  subcompanyid1
                          ) t
              ) subNum ,
              '入职半年' name
          FROM    HrmResource
          WHERE   status = 5
              AND DATEDIFF(dd, createdate, GETDATE()) <= 180
          UNION ALL
          SELECT  COUNT(*) userNum ,
              ( SELECT    COUNT(departmentid)
                FROM      ( SELECT    departmentid
                            FROM      HrmResource
                            WHERE     status = 5
                                      AND DATEADD(yy, -1, GETDATE()) >= createdate
                                      AND DATEADD(yy, -2, GETDATE()) < createdate
                                      AND departmentid IS NOT NULL
                            GROUP BY  departmentid
                          ) t
              ) departNum ,
              ( SELECT    COUNT(subcompanyid1)
                FROM      ( SELECT    subcompanyid1
                            FROM      HrmResource
                            WHERE     status = 5
                                      AND DATEADD(yy, -1, GETDATE()) >= createdate
                                      AND DATEADD(yy, -2, GETDATE()) < createdate
                                      AND subcompanyid1 IS NOT NULL
                            GROUP BY  subcompanyid1
                          ) t
              ) subNum ,
              '入职一年' name
          FROM    HrmResource
          WHERE   status = 5
              AND DATEADD(yy, -1, GETDATE()) >= createdate
              AND DATEADD(yy, -2, GETDATE()) < createdate
    `;
    return recordset;
  }

  /**
  * Get foo
  */
  async getLastLogindatAsc(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT TOP 5
        lastlogindate ,
        lastname ,
        ( SELECT    departmentname
          FROM      hrmdepartment
          WHERE     id = t.departmentid
        ) departmentname ,
        ( SELECT    subcompanyname
          FROM      HrmSubCompany
          WHERE     id = t.subcompanyid1
        ) subcompanyname
    FROM    dbo.HrmResource t
    WHERE   status IN ( 0, 1, 2, 3 )
        AND lastlogindate IS NOT NULL
    ORDER BY lastlogindate ASC 
    `;
    return recordset;
  }

  /**
  * Get foo
  */
  async getProbationLastLogindateAsc(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT TOP 5
        lastlogindate ,
        lastname ,
        ( SELECT    departmentname
          FROM      hrmdepartment
          WHERE     id = t.departmentid
        ) departmentname ,
        ( SELECT    subcompanyname
          FROM      HrmSubCompany
          WHERE     id = t.subcompanyid1
        ) subcompanyname
    FROM    dbo.HrmResource t
    WHERE   status = 0
        AND lastlogindate IS NOT NULL
    ORDER BY lastlogindate ASC 
    `;
    return recordset;
  }

  /**
  * Get foo
  */
  async getLoginTime(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT '07:00及之前' AS name ,
                  CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
                  / ( SELECT  COUNT(*)
                      FROM    hrmsysmaintenancelog
                      WHERE   operatetype = 6
                    )) rate
            FROM   hrmsysmaintenancelog
            WHERE  operatetime > '00:00:00'
                  AND operatetime <= '07:00:00'
                  AND operatetype = 6
            UNION ALL
            SELECT '07:00-07:30' AS name ,
                  CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
                  / ( SELECT  COUNT(*)
                      FROM    hrmsysmaintenancelog
                      WHERE   operatetype = 6
                    )) rate
            FROM   hrmsysmaintenancelog
            WHERE  operatetime > '07:00:00'
                  AND operatetime <= '07:30:00'
                  AND operatetype = 6
            UNION ALL
            SELECT '07:30-08:00' AS name ,
                  CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
                  / ( SELECT  COUNT(*)
                      FROM    hrmsysmaintenancelog
                      WHERE   operatetype = 6
                    )) rate
            FROM   hrmsysmaintenancelog
            WHERE  operatetime > '07:30:00'
                  AND operatetime <= '08:00:00'
                  AND operatetype = 6
            UNION ALL
            SELECT '08:00-08:30' AS name ,
                  CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
                  / ( SELECT  COUNT(*)
                      FROM    hrmsysmaintenancelog
                      WHERE   operatetype = 6
                    )) rate
            FROM   hrmsysmaintenancelog
            WHERE  operatetime > '08:00:00'
                  AND operatetime <= '08:30:00'
                  AND operatetype = 6
            UNION ALL
            SELECT '08:30-09:00' AS name ,
                  CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
                  / ( SELECT  COUNT(*)
                      FROM    hrmsysmaintenancelog
                      WHERE   operatetype = 6
                    )) rate
            FROM   hrmsysmaintenancelog
            WHERE  operatetime > '08:30:00'
                  AND operatetime <= '09:00:00'
                  AND operatetype = 6
            UNION ALL
            SELECT '09:00-09:30' AS name ,
                  CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
                  / ( SELECT  COUNT(*)
                      FROM    hrmsysmaintenancelog
                      WHERE   operatetype = 6
                    )) rate
            FROM   hrmsysmaintenancelog
            WHERE  operatetime > '09:00:00'
                  AND operatetime <= '09:30:00'
                  AND operatetype = 6
            UNION ALL
            SELECT '09:30-10:00' AS name ,
                  CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
                  / ( SELECT  COUNT(*)
                      FROM    hrmsysmaintenancelog
                      WHERE   operatetype = 6
                    )) rate
            FROM   hrmsysmaintenancelog
            WHERE  operatetime > '09:30:00'
                  AND operatetime <= '10:00:00'
                  AND operatetype = 6
            UNION ALL
            SELECT '10:00-12:00' AS name ,
                  CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
                  / ( SELECT  COUNT(*)
                      FROM    hrmsysmaintenancelog
                      WHERE   operatetype = 6
                    )) rate
            FROM   hrmsysmaintenancelog
            WHERE  operatetime > '10:00:00'
                  AND operatetime <= '12:00:00'
                  AND operatetype = 6
            UNION ALL
            SELECT '12:00以后' AS name ,
                  CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
                  / ( SELECT  COUNT(*)
                      FROM    hrmsysmaintenancelog
                      WHERE   operatetype = 6
                    )) rate
            FROM   hrmsysmaintenancelog
            WHERE  operatetime > '12:00:00'
                  AND operatetime <= '23:59:59'
                  AND operatetype = 6
    `;
    return recordset;
  }

  /**
  * Get foo
  */
  async getLoginFrequency(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  * ,
        ROW_NUMBER() OVER ( ORDER BY num DESC ) AS rank
    FROM    ( SELECT TOP 10
                    ( SELECT    lastname
                      FROM      dbo.HrmResource
                      WHERE     t.operateuserid = id
                    ) lastname ,
                    ( SELECT    t2.departmentname
                      FROM      dbo.HrmResource t1 ,
                                hrmdepartment t2
                      WHERE     t.operateuserid = t1.id
                                AND t2.id = t1.departmentid
                    ) departmentname ,
                    ( SELECT    t2.subcompanyname
                      FROM      dbo.HrmResource t1 ,
                                HrmSubCompany t2
                      WHERE     t.operateuserid = t1.id
                                AND t2.id = t1.subcompanyid1
                    ) subcompanyname ,
                    COUNT(*) num
          FROM      hrmsysmaintenancelog t
          WHERE     operateuserid != 0
                    AND operateuserid != 1
                    AND operatetype = 6
          GROUP BY  operateuserid
          ORDER BY  num DESC
        ) t
    `;
    return recordset;
  }

  /**
  * Get foo
  */
  async getLoginTimeAsc(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  * ,
        ROW_NUMBER() OVER ( ORDER BY operatetime ASC ) AS rank
    FROM    ( SELECT TOP 10
                    ( SELECT    lastname
                      FROM      dbo.HrmResource
                      WHERE     t.operateuserid = id
                    ) lastname ,
                    ( SELECT    t2.departmentname
                      FROM      dbo.HrmResource t1 ,
                                hrmdepartment t2
                      WHERE     t.operateuserid = t1.id
                                AND t2.id = t1.departmentid
                    ) departmentname ,
                    ( SELECT    t2.subcompanyname
                      FROM      dbo.HrmResource t1 ,
                                HrmSubCompany t2
                      WHERE     t.operateuserid = t1.id
                                AND t2.id = t1.subcompanyid1
                    ) subcompanyname ,
                    operatetime, operateuserid
          FROM      hrmsysmaintenancelog t
          WHERE     operatetime > '06:00:00' and operateuserid !=1 and operateuserid !=0  AND operatetype = 6
          ORDER BY  operatetime ASC
        ) tt
    `;
    return recordset;
  }

  /**
  * Get foo
  */
  async getEarlySignIn(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT TOP 10
        ( SELECT    lastname
          FROM      dbo.HrmResource
          WHERE     tt.userid = id
        ) lastname ,
        ( SELECT    t2.departmentname
          FROM      dbo.HrmResource t1 ,
                    hrmdepartment t2
          WHERE     tt.userid = t1.id
                    AND t2.id = t1.departmentid
        ) departmentname ,
        ( SELECT    t2.subcompanyname
          FROM      dbo.HrmResource t1 ,
                    HrmSubCompany t2
          WHERE     tt.userid = t1.id
                    AND t2.id = t1.subcompanyid1
        ) subcompanyname ,
        num ,
        ROW_NUMBER() OVER ( ORDER BY num DESC ) AS rank
    FROM    ( SELECT    COUNT(userId) num ,
                    userid
          FROM      ( SELECT    userId ,
                                ROW_NUMBER() OVER ( PARTITION BY signDate ORDER BY signTime ASC ) AS a
                      FROM      hrmschedulesign
                      WHERE     signType = 1
                    ) AS c
          WHERE     a < 21
          GROUP BY  userId
        ) tt
    `;
    return recordset;
  }

  /**
  * Get foo
  */
  async getSignOutTime(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  '17:00之前' AS name ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  CASE WHEN COUNT(*) = 0 THEN -1
                          ELSE COUNT(*)
                      END num
              FROM    hrmschedulesign
              WHERE   signType = 2
            )) rate
      FROM    hrmschedulesign
      WHERE   signType = 2 and  signTime < '17:00:00'
      UNION ALL
      SELECT  '17:00-17.30' AS name ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  CASE WHEN COUNT(*) = 0 THEN -1
                          ELSE COUNT(*)
                      END num
              FROM    hrmschedulesign
              WHERE   signType = 2
            )) rate
      FROM    hrmschedulesign
      WHERE   signType = 2 and  signTime >= '17:00:00'
          AND signTime < '17:30:00'
      UNION ALL
      SELECT  '17:30-18.00' AS name ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  CASE WHEN COUNT(*) = 0 THEN -1
                          ELSE COUNT(*)
                      END num
              FROM    hrmschedulesign
              WHERE   signType = 2
            )) rate
      FROM    hrmschedulesign
      WHERE   signType = 2 and  signTime >= '17:30:00'
          AND signTime < '18:00:00'
      UNION ALL
      SELECT  '18:00-18.30' AS name ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  CASE WHEN COUNT(*) = 0 THEN -1
                          ELSE COUNT(*)
                      END num
              FROM    hrmschedulesign
              WHERE   signType = 2
            )) rate
      FROM    hrmschedulesign
      WHERE   signType = 2 and  signTime >= '18:00:00'
          AND signTime < '18:30:00'
      UNION ALL
      SELECT  '18:30-19:00' AS name ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  CASE WHEN COUNT(*) = 0 THEN -1
                          ELSE COUNT(*)
                      END num
              FROM    hrmschedulesign
              WHERE   signType = 2
            )) rate
      FROM    hrmschedulesign
      WHERE  signType = 2 and   signTime >= '18:30:00'
          AND signTime < '19:00:00'
      UNION ALL
      SELECT  '19:00-19:30' AS name ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  CASE WHEN COUNT(*) = 0 THEN -1
                          ELSE COUNT(*)
                      END num
              FROM    hrmschedulesign
              WHERE   signType = 2
            )) rate
      FROM    hrmschedulesign
      WHERE  signType = 2 and   signTime >= '19:00:00'
          AND signTime < '19:30:00'
      UNION ALL
      SELECT  '19:30-20:00' AS name ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  CASE WHEN COUNT(*) = 0 THEN -1
                          ELSE COUNT(*)
                      END num
              FROM    hrmschedulesign
              WHERE   signType = 2
            )) rate
      FROM    hrmschedulesign
      WHERE  signType = 2 and   signTime >= '19:30:00'
          AND signTime < '20:00:00'
      UNION ALL
      SELECT  '20:00-20:30' AS name ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  CASE WHEN COUNT(*) = 0 THEN -1
                          ELSE COUNT(*)
                      END num
              FROM    hrmschedulesign
              WHERE   signType = 2
            )) rate
      FROM    hrmschedulesign
      WHERE   signType = 2 and  signTime >= '20:00:00'
          AND signTime < '20:30:00'
      UNION ALL
      SELECT  '20:30-21:00' AS name ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  CASE WHEN COUNT(*) = 0 THEN -1
                          ELSE COUNT(*)
                      END num
              FROM    hrmschedulesign
              WHERE   signType = 2
            )) rate
      FROM    hrmschedulesign
      WHERE  signType = 2 and   signTime >= '20:30:00'
          AND signTime < '21:00:00'
      UNION ALL
      SELECT  '21:00-21:30' AS name ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  CASE WHEN COUNT(*) = 0 THEN -1
                          ELSE COUNT(*)
                      END num
              FROM    hrmschedulesign
              WHERE   signType = 2
            )) rate
      FROM    hrmschedulesign
      WHERE  signType = 2 and  signTime >= '21:00:00'
          AND signTime < '21:30:00'
      UNION ALL
      SELECT  '21:30-22:00' AS name ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  CASE WHEN COUNT(*) = 0 THEN -1
                          ELSE COUNT(*)
                      END num
              FROM    hrmschedulesign
              WHERE   signType = 2
            )) rate
      FROM    hrmschedulesign
      WHERE  signType = 2 and  signTime >= '21:30:00'
          AND signTime < '22:00:00'
      UNION ALL
      SELECT  '22:00以后' AS name ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  CASE WHEN COUNT(*) = 0 THEN -1
                          ELSE COUNT(*)
                      END num
              FROM    hrmschedulesign
              WHERE   signType = 2
            )) rate
      FROM    hrmschedulesign
      WHERE  signType = 2 and  signTime >= '22:00:00'
          AND signTime < '23:59:59'
    `;
    return recordset;
  }

  /**
  * Get foo
  */
  async getLateSignOut(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  * ,
            ROW_NUMBER() OVER ( ORDER BY signTime desc ) AS rank
    FROM    ( SELECT TOP 10
                        ( SELECT    lastname
                          FROM      dbo.HrmResource
                          WHERE     t.userid = id
                        ) lastname ,
                        ( SELECT    t2.departmentname
                          FROM      dbo.HrmResource t1 ,
                                    hrmdepartment t2
                          WHERE     t.userid = t1.id
                                    AND t2.id = t1.departmentid
                        ) departmentname ,
                        ( SELECT    t2.subcompanyname
                          FROM      dbo.HrmResource t1 ,
                                    HrmSubCompany t2
                          WHERE     t.userid = t1.id
                                    AND t2.id = t1.subcompanyid1
                        ) subcompanyname ,
                        signTime
              FROM      hrmschedulesign t
              WHERE     signType = 2
              ORDER BY  signTime DESC
            ) tt
    `;
    return recordset;
  }

  /**
  * Get foo
  */
  async getEarlySignOut(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT TOP 10
            ( SELECT    lastname
              FROM      dbo.HrmResource
              WHERE     tt.userid = id
            ) lastname ,
            ( SELECT    t2.departmentname
              FROM      dbo.HrmResource t1 ,
                        hrmdepartment t2
              WHERE     tt.userid = t1.id
                        AND t2.id = t1.departmentid
            ) departmentname ,
            ( SELECT    t2.subcompanyname
              FROM      dbo.HrmResource t1 ,
                        HrmSubCompany t2
              WHERE     tt.userid = t1.id
                        AND t2.id = t1.subcompanyid1
            ) subcompanyname ,
            num ,
            ROW_NUMBER() OVER ( ORDER BY num DESC ) AS rank
    FROM    ( SELECT    COUNT(userId) num ,
                        userid
              FROM      ( SELECT    userId ,
                                    ROW_NUMBER() OVER ( PARTITION BY signDate ORDER BY signTime ASC ) AS a
                          FROM      hrmschedulesign
                          WHERE     signType = 2
                                    AND signTime > '12:00:00'
                        ) AS c
              WHERE     a < 21
              GROUP BY  userId
            ) tt
    `;
    return recordset;
  }
  
  /**
  * Get foo
  */
  async getSignInAdress(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  addr ,
        COUNT(*) num ,
        CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00 / ( SELECT  COUNT(*)
                                                      FROM    hrmschedulesign
                                                      WHERE   signType = 1
                                                    )) rate
    FROM    hrmschedulesign
    WHERE   signType = 1
        AND addr IS NOT NULL
        AND addr != ''
    GROUP BY addr
    ORDER BY num DESC
    `;
    return recordset;
  }
  
  /**
   * 简单密码的人员列表
   * TODO: write sql query.
   */
  async getEasyPassWordUserList(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    
    `;
    return recordset;
  }

  /**
   * 系统内简单密码排名
   * TODO: write sql query.
   */
  async getEasyPassWordRank(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`

    `;
    return recordset;
  }

  /**
   * 系统管理员帐号的常见登陆地址
   */
  async getSysadminLoginIpRate(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  clientaddress ,
        ( SELECT    loginid
          FROM      HrmResourceManager t1
          WHERE     relatedid = t1.id
        ) loginid ,
        COUNT(*) num ,
        CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
        / ( SELECT  COUNT(*)
            FROM    HrmSysMaintenanceLog t1
            WHERE   EXISTS ( SELECT id
                            FROM   HrmResourceManager
                            WHERE  t1.relatedid = id )
                    AND operatetype = 6
          )) rate
    FROM    HrmSysMaintenanceLog t
    WHERE   EXISTS ( SELECT id
                FROM   HrmResourceManager
                WHERE  t.relatedid = id )
        AND operatetype = 6
    GROUP BY t.clientaddress ,
        t.relatedid
    ORDER BY num DESC
    `;
    return recordset;
  }

  /**
   * 人员登陆异常
   * TODO: write sql query.
   */
  async getLoginAbnormal(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    
    `;
    return recordset;
  }

  /**
  * 人员生日分布
  */
  async getBirthdayDistribute(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  CONVERT(NVARCHAR(4), MONTH(birthday)) + '月' AS month ,
            COUNT(*) num ,
            CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
            / ( SELECT  COUNT(*)
                FROM    HrmResource t
                WHERE   status IN ( 0, 1, 2, 3 )
              )) rate
    FROM    HrmResource
    WHERE   ISDATE(birthday) = 1
            AND status IN ( 0, 1, 2, 3 )
    GROUP BY MONTH(birthday)
    `;
    return recordset;
  }

  /**
   * 人员星座分布
   */
  async getSignDistribute(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  COUNT(*) num ,
          '白羊座' AS sign ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  COUNT(*)
              FROM    HrmResource
              WHERE   ISDATE(birthday) = 1
                      AND status IN ( 0, 1, 2, 3 )
            )) rate
      FROM    HrmResource
      WHERE   ISDATE(birthday) = 1
          AND status IN ( 0, 1, 2, 3 )
          AND ( ( DATEPART(mm, birthday) = 3
                  AND DATEPART(dd, birthday) <= 31
                  AND DATEPART(dd, birthday) > = 21
                )
                OR ( DATEPART(mm, birthday) = 4
                    AND DATEPART(dd, birthday) < = 19
                  )
              )
      UNION ALL
      SELECT  COUNT(*) num ,
          '金牛座' AS sign ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  COUNT(*)
              FROM    HrmResource
              WHERE   ISDATE(birthday) = 1
                      AND status IN ( 0, 1, 2, 3 )
            )) rate
      FROM    HrmResource
      WHERE   ISDATE(birthday) = 1
          AND status IN ( 0, 1, 2, 3 )
          AND ( ( DATEPART(mm, birthday) = 4
                  AND DATEPART(dd, birthday) <= 30
                  AND DATEPART(dd, birthday) > = 20
                )
                OR ( DATEPART(mm, birthday) = 5
                    AND DATEPART(dd, birthday) < = 20
                  )
              )
      UNION ALL
      SELECT  COUNT(*) num ,
          '双子座' AS sign ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  COUNT(*)
              FROM    HrmResource
              WHERE   ISDATE(birthday) = 1
                      AND status IN ( 0, 1, 2, 3 )
            )) rate
      FROM    HrmResource
      WHERE   ISDATE(birthday) = 1
          AND status IN ( 0, 1, 2, 3 )
          AND ( ( DATEPART(mm, birthday) = 5
                  AND DATEPART(dd, birthday) <= 31
                  AND DATEPART(dd, birthday) > = 21
                )
                OR ( DATEPART(mm, birthday) = 6
                    AND DATEPART(dd, birthday) < = 21
                  )
              )
      UNION ALL
      SELECT  COUNT(*) num ,
          '巨蟹座' AS sign ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  COUNT(*)
              FROM    HrmResource
              WHERE   ISDATE(birthday) = 1
                      AND status IN ( 0, 1, 2, 3 )
            )) rate
      FROM    HrmResource
      WHERE   ISDATE(birthday) = 1
          AND status IN ( 0, 1, 2, 3 )
          AND ( ( DATEPART(mm, birthday) = 6
                  AND DATEPART(dd, birthday) <= 30
                  AND DATEPART(dd, birthday) > = 22
                )
                OR ( DATEPART(mm, birthday) = 7
                    AND DATEPART(dd, birthday) < = 22
                  )
              )
      UNION ALL
      SELECT  COUNT(*) num ,
          '狮子座' AS sign ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  COUNT(*)
              FROM    HrmResource
              WHERE   ISDATE(birthday) = 1
                      AND status IN ( 0, 1, 2, 3 )
            )) rate
      FROM    HrmResource
      WHERE   ISDATE(birthday) = 1
          AND status IN ( 0, 1, 2, 3 )
          AND ( ( DATEPART(mm, birthday) = 7
                  AND DATEPART(dd, birthday) <= 31
                  AND DATEPART(dd, birthday) > = 23
                )
                OR ( DATEPART(mm, birthday) = 8
                    AND DATEPART(dd, birthday) < = 22
                  )
              )
      UNION ALL
      SELECT  COUNT(*) num ,
          '处女座' AS sign ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  COUNT(*)
              FROM    HrmResource
              WHERE   ISDATE(birthday) = 1
                      AND status IN ( 0, 1, 2, 3 )
            )) rate
      FROM    HrmResource
      WHERE   ISDATE(birthday) = 1
          AND status IN ( 0, 1, 2, 3 )
          AND ( ( DATEPART(mm, birthday) = 8
                  AND DATEPART(dd, birthday) <= 31
                  AND DATEPART(dd, birthday) > = 23
                )
                OR ( DATEPART(mm, birthday) = 9
                    AND DATEPART(dd, birthday) < = 22
                  )
              )
      UNION ALL
      SELECT  COUNT(*) num ,
          '天秤座' AS sign ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  COUNT(*)
              FROM    HrmResource
              WHERE   ISDATE(birthday) = 1
                      AND status IN ( 0, 1, 2, 3 )
            )) rate
      FROM    HrmResource
      WHERE   ISDATE(birthday) = 1
          AND status IN ( 0, 1, 2, 3 )
          AND ( ( DATEPART(mm, birthday) = 9
                  AND DATEPART(dd, birthday) <= 30
                  AND DATEPART(dd, birthday) > = 23
                )
                OR ( DATEPART(mm, birthday) = 10
                    AND DATEPART(dd, birthday) < = 23
                  )
              )
      UNION ALL
      SELECT  COUNT(*) num ,
          '天蝎座' AS sign ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  COUNT(*)
              FROM    HrmResource
              WHERE   ISDATE(birthday) = 1
                      AND status IN ( 0, 1, 2, 3 )
            )) rate
      FROM    HrmResource
      WHERE   ISDATE(birthday) = 1
          AND status IN ( 0, 1, 2, 3 )
          AND ( ( DATEPART(mm, birthday) = 10
                  AND DATEPART(dd, birthday) <= 31
                  AND DATEPART(dd, birthday) > = 24
                )
                OR ( DATEPART(mm, birthday) = 11
                    AND DATEPART(dd, birthday) < = 22
                  )
              )
      UNION ALL
      SELECT  COUNT(*) num ,
          '射手座' AS sign ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  COUNT(*)
              FROM    HrmResource
              WHERE   ISDATE(birthday) = 1
                      AND status IN ( 0, 1, 2, 3 )
            )) rate
      FROM    HrmResource
      WHERE   ISDATE(birthday) = 1
          AND status IN ( 0, 1, 2, 3 )
          AND ( ( DATEPART(mm, birthday) = 11
                  AND DATEPART(dd, birthday) <= 30
                  AND DATEPART(dd, birthday) > = 23
                )
                OR ( DATEPART(mm, birthday) = 12
                    AND DATEPART(dd, birthday) < = 21
                  )
              )
      UNION ALL
      SELECT  COUNT(*) num ,
          '摩羯座' AS sign ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  COUNT(*)
              FROM    HrmResource
              WHERE   ISDATE(birthday) = 1
                      AND status IN ( 0, 1, 2, 3 )
            )) rate
      FROM    HrmResource
      WHERE   ISDATE(birthday) = 1
          AND status IN ( 0, 1, 2, 3 )
          AND ( ( DATEPART(mm, birthday) = 12
                  AND DATEPART(dd, birthday) <= 31
                  AND DATEPART(dd, birthday) > = 22
                )
                OR ( DATEPART(mm, birthday) = 1
                    AND DATEPART(dd, birthday) < = 19
                  )
              )
      UNION ALL
      SELECT  COUNT(*) num ,
          '水瓶座' AS sign ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  COUNT(*)
              FROM    HrmResource
              WHERE   ISDATE(birthday) = 1
                      AND status IN ( 0, 1, 2, 3 )
            )) rate
      FROM    HrmResource
      WHERE   ISDATE(birthday) = 1
          AND status IN ( 0, 1, 2, 3 )
          AND ( ( DATEPART(mm, birthday) = 1
                  AND DATEPART(dd, birthday) <= 31
                  AND DATEPART(dd, birthday) > = 20
                )
                OR ( DATEPART(mm, birthday) = 2
                    AND DATEPART(dd, birthday) < = 18
                  )
              )
      UNION ALL
      SELECT  COUNT(*) num ,
          '双鱼座' AS sign ,
          CONVERT(DECIMAL(10, 2), COUNT(*) * 100.00
          / ( SELECT  COUNT(*)
              FROM    HrmResource
              WHERE   ISDATE(birthday) = 1
                      AND status IN ( 0, 1, 2, 3 )
            )) rate
      FROM    HrmResource
      WHERE   ISDATE(birthday) = 1
          AND status IN ( 0, 1, 2, 3 )
          AND ( ( DATEPART(mm, birthday) = 2
                  AND DATEPART(dd, birthday) <= 29
                  AND DATEPART(dd, birthday) > = 19
                )
                OR ( DATEPART(mm, birthday) = 3
                    AND DATEPART(dd, birthday) < = 20
                  )
              )
    `;
    return recordset;
  }

  /**
  * 系统中无身份证人员列表
  */
  async getNoIdCardUserList(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  lastname ,
        ( SELECT    departmentname
          FROM      hrmdepartment
          WHERE     id = departmentid
        ) departmentname ,
        ( SELECT    subcompanyname
          FROM      HrmSubCompany
          WHERE     id = subcompanyid1
        ) subcompanyname
    FROM    hrmresource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND ( certificatenum IS NULL
              OR certificatenum = ''
            )
    `;
    return recordset;
  }
  
  /**
  * 系统中未登记人员生日列表
  */
  async getNoBirthdayMsgUserList(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  lastname ,
        ( SELECT    departmentname
          FROM      hrmdepartment
          WHERE     id = departmentid
        ) departmentname ,
        ( SELECT    subcompanyname
          FROM      HrmSubCompany
          WHERE     id = subcompanyid1
        ) subcompanyname
    FROM    hrmresource
    WHERE   status IN ( 0, 1, 2, 3 )
        AND ( birthday IS NULL
              OR birthday = ''
        OR ISDATE(birthday) = 0
            )
    `;
    return recordset;
  }

  /**
  * 系统中未登记人员照片列表
  */
  async getNoImgMsgUserList(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  lastname ,
            ( SELECT    departmentname
              FROM      hrmdepartment
              WHERE     id = departmentid
            ) departmentname ,
            ( SELECT    subcompanyname
              FROM      HrmSubCompany
              WHERE     id = subcompanyid1
            ) subcompanyname
    FROM    hrmresource
    WHERE   status IN ( 0, 1, 2, 3 )
            AND ( messagerurl IS NULL
                  OR messagerurl = ''
                )
            AND ( resourceimageid IS NULL
                  OR resourceimageid = 0
                )
    `;
    return recordset;
  }

  /**
  * 系统中封存部门信息
  */
  async getHasSealDepart(): Promise<any[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  departmentname ,
        ( SELECT    subcompanyname
          FROM      HrmSubCompany
          WHERE     id = subcompanyid1
        ) subcompanyname ,
        modified
    FROM    hrmdepartment
    WHERE   canceled = 1
    `;
    return recordset;
  }

  

}