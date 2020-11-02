import { Injectable } from '@nestjs/common';
import { WfBase } from './wf.interface';
import { BaseService } from '../base/base.service';
const sql = require('mssql');

@Injectable()
export class WfService {
  constructor(private readonly baseService: BaseService) {}

  /**
   * 流程基本数据
   */
  async getWfBase(): Promise<WfBase[]> {
    await this.baseService.connect();
    const { recordset } = await sql.query`
    SELECT  '现搭建的流程分类' name ,
            CONVERT(VARCHAR(10), COUNT(*)) num ,
            '个分类' unit
    FROM    workflow_type
    UNION ALL
    SELECT  '现有的工作流程' name ,
            CONVERT(VARCHAR(10), COUNT(*)) num ,
            '条流程' unit
    FROM    workflow_base
    UNION ALL
    SELECT  '有效的工作流程数量' name ,
            CONVERT(VARCHAR(10), COUNT(*)) num ,
            '条流程' unit
    FROM    workflow_base
    WHERE   isvalid = 1
    UNION ALL
    SELECT  '被废弃的工作流程数量' name ,
            CONVERT(VARCHAR(10), COUNT(*)) num ,
            '条流程' unit
    FROM    workflow_base
    WHERE   isvalid = 0
    UNION ALL
    SELECT  '有走过流程数量的流程' name ,
            CONVERT(VARCHAR(10), COUNT(*)) num ,
            '条流程' unit
    FROM    workflow_base t
    WHERE   EXISTS ( SELECT 1
                    FROM   workflow_requestbase
                    WHERE  t.id = workflowid )
    UNION ALL
    SELECT  '总计产生的请求数量' name ,
            CONVERT(VARCHAR(20), COUNT(DISTINCT t1.requestid)) num ,
            '条请求' unit
    FROM    workflow_requestbase t1 ,
            workflow_currentoperator t2
    WHERE   t1.requestid = t2.requestid
            AND ( t1.deleted <> 1
                  OR t1.deleted IS NULL
                  OR t1.deleted = ''
                )
            AND ( t2.isremark IS NOT NULL
                  OR t2.isremark != ''
                )
            AND t1.workflowID IN ( SELECT   id
                                  FROM     workflow_base
                                  WHERE    isvalid IN ( '1', '3' ) )
    UNION ALL
    SELECT  '已经归档的请求数量' name ,
            CONVERT(VARCHAR(20), COUNT(DISTINCT t1.requestid)) num ,
            '条请求' unit
    FROM    workflow_requestbase t1 ,
            workflow_currentoperator t2 ,
            workflow_base t3
    WHERE   t1.requestid = t2.requestid
            AND ( t2.isremark IN ( '2', '4' )
                  OR ( t2.isremark = '0'
                      AND takisremark = -2
                    )
                )
            AND iscomplete = 1
            AND t1.currentnodetype = '3'
            AND ( t1.deleted = 0
                  OR t1.deleted IS NULL
                )
            AND t3.id = t2.workflowid
            AND ( t3.isvalid = '1'
                  OR t3.isvalid = '3'
                )
            AND ( t1.currentstatus <> 1
                  OR t1.currentstatus IS NULL
                )
    UNION ALL
    SELECT  '总体归档率' name ,
            CONVERT(VARCHAR(500), CONVERT(DECIMAL(10, 2), COUNT(DISTINCT t1.requestid)
            * 100.00
            / ( SELECT  COUNT(DISTINCT t1.requestid) num
                FROM    workflow_requestbase t1 ,
                        workflow_currentoperator t2
                WHERE   t1.requestid = t2.requestid
                        AND ( t1.deleted <> 1
                              OR t1.deleted IS NULL
                              OR t1.deleted = ''
                            )
                        AND ( t2.isremark IS NOT NULL
                              OR t2.isremark != ''
                            )
                        AND t1.workflowID IN ( SELECT   id
                                              FROM     workflow_base
                                              WHERE    isvalid IN ( '1', '3' ) )
              ))) num ,
            '百分比' unit
    FROM    workflow_requestbase t1 ,
            workflow_currentoperator t2 ,
            workflow_base t3
    WHERE   t1.requestid = t2.requestid
            AND ( t2.isremark IN ( '2', '4' )
                  OR ( t2.isremark = '0'
                      AND takisremark = -2
                    )
                )
            AND iscomplete = 1
            AND t1.currentnodetype = '3'
            AND ( t1.deleted = 0
                  OR t1.deleted IS NULL
                )
            AND t3.id = t2.workflowid
            AND ( t3.isvalid = '1'
                  OR t3.isvalid = '3'
                )
            AND ( t1.currentstatus <> 1
                  OR t1.currentstatus IS NULL
                )
    UNION ALL
    SELECT  '审批时间最长的一条请求' name ,
            CONVERT(VARCHAR(20), t.requestid) num ,
            'ID号' unit
    FROM    ( SELECT TOP 1
                        c.requestid
              FROM      workflow_currentoperator a ,
                        workflow_flownode b ,
                        workflow_requestbase c
              WHERE     a.nodeid = b.nodeid
                        AND a.requestid = c.requestid
                        AND b.nodetype = 3
              ORDER BY  DATEDIFF(dd, createdate + ' ' + createtime,
                                receivedate + ' ' + receivetime) DESC
            ) t
    UNION ALL
    SELECT  '发起请求最多的分部及部门' name ,
            tt.num ,
            '分部及部门' unit
    FROM    ( SELECT TOP 1
                        '部门：' + departmentname + '，分部：'
                        + ( SELECT TOP 1
                                    subcompanyname
                            FROM    ( SELECT    ( SELECT    a.subcompanyname
                                                  FROM      HrmSubCompany a ,
                                                            HrmResource b
                                                  WHERE     a.id = b.subcompanyid1
                                                            AND b.id = t1.creater
                                                ) subcompanyname
                                      FROM      workflow_requestbase t1 ,
                                                workflow_currentoperator t2
                                      WHERE     t1.requestid = t2.requestid
                                                AND ( t1.deleted <> 1
                                                      OR t1.deleted IS NULL
                                                      OR t1.deleted = ''
                                                    )
                                                AND ( t2.isremark IS NOT NULL
                                                      OR t2.isremark != ''
                                                    )
                                                AND t1.workflowID IN (
                                                SELECT  id
                                                FROM    workflow_base
                                                WHERE   isvalid IN ( '1', '3' ) )
                                                AND creater != 0
                                                AND creater != 1
                                    ) t
                            GROUP BY subcompanyname
                            ORDER BY COUNT(subcompanyname) DESC
                          ) num
              FROM      ( SELECT    ( SELECT    a.departmentname
                                      FROM      hrmdepartment a ,
                                                HrmResource b
                                      WHERE     a.id = b.departmentid
                                                AND b.id = t1.creater
                                    ) departmentname
                          FROM      workflow_requestbase t1 ,
                                    workflow_currentoperator t2
                          WHERE     t1.requestid = t2.requestid
                                    AND ( t1.deleted <> 1
                                          OR t1.deleted IS NULL
                                          OR t1.deleted = ''
                                        )
                                    AND ( t2.isremark IS NOT NULL
                                          OR t2.isremark != ''
                                        )
                                    AND t1.workflowID IN (
                                    SELECT  id
                                    FROM    workflow_base
                                    WHERE   isvalid IN ( '1', '3' ) )
                                    AND creater != 0
                                    AND creater != 1
                        ) t
              GROUP BY  departmentname
              ORDER BY  COUNT(departmentname) DESC
            ) tt
    UNION ALL
    SELECT  '发起请求最多的人员' name ,
            tt.num ,
            '人员姓名' unit
    FROM    ( SELECT TOP 1
                        ( SELECT    lastname
                          FROM      HrmResource
                          WHERE     t1.creater = id
                        ) num
              FROM      workflow_requestbase t1 ,
                        workflow_currentoperator t2
              WHERE     t1.requestid = t2.requestid
                        AND ( t1.deleted <> 1
                              OR t1.deleted IS NULL
                              OR t1.deleted = ''
                            )
                        AND ( t2.isremark IS NOT NULL
                              OR t2.isremark != ''
                            )
                        AND t1.workflowID IN ( SELECT   id
                                              FROM     workflow_base
                                              WHERE    isvalid IN ( '1', '3' ) )
                        AND creater != 0
                        AND creater != 1
              GROUP BY  creater
              ORDER BY  COUNT(creater) DESC
            ) tt
    UNION ALL
    SELECT  '发起流程最多的流程分类' name ,
            tt.typename AS num ,
            '流程分类' unit
    FROM    ( SELECT TOP 1
                        typename
              FROM      workflow_requestbase t1 ,
                        workflow_base t2 ,
                        workflow_type t3
              WHERE     t1.workflowid = t2.id
                        AND t2.workflowtype = t3.id
              GROUP BY  typename
              ORDER BY  COUNT(*) DESC
            ) tt
    UNION ALL
    SELECT  '发起流程最多的流程类型' name ,
            tt.workflowname AS num ,
            '流程类型' unit
    FROM    ( SELECT TOP 1
                        workflowname
              FROM      workflow_requestbase t1 ,
                        workflow_base t2
              WHERE     t1.workflowid = t2.id
              GROUP BY  workflowname
              ORDER BY  COUNT(*) DESC
            ) tt
    UNION ALL
    SELECT  '未发起流程的流程分类' name ,
            STUFF(( SELECT  ',' + CONVERT(VARCHAR, typename)
                    FROM    ( SELECT    typename
                              FROM      workflow_type t
                              WHERE     EXISTS ( SELECT 1
                                                FROM   ( SELECT DISTINCT
                                                                  t2.workflowtype
                                                          FROM    workflow_requestbase t1 ,
                                                                  workflow_base t2
                                                          WHERE   t1.workflowid = t2.id
                                                        ) tt
                                                WHERE  tt.workflowtype = t.id )
                            ) t
                  FOR
                    XML PATH('')
                  ), 1, 1, '') AS num ,
            '流程分类' unit
    UNION ALL
    SELECT  '未发起流程的流程类型' name ,
            STUFF(( SELECT  ',' + CONVERT(VARCHAR, workflowname)
                    FROM    ( SELECT    workflowname
                              FROM      workflow_base t
                              WHERE     EXISTS ( SELECT 1
                                                FROM   ( SELECT DISTINCT
                                                                  t1.workflowid
                                                          FROM    workflow_requestbase t1
                                                        ) tt
                                                WHERE  tt.workflowid = t.id )
                            ) t
                  FOR
                    XML PATH('')
                  ), 1, 1, '') AS num ,
            '流程类型' unit
    UNION ALL
    SELECT  '产生请求最多的一天' name ,
            tt.createdate num ,
            '日期' unit
    FROM    ( SELECT TOP 1
                        createdate
              FROM      workflow_requestbase
              GROUP BY  createdate
              ORDER BY  COUNT(*) DESC
            ) tt
    UNION ALL
    SELECT  '产生请求最少的一天' name ,
            tt.createdate num ,
            '日期' unit
    FROM    ( SELECT TOP 1
                        createdate
              FROM      workflow_requestbase
              GROUP BY  createdate
              ORDER BY  COUNT(*) ASC
            ) tt
    UNION ALL
    SELECT  '系统运行以来平均每天请求数量' name ,
            CONVERT(VARCHAR(20), COUNT(*)
            / ( SELECT  DATEDIFF(dd, MIN(createdate), GETDATE())
                FROM    workflow_requestbase
              )) num ,
            '条请求' unit
    FROM    workflow_requestbase`;
    return recordset;
  }
  
