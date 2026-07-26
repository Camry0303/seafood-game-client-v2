import { Config } from "../Types/typing";

// API签名密钥
const API_KEY = "Us9wppPKKZH77R2UWSzM0J2EGboO4VTcx";

// 加密密码密钥
const PASSWORD_KEY = "s9wppPKKZH77R2UW";

// 服务器配置地址
const SERVER_CONFIG_URL = "http://json.cj33.cn:8088/seafood-xbxj-config.json";

// 是否显示热更新进度
const SHOW_HOTUPDATE_PROCESS = true;

// 游戏限制分选项
const SCORE_LIMIT_OPTIONS: Config.ComboBoxOption[] = [
  {
    id: 0,
    label: "1千~连400~豹200",
    value: "1000,400,200",
  },
  {
    id: 1,
    label: "3千~连1200~豹600",
    value: "3000,1200,600",
  },
  {
    id: 2,
    label: "5千~连2千~豹1千",
    value: "5000,2000,1000",
  },
  {
    id: 3,
    label: "1万~连4千~豹2千",
    value: "10000,4000,2000",
  },
  {
    id: 4,
    label: "2万~连8千~豹4千",
    value: "20000,8000,4000",
  },
  {
    id: 5,
    label: "3万~连1.2万~豹6千",
    value: "30000,12000,6000",
  },
  {
    id: 6,
    label: "5万~连2万~豹1万",
    value: "50000,20000,10000",
  },
  {
    id: 7,
    label: "10万~连4万~豹2万",
    value: "100000,40000,20000",
  },
  {
    id: 8,
    label: "30万~连12万~豹6万",
    value: "300000,120000,60000",
  },
  {
    id: 9,
    label: "50万~连20万~豹10万",
    value: "500000,200000,100000",
  },
];

// 上下分类型选项
const SCORE_TYPE_OPTIONS: Config.ComboBoxOption[] = [
  {
    id: -1,
    label: "全部",
    value: -1,
  },
  {
    id: 0,
    label: "上分",
    value: 1,
  },
  {
    id: 1,
    label: "下分",
    value: 0,
  },
];

export default {
  API_KEY,
  PASSWORD_KEY,
  SERVER_CONFIG_URL,
  SHOW_HOTUPDATE_PROCESS,
  SCORE_LIMIT_OPTIONS,
  SCORE_TYPE_OPTIONS,
};
