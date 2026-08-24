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
import { WAITING_TYPE, CircleLoadingUI_Component } from "../Common/CircleLoadingUI_Component";
import { PlazaMainUI_Component } from "../Plaza/PlazaMainUI_Component";
import { ClubMainUI_Component } from "../Club/ClubMainUI_Component";
import HttpApiServices from "../../../Utils/HttpApiServices";
import moment from "moment";
import CryptoUtils from "../../../Utils/CryptoUtils";
import { MemberScoreLogListUI_Component } from "../Club/MemberScoreLogListUI_Component";
import { DicesGameMainUI_Component } from "../DicesGame/DicesGameMainUI_Component";
import { DicesGameRecordUI_Component } from "../Common/DicesGameRecordUI_Component";

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
    // this.testDiceGameMain();
    // this.testDicesGameRecordUI();
    // this.testMemberScoreLogList();
    this.testCircleLoadingFlashRepro();
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
   * 测试 CircleLoadingUI 的 silent 模式（仅 _silentWaitings 记账，不影响蒙版显隐）
   * 点击 TestButton 触发，结果通过 console 输出，可在浏览器/编辑器控制台观察。
   */
  private testCircleLoadingSilent() {
    // 取/复用 CircleLoadingUI 实例，用于读取队列长度与节点可见性
    const [, uiComponent] =
      ComponentManager.Instance.renderUiNode<CircleLoadingUI_Component>(
        "CircleLoadingUI",
        "Prefabs",
        "Common/CircleLoadingUI",
        CircleLoadingUI_Component,
      );
    const log = (tag: string, pass: boolean, extra?: string) => {
      console.log(`[CircleLoadingSilent][${tag}]`, pass ? "PASS" : "FAIL", extra ?? "");
    };

    // 1) 对照组：非 silent 的 LOADING 应使节点 active，且计入真实队列
    CommonDailogHandler.showCircleLoading(WAITING_TYPE.LOADING, () => {});
    const ctrlActive = uiComponent.node.active;
    const ctrlRealCount = uiComponent.getWaitingCount();
    const ctrlSilentCount = uiComponent.getWaitingCount(true);
    log("non-silent-active", ctrlActive === true, `active=${ctrlActive}`);
    log("non-silent-real-count", ctrlRealCount === 1, `realCount=${ctrlRealCount}`);
    log("non-silent-total-count", ctrlSilentCount === 1, `totalCount=${ctrlSilentCount}`);
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.LOADING);

    // 2) silent 的 CREATE_ORDER：应入 silent 集合，但不显蒙版、不进真实队列
    CommonDailogHandler.showCircleLoading(
      WAITING_TYPE.CREATE_ORDER,
      undefined,
      { silent: true },
    );
    const silentActive = uiComponent.node.active;
    const silentRealCount = uiComponent.getWaitingCount();
    const silentTotalCount = uiComponent.getWaitingCount(true);
    log("silent-not-active", silentActive === false, `active=${silentActive}`);
    log("silent-not-in-real", silentRealCount === 0, `realCount=${silentRealCount}`);
    log("silent-in-total", silentTotalCount === 1, `totalCount=${silentTotalCount}`);

    // 3) silent 出队后 silent 集合清空，且节点保持隐藏、真实队列仍空
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CREATE_ORDER);
    const afterHideTotal = uiComponent.getWaitingCount(true);
    const afterHideActive = uiComponent.node.active;
    log("silent-hide-total", afterHideTotal === 0, `totalCount=${afterHideTotal}`);
    log("silent-hide-active", afterHideActive === false, `active=${afterHideActive}`);

    // 4) silent 与真实 loading 共存：真实 loading 决定蒙版显隐，silent 不干扰
    CommonDailogHandler.showCircleLoading(WAITING_TYPE.LOADING, () => {});
    CommonDailogHandler.showCircleLoading(WAITING_TYPE.CREATE_ORDER, undefined, { silent: true });
    const coActive = uiComponent.node.active;
    const coReal = uiComponent.getWaitingCount();
    const coTotal = uiComponent.getWaitingCount(true);
    log("coexist-active", coActive === true, `active=${coActive}`);
    log("coexist-real", coReal === 1, `realCount=${coReal}`);
    log("coexist-total", coTotal === 2, `totalCount=${coTotal}`);
    // 先 hide silent（不应关蒙版）
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CREATE_ORDER);
    const coAfterSilentHideActive = uiComponent.node.active;
    log("coexist-silent-hide-keep-active", coAfterSilentHideActive === true, `active=${coAfterSilentHideActive}`);
    // 再 hide 真实 loading（应关蒙版）
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.LOADING);
    const coAfterRealHideActive = uiComponent.node.active;
    log("coexist-real-hide-hide-active", coAfterRealHideActive === false, `active=${coAfterRealHideActive}`);
  }

  /**
   * 复现 / 对比 CircleLoadingUI 的"闪一下"问题。
   *
   * 致命时序（初版 single-queue 行为）：
   *   1) 真实 loading（LOADING）show -> 蒙版 active=true
   *   2) 下注 CREATE_ORDER show（非 silent，等同旧逻辑）-> active 仍 true
   *   3) 下注结果回来 hide(CREATE_ORDER) -> 队列空 -> 强制 active=false  ← 蒙版被下注关掉 = 闪一下
   *   4) 真实 loading hide -> 队列已空，无变化
   * 修复后（split-queue silent）：第 3 步不影响蒙版，只在第 4 步真实 loading hide 时才关，无闪。
   *
   * 点击 TestButton 触发，console 输出 active 变化序列，可肉眼对比两段。
   */
  private testCircleLoadingFlashRepro() {
    const [, uiComponent] =
      ComponentManager.Instance.renderUiNode<CircleLoadingUI_Component>(
        "CircleLoadingUI",
        "Prefabs",
        "Common/CircleLoadingUI",
        CircleLoadingUI_Component,
      );

    // 每个步骤之间的停顿（毫秒），放慢时序让"闪一下"能被肉眼看到
    const STEP = 1000;
    const sleep = (ms: number) => new Promise<void>((resolve) => {
      this.scheduleOnce(() => resolve(), ms / 1000);
    });

    // 采样器：记录 node.active 每次跳变
    const trace: string[] = [];
    let prev = uiComponent.node.active;
    const sample = (tag: string) => {
      const now = uiComponent.node.active;
      if (now !== prev) {
        trace.push(`[CHANGE @${tag}] active ${prev} -> ${now}`);
        prev = now;
      } else {
        trace.push(`[${tag}] active=${now}`);
      }
    };

    const run = async () => {
      // ---- 段 A：模拟初版逻辑（legacy），复现闪现 ----
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.LOADING);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CREATE_ORDER);
      await sleep(STEP);

      CommonDailogHandler.showCircleLoading(WAITING_TYPE.LOADING); // 1) 真实 loading 开始（蒙版出现）
      sample("A.after-show-LOADING");
      await sleep(STEP);

      uiComponent.show(WAITING_TYPE.CREATE_ORDER); // 2) 下注（legacy：非 silent，等同旧逻辑）
      sample("A.after-show-CREATE_ORDER(legacy)");
      await sleep(STEP);

      // 3) 下注结果回来 hide(CREATE_ORDER)；legacy 下队列空 -> 强制关蒙版（闪一下，停留 STEP 可见）
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CREATE_ORDER);
      sample("A.after-hide-CREATE_ORDER");
      console.log(`[FlashRepro][LEGACY] 此刻蒙版应被强制关闭（闪一下），观察转圈是否中断`);
      await sleep(STEP);

      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.LOADING); // 4) 真实 loading 结束
      sample("A.after-hide-LOADING");
      await sleep(STEP);

      trace.push(`init active=${uiComponent.node.active}`);
      console.log(`[FlashRepro][LEGACY] ${trace.join(" | ")}`);
      const legacyChanges = trace.filter((t) => t.includes("[CHANGE")).length;
      console.log(`[FlashRepro][LEGACY] active 跳变次数=${legacyChanges}（>1 即出现闪）`);

      // ---- 段 B：当前修复后（silent），验证不闪 ----
      trace.length = 0;
      prev = uiComponent.node.active;

      CommonDailogHandler.showCircleLoading(WAITING_TYPE.LOADING); // 1) 真实 loading 开始
      sample("B.after-show-LOADING");
      await sleep(STEP);

      CommonDailogHandler.showCircleLoading(WAITING_TYPE.CREATE_ORDER, undefined, { silent: true }); // 2) 下注（silent）
      sample("B.after-show-CREATE_ORDER(silent)");
      await sleep(STEP);

      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CREATE_ORDER); // 3) silent 不影响蒙版
      sample("B.after-hide-CREATE_ORDER");
      console.log(`[FlashRepro][FIXED] 此刻蒙版应保持显示（未闪），持续 STEP`);
      await sleep(STEP);

      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.LOADING); // 4) 真实 loading 结束才关
      sample("B.after-hide-LOADING");
      await sleep(STEP);

      trace.push(`init active=${uiComponent.node.active}`);
      console.log(`[FlashRepro][FIXED] ${trace.join(" | ")}`);
      const fixedChanges = trace.filter((t) => t.includes("[CHANGE")).length;
      console.log(`[FlashRepro][FIXED] active 跳变次数=${fixedChanges}（1 即平滑无闪）`);
    };

    run();
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
   * 测试打开骰子游戏界面
   */
  private testDiceGameMain() {
    ComponentManager.Instance.renderUiNode<DicesGameMainUI_Component>(
      "DicesGameMainUI",
      "Prefabs",
      "DicesGame/DicesGameMainUI",
      DicesGameMainUI_Component,
    );
  }

  /**
   * 测试打开骰子游戏记录界面
   */
  private testDicesGameRecordUI() {
    const [node, component] =
      ComponentManager.Instance.renderUiNode<DicesGameRecordUI_Component>(
        "DicesGameRecordUI",
        "Prefabs",
        "Common/DicesGameRecordUI",
        DicesGameRecordUI_Component,
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