  /**
	* 流程因退回没有处理的流程数量
	*/
	async getRequestCountBybereject(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  COUNT(DISTINCT t1.requestid) num
		FROM    workflow_requestbase t1 ,
						workflow_currentoperator t2 ,
						workflow_base t3
		WHERE   t1.requestid = t2.requestid
						AND t2.islasttimes = 1
						AND t1.workflowid = t3.id
						AND t2.isbereject = '1'
						AND ( ( t2.isremark = '0'
										AND ( t2.takisremark IS NULL
													OR t2.takisremark = 0
												)
									)
									OR t2.isremark IN ( '1', '5', '8', '9', '7', '11' )
								)
		`;
		return recordset;
	}

	/**
	* 流程因退回没有处理的流程列表
	*/
	async getRequestListBybereject(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  * ,
					orderNum = ( ROW_NUMBER() OVER ( ORDER BY ( SELECT  0
																							) ) )
		FROM    ( SELECT DISTINCT
										t1.requestid ,
										t1.requestname ,
										t2.userid ,
										( SELECT    departmentname
											FROM      hrmdepartment a
											WHERE     a.id = t4.departmentid
										) departmentname ,
										( SELECT    subcompanyname
											FROM      HrmSubCompany a
											WHERE     a.id = t4.subcompanyid1
										) subcompanyname ,
										t4.lastname ,
										CASE t4.status
											WHEN 0 THEN '试用'
											WHEN 1 THEN '正式'
											WHEN 2 THEN '临时'
											WHEN 3 THEN '试用延期'
											WHEN 4 THEN '解聘'
											WHEN 5 THEN '离职'
											WHEN 6 THEN '退休'
											WHEN 7 THEN '无效'
										END status
					FROM      workflow_requestbase t1 ,
										workflow_currentoperator t2 ,
										workflow_base t3 ,
										hrmresource t4
					WHERE     t1.requestid = t2.requestid
										AND t2.islasttimes = 1
										AND t1.workflowid = t3.id
										AND t2.userid = t4.id
										AND t2.isbereject = '1'
										AND ( ( t2.isremark = '0'
														AND ( t2.takisremark IS NULL
																	OR t2.takisremark = 0
																)
													)
													OR t2.isremark IN ( '1', '5', '8', '9', '7', '11' )
												)
				) tt
		ORDER BY requestid DESC
		`;
		return recordset;
	}

