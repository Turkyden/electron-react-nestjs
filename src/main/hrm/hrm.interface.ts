export interface HrmResult<T> {
  status: number;
  msg: string;
  datas: Array<T>;
}

export interface HrmBase {
  name: string;
  sum: number;
}

export interface HrmStatus {
  name: string;
  sum: number;
  rate: number;
}

export interface HrmSex {
  name: string;
  sum: number;
  rate: number;
}

export interface HrmAge {
  man: number;
  woman: number;
  total: number;
  name: string;
  rate: number
  manRate: number;
  womanRate: number;
}

export interface HrmAntryAge {
  name: string;
  num: number;
  scale: number;
}