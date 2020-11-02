export interface DBConfig {
  user: string;
  password: string;
  server: string;
  database: string;
  port: number;
  startdate: string;
}

export interface BaseInfo {
  hrmcount: number;
  companyname: string;
  license: string;
  startdate: string;
  workdays: number;
  cdate: string;
}

export interface ConnectResult {
  status: number;
  msg: string;
  BaseInfo: ConnectBaseInfo;
}

export interface ConnectBaseInfo {
  hrmcount: number;
  companyname: string;
  license: string;
  startdate: string;
  workdays: number;
  cdate: string;
}

export interface ModuleUsageResult {
  status: number;
  msg: string;
  datas: ModuleUsage[];
}

export interface ModuleUsage {
  name: string;
  sum: number;
  avg: number;
}