	/**
	* 流程状态分布
	*/
	async getStatusDistribute(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  workflowname ,
						( SELECT    typename
							FROM      workflow_type
							WHERE     id = workflowtype
						) typename ,
						( SELECT    COUNT(DISTINCT t1.requestid) num
							FROM      workflow_requestbase t1
							WHERE     ( t1.deleted = 0
													OR t1.deleted IS NULL
												)
												AND ( t1.currentstatus <> 1
															OR t1.currentstatus IS NULL
														)
												AND EXISTS ( SELECT requestid
																		FROM   ( SELECT    COUNT(requestid) num ,
																												requestid
																							FROM      workflow_currentoperator
																							GROUP BY  requestid
																						) t
																		WHERE  num = 1
																						AND requestid = t1.requestid )
												AND t.id = workflowid
						) num1 ,
						( SELECT    COUNT(DISTINCT t1.requestid) num
							FROM      workflow_requestbase t1 ,
												workflow_currentoperator t2
							WHERE     t1.requestid = t2.requestid
												AND t2.iscomplete = 0
												AND ( t1.deleted = 0
															OR t1.deleted IS NULL
														)
												AND ( t1.currentstatus <> 1
															OR t1.currentstatus IS NULL
														)
												AND t.id = t1.workflowid
						) num2 ,
						( SELECT    COUNT(DISTINCT t1.requestid) num
							FROM      workflow_requestbase t1 ,
												workflow_currentoperator t2
							WHERE     t1.requestid = t2.requestid
												AND t2.iscomplete = 1
												AND ( t1.deleted = 0
															OR t1.deleted IS NULL
														)
												AND ( t1.currentstatus <> 1
															OR t1.currentstatus IS NULL
														)
												AND t.id = t1.workflowid
						) num3 ,
						( SELECT    COUNT(DISTINCT t1.requestid) num
							FROM      workflow_requestbase t1 ,
												workflow_currentoperator t2
							WHERE     t1.requestid = t2.requestid
												AND ( t1.deleted = 0
															OR t1.deleted IS NULL
														)
												AND ( t1.currentstatus <> 1
															OR t1.currentstatus IS NULL
														)
												AND t.id = t1.workflowid
						) num ,
						CONVERT(DECIMAL(10, 2), ( SELECT    COUNT(DISTINCT t1.requestid) num
																			FROM      workflow_requestbase t1 ,
																								workflow_currentoperator t2
																			WHERE     t1.requestid = t2.requestid
																								AND t2.iscomplete = 1
																								AND ( t1.deleted = 0
																											OR t1.deleted IS NULL
																										)
																								AND ( t1.currentstatus <> 1
																											OR t1.currentstatus IS NULL
																										)
																								AND t.id = t1.workflowid
																		) * 100.00
						/ ( SELECT  CASE WHEN COUNT(DISTINCT t1.requestid) = 0 THEN -1
														ELSE COUNT(DISTINCT t1.requestid)
												END num
								FROM    workflow_requestbase t1 ,
												workflow_currentoperator t2
								WHERE   t1.requestid = t2.requestid
												AND ( t1.deleted = 0
															OR t1.deleted IS NULL
														)
												AND ( t1.currentstatus <> 1
															OR t1.currentstatus IS NULL
														)
												AND t.id = t1.workflowid
							)) rate
		FROM    workflow_base t
		WHERE   isvalid IN ( '1', '3' )
		`;
		return recordset;
	}

	/**
	* 归档率排名-大类
	*/
	async getArchivedRateWftypeRank(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  * ,
						rank = ( ROW_NUMBER() OVER ( ORDER BY ( SELECT  0
																									) ) )
		FROM    ( SELECT    typename ,
												CONVERT(DECIMAL(10, 2), ( SELECT    COUNT(DISTINCT t1.requestid) num
																									FROM      workflow_requestbase t1 ,
																														workflow_currentoperator t2 ,
																														workflow_base t3
																									WHERE     t1.requestid = t2.requestid
																														AND t3.id = t2.workflowid
																														AND t2.iscomplete = 1
																														AND ( t1.deleted = 0
																																	OR t1.deleted IS NULL
																																)
																														AND ( t1.currentstatus <> 1
																																	OR t1.currentstatus IS NULL
																																)
																														AND t.id = t3.workflowtype
																								) * 100.00
												/ ( SELECT  CASE WHEN COUNT(DISTINCT t1.requestid) = 0
																				THEN -1
																				ELSE COUNT(DISTINCT t1.requestid)
																		END num
														FROM    workflow_requestbase t1 ,
																		workflow_currentoperator t2 ,
																		workflow_base t3
														WHERE   t1.requestid = t2.requestid
																		AND t3.id = t2.workflowid
																		AND ( t1.deleted = 0
																					OR t1.deleted IS NULL
																				)
																		AND ( t1.currentstatus <> 1
																					OR t1.currentstatus IS NULL
																				)
																		AND t.id = t3.workflowtype
													)) rate
							FROM      workflow_type t
						) tt
		ORDER BY rate DESC
		`;
		return recordset;
	}

