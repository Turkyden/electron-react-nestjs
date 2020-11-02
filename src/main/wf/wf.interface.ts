export interface WfResult<T> {
  status: number;
  msg: string;
  datas: Array<T>;
}

export interface WfBase {
  name: string;
  num: string;
  unit: string;
}

