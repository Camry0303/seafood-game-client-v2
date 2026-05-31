import { _decorator, Event, native, sys } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { SoundsManager } from "../../../Runtime/SoundsManager";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { DialogSettingUI_Component } from "../Dialog/DialogSettingUI_Component";
import NativeAPI from "../../../Utils/NativeAPI";
import LocationService from "../../../Utils/LocationService";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import WebClipboard from "../../../Utils/WebClipboard";
import _ from "lodash";
import { WAITING_TYPE } from "../Common/CircleLoadingUI_Component";
import { PlazaMainUI_Component } from "../Plaza/PlazaMainUI_Component";
import { ClubMainUI_Component } from "../Club/ClubMainUI_Component";
import HttpApiServices from "../../../Utils/HttpApiServices";
import moment from "moment";
import CryptoUtils from "../../../Utils/CryptoUtils";
import { MemberScoreLogListUI_Component } from "../Club/MemberScoreLogListUI_Component";

const { ccclass, menu } = _decorator;

@ccclass("MainUI_Component")
@menu("Hidden/MainUI_Component")
export class MainUI_Component extends ComponentController {
  start() {
    if (sys.isNative) {
      SoundsManager.Instance.playMusic("bgm_00");
    } else {
      this.scheduleOnce(() => {
        SoundsManager.Instance.playMusic("bgm_00");
      }, 1);
    }
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    this.setButtonClickEvent(
      "TestButtonContainer/TestButton",
      0,
      "onTestBtnClick",
      this.getClassName(),
    );

    this.setButtonClickEvent(
      "TestButtonContainer/TestButton",
      0,
      "onTestBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 测试按钮点击事件
   */
  private async onTestBtnClick(event: Event) {
    console.log(`onTestBtnClick`);
    this.testMemberScoreLogList();
    // this.testDialogConfirm();
    // this.testCSWRequest();
    // this.testCSWSaveAccount();
    // this.testDialogMessage();
    // this.testPlazaMainUI();
    // this.testMiniKeyboard();
    // this.testDialogInput();
  }

  /**
   * 测试请求已知的最后定位信息
   */
  private async testGetLatestLocation() {
    const location = await LocationService.getLatestLocation();
    console.log(`testGetLatestLocation--->`, location);
    if (location) {
      CommonDailogHandler.showDialogMessage(
        `纬度:${location.latitude},经度:${location.longitude}`,
      );
    }
  }

  private clickTime = 0;
  /**
   * 测试获取电量
   */
  private testGetBatteryInfo() {
    const isAndroid = sys.isNative && sys.os === sys.OS.ANDROID;
    const isIOS = sys.isNative && sys.os === sys.OS.IOS;
    if (isAndroid) {
      NativeAPI.getBatteryInfoAndroid();
      if (this.clickTime % 2 === 0) {
        NativeAPI.startBatteryMonitoringAndroid();
      } else {
        NativeAPI.stopBatteryMonitoringAndroid();
      }
    } else if (isIOS) {
      NativeAPI.getBatteryInfoIOS();
      if (this.clickTime % 2 === 0) {
        NativeAPI.startBatteryMonitoringIOS();
      } else {
        NativeAPI.stopBatteryMonitoringIOS();
      }
    } else {
      console.log("当前平台不支持获取电量");
    }
    this.clickTime++;
  }

  /**
   * 测试小键盘
   */
  private testMiniKeyboard() {
    CommonDailogHandler.showDialogMiniKeyboard(
      "InvitePlayerToggle",
      6,
      (value: string) => {
        console.log("玩家ID--->", value);
      },
    );
  }

  /**
   * 测试显示加载动画
   */
  private testCircleLoading() {
    CommonDailogHandler.showCircleLoading(WAITING_TYPE.LOADING, () => {});
  }

  /**
   * 测试显示加载动画
   */
  private testBubbleMessage() {
    CommonDailogHandler.showBubbleMessage(WAITING_TYPE.LOGIN, () => {});
  }

  /**
   * 测试弹窗消息
   */
  private testDialogMessage() {
    CommonDailogHandler.showDialogMessage("微信登陆逻辑", () => {});
  }

  /**
   * 测试弹窗输入
   */
  private testDialogInput() {
    CommonDailogHandler.showDialogInput(
      "CreateClubToggle",
      {
        isRequired: true,
        maxLength: 8,
        placeholder: "输入俱乐部名称",
        height: 60,
        defaultValue: "",
        showLimitInfo: true,
      },
      (inputValue: string) => {
        console.log(`确认回调--->`, inputValue);
      },
    );
  }

  /**
   * 测试弹窗消息带按钮回调
   */
  private testDialogMsgCallback() {
    CommonDailogHandler.showDialogMsgCallback(
      {
        tips: "复制以下内容到微信",
        message: "https://www.baidu.com",
        confirmText: "复制",
      },
      async (message: string) => {
        if (sys.isNative) {
          native.copyTextToClipboard(message);
        } else {
          await WebClipboard.copyTextToClipboard(message);
        }
        CommonDailogHandler.showBubbleMessage("复制成功！");
      },
    );
  }

  /**
   * 测试打开上下分记录界面
   */
  private testMemberScoreLogList() {
    ComponentManager.Instance.renderUiNode<MemberScoreLogListUI_Component>(
      "MemberScoreLogListUI",
      "Prefabs",
      "Club/MemberScoreLogListUI",
      MemberScoreLogListUI_Component,
    );
  }

  /**
   * 测试询问确认弹窗
   */
  private testDialogConfirm() {
    CommonDailogHandler.showSmallDialogConfirm(
      "确定吗？",
      () => {
        console.log("确定");
      },
      () => {
        console.log("取消");
      },
    );
  }

  /**
   * 测试设置界面
   */
  private testDialogSetting() {
    const [settingUiNode, settingUiComponent] =
      ComponentManager.Instance.renderUiNode<DialogSettingUI_Component>(
        "DialogSettingUI",
        "Prefabs",
        "Dialog/DialogSettingUI",
        DialogSettingUI_Component,
      );
    console.log("挂载设置界面成功！");
  }

  /**
   * 测试大厅主界面
   */
  private testPlazaMainUI() {
    ComponentManager.Instance.renderUiNode<PlazaMainUI_Component>(
      "PlazaMainUI",
      "Prefabs",
      "Plaza/PlazaMainUI",
      PlazaMainUI_Component,
    );
  }

  /**
   * 测试俱乐部主界面
   */
  private testClubMainUI() {
    ComponentManager.Instance.renderUiNode<ClubMainUI_Component>(
      "ClubMainUI",
      "Prefabs",
      "Club/ClubMainUI",
      ClubMainUI_Component,
    );
  }

  /**
   * 测试请求传送注册接口
   */
  private async testCSWRequest() {
    // 测试
    const params = {
      nickname: "AK47",
      password: "123456789a123456789b",
      avatar:
        "https://avatar-1259520887.cos.ap-guangzhou.myqcloud.com/dev/avatar/20260510142752354111.png",
      d: true,
    };
    const data = await HttpApiServices.testCSWRequest(params);
    console.log(`testCSWRequest response data--->`, data);

    for (let index = 0; index < 9; index++) {
      const nickname = `空菌No.${index + 1}`;
      const password = CryptoUtils.generateRandomPassword();
      const avatar = `https://avatar-1259520887.cos.ap-guangzhou.myqcloud.com/dev/avatar/${moment().format("YYYYMMDDHHmmss") + CryptoUtils.genRandomIntegerBetween(10000000, 99999999)}.png`;
      // 测试
      const params = {
        nickname,
        password,
        avatar,
        d: false,
      };
      const data = await HttpApiServices.testCSWRequest(params);
      console.log(`【${index + 1}】testCSWRequest response data --->`, data);
      await this.testCSWSaveAccount({
        id: data.data.user.id,
        nickname,
        password,
        token: data.data.user.token,
        is_tool: 1, // 工具账号
        time: moment().unix(),
      });
    }
  }

  /**
   * 测试保存账号接口
   */
  private async testCSWSaveAccount(params: {
    id: number;
    nickname: string;
    password: string;
    token: string;
    is_tool: number;
    time: number;
  }) {
    const data = await HttpApiServices.testSaveAccount(params);
    console.log(`testCSWSaveAccount response data --->`, data);
  }
}