	/**
	* 归档时长排名-大类
	*/
	async getArchivedTimeWftypeRank(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  * ,
					rank = ( ROW_NUMBER() OVER ( ORDER BY ( SELECT  0
																								) ) )
		FROM    ( SELECT    typename ,
											CONVERT(DECIMAL(10, 2), ( SELECT    SUM(tt.time) totalTIme
																								FROM      ( SELECT DISTINCT
																																c.requestid ,
																																c.workflowid ,
																																DATEDIFF(dd,
																																createdate + ' '
																																+ createtime,
																																receivedate
																																+ ' '
																																+ receivetime) time
																														FROM
																																workflow_currentoperator a ,
																																workflow_flownode b ,
																																workflow_requestbase c ,
																																workflow_base d
																														WHERE
																																a.nodeid = b.nodeid
																																AND a.requestid = c.requestid
																																AND b.nodetype = 3
																																AND c.workflowid = d.id
																																AND d.workflowtype = t.id
																													) tt
																							)
											/ CAST (( SELECT    COUNT(DISTINCT c.requestid)
																FROM      workflow_currentoperator a ,
																					workflow_flownode b ,
																					workflow_requestbase c ,
																					workflow_base d
																WHERE     a.nodeid = b.nodeid
																					AND a.requestid = c.requestid
																					AND b.nodetype = 3
																					AND c.workflowid = d.id
																					AND d.workflowtype = t.id
															) AS DECIMAL(18, 2))) avgTime
						FROM      workflow_type t
					) tt
		ORDER BY avgTime DESC
		`;
		return recordset;
	}

	/**
	* 归档率排名-小类
	*/
	async getArchivedRateWfidRank(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  * ,
		rank = ( ROW_NUMBER() OVER ( ORDER BY ( SELECT  0
																					) ) )
		FROM    ( SELECT    workflowname ,
					(SELECT typename FROM workflow_type WHERE t.workflowtype = id  ) typename,
										CONVERT(DECIMAL(10, 2), ( SELECT    COUNT(DISTINCT t1.requestid) num
																							FROM      workflow_requestbase t1 ,
																												workflow_currentoperator t2
																							WHERE     t1.requestid = t2.requestid
																												AND t2.iscomplete = 1
																												AND ( t1.deleted = 0
																															OR t1.deleted IS NULL
																														)
																												AND ( t1.currentstatus <> 1
																															OR t1.currentstatus IS NULL
																														)
																												AND t.id = t1.workflowid
																						) * 100.00
										/ ( SELECT  CASE WHEN COUNT(DISTINCT t1.requestid) = 0
																		THEN -1
																		ELSE COUNT(DISTINCT t1.requestid)
																END num
												FROM    workflow_requestbase t1 ,
																workflow_currentoperator t2
												WHERE   t1.requestid = t2.requestid
																AND ( t1.deleted = 0
																			OR t1.deleted IS NULL
																		)
																AND ( t1.currentstatus <> 1
																			OR t1.currentstatus IS NULL
																		)
																AND t.id = t1.workflowid
											)) rate
					FROM      workflow_base t
				) tt
		ORDER BY rate DESC
		`;
		return recordset;
	}

