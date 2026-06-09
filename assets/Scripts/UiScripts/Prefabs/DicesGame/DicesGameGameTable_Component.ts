import { _decorator, Button, Node, Toggle, Event, Label } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { DicesGameMainUI_Component } from "./DicesGameMainUI_Component";
import { NewEventHandler } from "../../../Utils/AddEventHandler";
import moment from "moment";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameGameTable_Component")
@menu("Hidden/DicesGameGameTable_Component")
export class DicesGameGameTable_Component extends ComponentController {
  // 骰子游戏主界面组件
  private _mainComponent: DicesGameMainUI_Component = null;

  //#region 桌面UI相关属性
  // 桌面UI面板
  private _tablePanelNode: Node = null;
  //#endregion

  //#region 筹码容器面板相关属性
  // 筹码容器面板
  private _chipsContainerPanelNode: Node = null;
  //#endregion

  //#region 下单按钮相关属性
  // 下单按钮面板
  private _orderButtonPanelNode: Node = null;
  //#endregion

  //#region 下单勾选框相关属性
  // 下单勾选框面板
  private _orderCheckBoxPanelNode: Node = null;
  //#endregion

  //#region 骰盅相关属性
  // 骰盅面板
  private _diceCupPanelNode: Node = null;
  //#endregion

  //#region 计时器相关属性
  // 计时器面板
  private _timeCounterPanelNode: Node = null;
  // 计时器标签
  private _clockLabel: Label = null;
  // 剩余时间
  private _remainingTime: number = 0;
  // 准备状态节点
  private _preparationNode: Node = null;
  // 下单状态节点
  private _orderingNode: Node = null;
  // 开奖状态节点
  private _openNode: Node = null;
  // 计时状态
  private _clockStatus: "Preparation" | "Order" | "Open" = "Preparation";

  //#endregion
  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    this._mainComponent = this.node.parent.getComponent(
      DicesGameMainUI_Component,
    );