	/**
	* 归档时长排名-小类
	*/
	async getArchivedTimeWfidRank(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  * ,
				rank = ( ROW_NUMBER() OVER ( ORDER BY ( SELECT  0
																							) ) )
		FROM    ( SELECT    workflowname ,
										CONVERT(DECIMAL(10, 2), ( SELECT    SUM(tt.time) totalTIme
																							FROM      ( SELECT DISTINCT
																															c.requestid ,
																															c.workflowid ,
																															DATEDIFF(dd,
																															createdate + ' '
																															+ createtime,
																															receivedate
																															+ ' '
																															+ receivetime) time
																													FROM
																															workflow_currentoperator a ,
																															workflow_flownode b ,
																															workflow_requestbase c
																													WHERE
																															a.nodeid = b.nodeid
																															AND a.requestid = c.requestid
																															AND b.nodetype = 3
																															AND c.workflowid = t.id
																												) tt
																						)
										/ CAST (( SELECT    COUNT(DISTINCT c.requestid)
															FROM      workflow_currentoperator a ,
																				workflow_flownode b ,
																				workflow_requestbase c
															WHERE     a.nodeid = b.nodeid
																				AND a.requestid = c.requestid
																				AND b.nodetype = 3
																				AND c.workflowid = t.id
														) AS DECIMAL(18, 2))) avgTime
					FROM      workflow_base t
				) tt
		ORDER BY avgTime DESC
		`;
		return recordset;
	}

	/**
	* 用时最短归档流程排名
	*/
	async getArchivedTimeAscRank(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT * ,
				( SELECT    lastname
					FROM      HrmResource a
					WHERE     a.id = t.creater
				) lastname ,
				( SELECT    workflowname
					FROM      workflow_base t1
					WHERE     t1.id = t.workflowid
				) workflowname ,
				( SELECT    t2.typename
					FROM      workflow_base t1 ,
										dbo.workflow_type t2
					WHERE     t1.id = t.workflowid
										AND t1.workflowtype = t2.id
				) typename ,
				CONVERT(DECIMAL(18, 2), ( SELECT    SUM(tt.time) totalTIme
																	FROM      ( SELECT DISTINCT
																												c.requestid ,
																												c.workflowid ,
																												DATEDIFF(dd,
																															createdate + ' '
																															+ createtime,
																															receivedate
																															+ ' '
																															+ receivetime) time
																							FROM      workflow_currentoperator a ,
																												workflow_flownode b ,
																												workflow_requestbase c
																							WHERE     a.nodeid = b.nodeid
																												AND a.requestid = c.requestid
																												AND b.nodetype = 3
																												AND t.workflowid = c.workflowid
																						) tt
																)
				/ CAST(( SELECT COUNT(DISTINCT c.requestid)
									FROM   workflow_currentoperator a ,
												workflow_flownode b ,
												workflow_requestbase c
									WHERE  a.nodeid = b.nodeid
												AND a.requestid = c.requestid
												AND b.nodetype = 3
												AND t.workflowid = c.workflowid
								) AS DECIMAL(18, 2))) avgTime
		FROM   ( SELECT DISTINCT TOP 10
										c.requestid ,
										c.creater ,
										c.workflowid ,
										c.requestname ,
										c.createdate ,
										a.receivedate ,
										DATEDIFF(dd, createdate + ' ' + createtime,
															receivedate + ' ' + receivetime) time
					FROM      workflow_currentoperator a ,
										workflow_flownode b ,
										workflow_requestbase c
					WHERE     a.nodeid = b.nodeid
										AND a.requestid = c.requestid
										AND b.nodetype = 3
					ORDER BY  time asc
				) t
		`;
		return recordset;
	}