    this.initTablePanel();
    this.initChipsContainerPanel();
    this.initOrderButtonPanel();
    this.initOrderCheckBoxPanel();
    this.initDiceCupPanel();
    this.initTimeCounterPanel();
  }

  //#region 桌面UI相关方法
  /**
   * 初始化桌面UI面板
   */
  private initTablePanel() {
    this._tablePanelNode = this.getNode("Content/TablePanel");
    console.log(`this._tablePanelNode--->`, this._tablePanelNode);
  }
  //#endregion

  //#region 筹码容器面板相关方法
  /**
   * 初始化筹码容器面板
   */
  private initChipsContainerPanel() {
    this._chipsContainerPanelNode = this.getNode("Content/ChipsContainerPanel");
    console.log(
      `this._chipsContainerPanelNode--->`,
      this._chipsContainerPanelNode,
    );
  }

  /**
   * 筹码放置动画
   * @param result
   * @param value
   */
  public placeChipAnimation(result: number, value: number, seat: number) {
    // TODO - 筹码放置动画
    console.log(`placeChipAnimation result--->`, result);
    console.log(`placeChipAnimation value--->`, value);
    console.log(`placeChipAnimation seat--->`, seat);

    const chipsContainerNode =
      this._chipsContainerPanelNode.children[result - 1];
  }
  //#endregion

  //#region 下单按钮面板相关方法
  /**
   * 初始化下单按钮面板
   */
  private initOrderButtonPanel() {
    this._orderButtonPanelNode = this.getNode("Content/OrderButtonPanel");

    const buttonNodes = this._orderButtonPanelNode.children;
    // 设置下单按钮点击事件
    for (let i = 0; i < buttonNodes.length; i++) {
      const node = buttonNodes[i];
      const button = node.getComponent(Button);
      button.clickEvents[0] = NewEventHandler(
        this.node,
        this.getClassName(),
        "onOrderButtonClick",
        node.name,
      );
      // 设置下单按钮不可点击
      button.interactable = false;
    }
  }

  /**
   * TODO - 下单按钮点击事件
   * @param event
   * @param customData
   */
  private onOrderButtonClick(event: Event, customData: string) {
    const orderResult = parseInt(customData);
    console.log(`onOrderButtonClick orderResult--->`, orderResult);
  }

  /**
   * 设置下单按钮是否可点击
   * @param isInteractable
   */
  public setOrderButtonInteractable(isInteractable: boolean) {
    const buttonNodes = this._orderButtonPanelNode.children;
    // 设置下单按钮是否可点击
    for (let i = 0; i < buttonNodes.length; i++) {
      const node = buttonNodes[i];
      const button = node.getComponent(Button);
      button.interactable = isInteractable;
    }
  }
  //#endregion

  //#region 下单勾选框面板相关方法
  /**
   * 初始化下单勾选框面板
   */
  private initOrderCheckBoxPanel() {
    this._orderCheckBoxPanelNode = this.getNode("Content/OrderCheckBoxPanel");

    const checkBoxNodes = this._orderCheckBoxPanelNode.children;
    // 设置下单勾选框点击事件
    for (let i = 0; i < checkBoxNodes.length; i++) {
      const node = checkBoxNodes[i];
      const toggle = node.getComponent(Toggle);
      toggle.checkEvents[0] = NewEventHandler(
        this.node,
        this.getClassName(),
        "onOrderCheckBoxcheck",
        node.name,
      );

      // 设置下单勾选框不可点击
      toggle.interactable = false;
      // 设置下单勾选框默认不勾选
      toggle.setIsCheckedWithoutNotify(false);
    }
  }

  /**
   * TODO -下单勾选框点击事件
   * @param event
   * @param customData
   */
  private onOrderCheckBoxcheck(event: Event, customData: string) {
    const orderResult = parseInt(customData);
    console.log(`onOrderCheckBoxClick orderResult--->`, orderResult);
    const toggle = (event.target as Node).getComponent(Toggle);
    // 设置下单勾选框取反（更改无效）
    toggle.setIsCheckedWithoutNotify(!toggle.isChecked);
  }

  /**
   * 设置下单勾选框是否可点击
   * @param isInteractable
   */
  private setOrderCheckBoxInteractable(isInteractable: boolean) {
    const checkBoxNodes = this._orderCheckBoxPanelNode.children;
    // 设置下单勾选框是否可点击
    for (let i = 0; i < checkBoxNodes.length; i++) {
      const node = checkBoxNodes[i];
      const toggle = node.getComponent(Toggle);
      toggle.interactable = isInteractable;
    }
  }

  /**
   * 显示下单勾选框面板
   */
  public showOrderCheckBoxPanel() {
    this.initOrderCheckBoxPanel();
    this._orderCheckBoxPanelNode.active = true;
  }

  /**
   * 隐藏下单勾选框面板
   */
  public hideOrderCheckBoxPanel() {
    this._orderCheckBoxPanelNode.active = false;
  }
  //#endregion

  //#region 骰盅面板相关方法
  /**
   * 初始化骰盅面板
   */
  private initDiceCupPanel() {
    this._diceCupPanelNode = this.getNode("Content/DiceCupPanel");
    console.log(`this._diceCupPanelNode--->`, this._diceCupPanelNode);
  }
  //#endregion

  //#region 计时器面板相关方法
  /**
   * 初始化计时器面板
   */
  private initTimeCounterPanel() {
    this._timeCounterPanelNode = this.getNode("Content/TimeCounterPanel");

    [, this._clockLabel] = this.getNodeComponent(
      "Content/TimeCounterPanel/Clock/Label",
      Label,
    );
    this._clockLabel.string = `${this._remainingTime}`;

    this._preparationNode = this.getNode(
      "Content/TimeCounterPanel/Status/Preparation",
    );
    this._orderingNode = this.getNode(
      "Content/TimeCounterPanel/Status/Ordering",
    );
    this._openNode = this.getNode("Content/TimeCounterPanel/Status/Open");
  }

  /**
   * 设置计时器面板
   * @param status
   * @param remainingTime
   */
  public setTimeCounter(
    status: "preparation" | "ordering" | "open",
    remainingTime: number,
  ) {
    console.log(`setTimeCounter status--->`, status);
    console.log(`setTimeCounter remainingTime--->`, remainingTime);

    this._preparationNode.active = status === "preparation";
    this._orderingNode.active = status === "ordering";
    this._openNode.active = status === "open";

    this._remainingTime = remainingTime;
    // 取消计时器标签调度所有已调度的回调函数
    this._clockLabel.unscheduleAllCallbacks();
    const timerStart = moment().unix();
    this._clockLabel.schedule(
      () => {
        let timeLeft = Math.ceil(
          remainingTime - (moment().unix() - timerStart),
        );
        this._clockLabel && (this._clockLabel.string = String(timeLeft));
        if (timeLeft <= 0) {
          this._clockLabel.unscheduleAllCallbacks();
          this._clockLabel.string = "0";
        }
      },
      1,
      remainingTime - 1,
      0,
    );
  }
  //#endregion
}