	/**
	* 用于最长归档流程排名
	*/
	async getArchivedTimeDescRank(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT * ,
				( SELECT    lastname
					FROM      HrmResource a
					WHERE     a.id = t.creater
				) lastname ,
				( SELECT    workflowname
					FROM      workflow_base t1
					WHERE     t1.id = t.workflowid
				) workflowname ,
				( SELECT    t2.typename
					FROM      workflow_base t1 ,
										dbo.workflow_type t2
					WHERE     t1.id = t.workflowid
										AND t1.workflowtype = t2.id
				) typename ,
				CONVERT(DECIMAL(18, 2), ( SELECT    SUM(tt.time) totalTIme
																	FROM      ( SELECT DISTINCT
																												c.requestid ,
																												c.workflowid ,
																												DATEDIFF(dd,
																															createdate + ' '
																															+ createtime,
																															receivedate
																															+ ' '
																															+ receivetime) time
																							FROM      workflow_currentoperator a ,
																												workflow_flownode b ,
																												workflow_requestbase c
																							WHERE     a.nodeid = b.nodeid
																												AND a.requestid = c.requestid
																												AND b.nodetype = 3
																												AND t.workflowid = c.workflowid
																						) tt
																)
				/ CAST(( SELECT COUNT(DISTINCT c.requestid)
								FROM   workflow_currentoperator a ,
												workflow_flownode b ,
												workflow_requestbase c
								WHERE  a.nodeid = b.nodeid
												AND a.requestid = c.requestid
												AND b.nodetype = 3
												AND t.workflowid = c.workflowid
							) AS DECIMAL(18, 2))) avgTime
		FROM   ( SELECT DISTINCT TOP 10
										c.requestid ,
										c.creater ,
										c.workflowid ,
										c.requestname ,
										c.createdate ,
										a.receivedate ,
										DATEDIFF(dd, createdate + ' ' + createtime,
														receivedate + ' ' + receivetime) time
					FROM      workflow_currentoperator a ,
										workflow_flownode b ,
										workflow_requestbase c
					WHERE     a.nodeid = b.nodeid
										AND a.requestid = c.requestid
										AND b.nodetype = 3
					ORDER BY  time DESC
				) t
		`;
		return recordset;
	}

	/**
	* 流程利用率排名-大类
	*/
	async getUseRatioRankOfWftype(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  * ,
				rank = ( ROW_NUMBER() OVER ( ORDER BY ( SELECT  0
																							) ) ) ,
				CONVERT(DECIMAL(10, 2), num * 100.00
				/ ( SELECT  CASE WHEN COUNT(DISTINCT t1.requestid) = 0 THEN -1
												ELSE COUNT(DISTINCT t1.requestid)
										END num
						FROM    workflow_requestbase t1 ,
										workflow_base t2
						WHERE   t2.id = t1.workflowid
										AND ( t1.deleted = 0
													OR t1.deleted IS NULL
												)
										AND ( t1.currentstatus <> 1
													OR t1.currentstatus IS NULL
												)
					)) rate
		FROM    ( SELECT    typename ,
										( SELECT    COUNT(DISTINCT t1.requestid) num
											FROM      workflow_requestbase t1 ,
																workflow_base t2
											WHERE     t2.id = t1.workflowid
																AND ( t1.deleted = 0
																			OR t1.deleted IS NULL
																		)
																AND ( t1.currentstatus <> 1
																			OR t1.currentstatus IS NULL
																		)
																AND t.id = t2.workflowtype
										) num
					FROM      workflow_type t
				) tt
		ORDER BY num DESC
		`;
		return recordset;
	}

	/**
	* 流程利用率排名-小类
	*/
	async getUseRatioRankOfWfid(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  * ,
				rank = ( ROW_NUMBER() OVER ( ORDER BY ( SELECT  0
																							) ) ) ,
				CONVERT(DECIMAL(10, 2), num * 100.00
				/ ( SELECT  CASE WHEN COUNT(DISTINCT t1.requestid) = 0 THEN -1
												ELSE COUNT(DISTINCT t1.requestid)
										END num
						FROM    workflow_requestbase t1 ,
										workflow_base t2
						WHERE   t2.id = t1.workflowid
										AND ( t1.deleted = 0
													OR t1.deleted IS NULL
												)
										AND ( t1.currentstatus <> 1
													OR t1.currentstatus IS NULL
												)
					)) rate
		FROM    ( SELECT    workflowname ,
										( SELECT    typename
											FROM      workflow_type
											WHERE     t.workflowtype = id
										) typename ,
										( SELECT    COUNT(DISTINCT t1.requestid) num
											FROM      workflow_requestbase t1
											WHERE     ( t1.deleted = 0
																	OR t1.deleted IS NULL
																)
																AND ( t1.currentstatus <> 1
																			OR t1.currentstatus IS NULL
																		)
																AND t.id = t1.workflowid
										) num
					FROM      workflow_base t
					WHERE     isvalid IN ( '1', '3' )
				) tt
		ORDER BY num DESC
		`;
		return recordset;
	}

	/**
	* 处理过长仍未归档请求
	*/
	async getUnArchivedListOftooLongTime(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  tt.* ,
				tt2.requestname ,
				tt2.createdate ,
				( SELECT    lastname
					FROM      HrmResource
					WHERE     tt2.creater = id
				) lastname ,
				( SELECT    workflowname
					FROM      workflow_base a
					WHERE     tt2.workflowid = id
				) workflowname ,
				( SELECT    b.typename
					FROM      workflow_base a ,
										workflow_type b
					WHERE     a.workflowtype = b.id
										AND tt2.workflowid = a.id
				) typename
		FROM    ( SELECT DISTINCT TOP 10
										t1.requestid ,
										DATEDIFF(dd, createdate + ' ' + createtime,
														CASE WHEN ISDATE(lastoperatedate) = 0
																	THEN createdate
																	ELSE lastoperatedate
														END + ' '
														+ CASE WHEN lastoperatetime = ''
																				OR lastoperatetime IS NULL
																		THEN createtime
																		ELSE lastoperatetime
															END) time
					FROM      workflow_requestbase t1 ,
										workflow_currentoperator t2
					WHERE     t1.requestid = t2.requestid
										AND t2.iscomplete = 0
										AND ( t1.deleted = 0
													OR t1.deleted IS NULL
												)
										AND ( t1.currentstatus <> 1
													OR t1.currentstatus IS NULL
												)
					ORDER BY  time DESC
				) tt
				LEFT JOIN workflow_requestbase tt2 ON tt.requestid = tt2.requestid
		`;
		return recordset;
	}

	/**
	* 提交流程的前十位排名
	*/
	async getSubmitRank(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  tt.* ,
				tt2.lastname ,
				( SELECT    departmentname
					FROM      hrmdepartment a
					WHERE     a.id = tt2.departmentid
				) departmentname ,
				( SELECT    subcompanyname
					FROM      HrmSubCompany a
					WHERE     a.id = tt2.subcompanyid1
				) subcompanyname ,
				CASE tt2.status
					WHEN 0 THEN '试用'
					WHEN 1 THEN '正式'
					WHEN 2 THEN '临时'
					WHEN 3 THEN '试用延期'
					WHEN 4 THEN '解聘'
					WHEN 5 THEN '离职'
					WHEN 6 THEN '退休'
					WHEN 7 THEN '无效'
				END status ,
				orderNum = ( ROW_NUMBER() OVER ( ORDER BY ( SELECT  0
																									) ) )
		FROM    ( SELECT TOP 10
										COUNT(t1.requestid) num ,
										t2.userid
					FROM      workflow_requestbase t1 ,
										workflow_currentoperator t2 ,
										workflow_base t3
					WHERE     t1.requestid = t2.requestid
										AND ( t2.isremark = 2
													OR ( t2.isremark = '0'
															AND takisremark = -2
														)
												)
										AND t2.iscomplete = 0
										AND t2.islasttimes = 1
										AND t2.usertype = 0
										AND t2.userid != 1
										AND ( t1.deleted = 0
													OR t1.deleted IS NULL
												)
										AND t3.id = t2.workflowid
										AND ( t3.isvalid = '1'
													OR t3.isvalid = '3'
												)
										AND ( t1.currentstatus <> 1
													OR t1.currentstatus IS NULL
												)
					GROUP BY  t2.userid
					ORDER BY  num DESC
				) tt
				LEFT JOIN HrmResource tt2 ON tt.userid = tt2.id
		`;
		return recordset;
	}

	/**
	* 请求未处理的排名
	*/
	async getUntreatedRank(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  tt.* ,
				tt2.lastname ,
				( SELECT    departmentname
					FROM      hrmdepartment a
					WHERE     a.id = tt2.departmentid
				) departmentname ,
				( SELECT    subcompanyname
					FROM      HrmSubCompany a
					WHERE     a.id = tt2.subcompanyid1
				) subcompanyname ,
				CASE tt2.status
					WHEN 0 THEN '试用'
					WHEN 1 THEN '正式'
					WHEN 2 THEN '临时'
					WHEN 3 THEN '试用延期'
					WHEN 4 THEN '解聘'
					WHEN 5 THEN '离职'
					WHEN 6 THEN '退休'
					WHEN 7 THEN '无效'
				END status ,
				orderNum = ( ROW_NUMBER() OVER ( ORDER BY ( SELECT  0
																									) ) )
		FROM    ( SELECT TOP 10
										COUNT(t1.requestid) num ,
										t2.userid
					FROM      workflow_requestbase t1 ,
										workflow_currentoperator t2 ,
										workflow_base t3
					WHERE     t1.requestid = t2.requestid
										AND ( ( t2.isremark = '0'
														AND ( takisremark IS NULL
																	OR takisremark = 0
																)
													)
													OR t2.isremark = '1'
													OR t2.isremark = '5'
													OR t2.isremark = '8'
													OR t2.isremark = '9'
													OR t2.isremark = '7'
													OR t2.isremark = '11'
												)
										AND t2.islasttimes = 1
										AND t2.usertype = 0
										AND t2.userid != 1
										AND ( t1.deleted = 0
													OR t1.deleted IS NULL
												)
										AND t3.id = t2.workflowid
										AND ( t3.isvalid = '1'
													OR t3.isvalid = '3'
												)
										AND ( t1.currentstatus <> 1
													OR t1.currentstatus IS NULL
												)
					GROUP BY  t2.userid
					ORDER BY  num DESC
				) tt
				LEFT JOIN HrmResource tt2 ON tt.userid = tt2.id
		`;
		return recordset;
	}

	/**
	* 处理人最多的请求排名
	*/
	async getTreatUserRank(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  tt.* ,
				tt2.requestname ,
				( SELECT    nodename
					FROM      workflow_nodebase
					WHERE     tt2.currentnodeid = id
				) nodename ,
				orderNum = ( ROW_NUMBER() OVER ( ORDER BY ( SELECT  0
																									) ) )
		FROM    ( SELECT TOP 10
										COUNT(DISTINCT t2.userid) num ,
										t1.requestid
					FROM      workflow_requestbase t1 ,
										workflow_currentoperator t2 ,
										workflow_base t3
					WHERE     t1.requestid = t2.requestid
										AND t3.id = t2.workflowid
										AND ( t1.deleted = 0
													OR t1.deleted IS NULL
												)
										AND ( t3.isvalid = '1'
													OR t3.isvalid = '3'
												)
										AND ( t1.currentstatus <> 1
													OR t1.currentstatus IS NULL
												)
					GROUP BY  t1.requestid
					ORDER BY  num DESC
				) tt ,
				workflow_requestbase tt2
		WHERE   tt.requestid = tt2.requestid 
		`;
		return recordset;
	}

	/**
	* TODO: 流程有效节点数量统计
	*/
	async getValidNodesRank(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		
		`;
		return recordset;
	}

	/**
	* 有效流程代理统计数量表
	*/
	async getAgentUserRank(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  tt.* ,
						tt2.lastname ,
						( SELECT    departmentname
							FROM      hrmdepartment a
							WHERE     a.id = tt2.departmentid
						) departmentname ,
						( SELECT    subcompanyname
							FROM      HrmSubCompany a
							WHERE     a.id = tt2.subcompanyid1
						) subcompanyname ,
						orderNum = ( ROW_NUMBER() OVER ( ORDER BY ( SELECT  0
																											) ) )
		FROM    ( SELECT TOP 10
												t2.userid ,
												COUNT(t2.userid) num
							FROM      workflow_requestbase t1 ,
												workflow_currentoperator t2 ,
												workflow_base t3
							WHERE     t2.requestid = t1.requestid
												AND t3.id = t1.workflowid
												AND t2.agenttype = '2'
												AND t2.islasttimes = '1'
												AND t2.userid != 1
							GROUP BY  t2.userid
							ORDER BY  num DESC
						) tt
						LEFT JOIN HrmResource tt2 ON tt.userid = tt2.id
		`;
		return recordset;
	}

	/**
	* 流程短语使用情况表
	*/
	async getPhraseShortUseRank(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  a.phraseShort ,
				CASE WHEN ( a.groupid = '2'
										AND b.frequency IS NULL
									) THEN 0
						WHEN ( a.groupid = '2' ) THEN b.frequency
						ELSE a.frequency
				END AS frequency ,
				orderNum = ( ROW_NUMBER() OVER ( ORDER BY ( SELECT  0
																									) ) )
		FROM    sysPhrase a
				LEFT JOIN PublicPhraseStatus b ON a.id = b.id
		WHERE   ( ( a.status = '1'
						AND a.groupid = '1'
					)
					OR ( a.groupid = '2'
							AND ( b.status IS NULL
										OR b.status = '1'
									)
						)
				)
		ORDER BY frequency DESC ,
				a.dsporder ,
				a.id
		`;
		return recordset;
	}

	/**
	* 流程版本情况表
	*/
	async getVersionMsg(): Promise<any[]> {
		await this.baseService.connect();
		const { recordset } = await sql.query`
		SELECT  typename,workflowname,version
		FROM    ( SELECT    t.* ,
												RANK() OVER ( PARTITION BY t.activeVersionID ORDER BY t.id DESC ) AS drank
							FROM      ( SELECT    CASE WHEN version IS NULL THEN 1
																				ELSE version
																		END version ,
																		CASE WHEN activeVersionID IS NULL THEN id
																				ELSE activeVersionID
																		END activeVersionID ,
																		( SELECT    typename
																			FROM      workflow_type
																			WHERE     workflowtype = id
																		) typename ,
																		id ,
																		workflowname
													FROM      workflow_base
													WHERE     isvalid IN ( '1', '3' )
												) t
						) a
		WHERE   drank = 1
		`;
		return recordset;
	}
}