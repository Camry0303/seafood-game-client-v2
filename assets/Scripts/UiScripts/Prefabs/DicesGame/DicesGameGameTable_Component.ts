import {
  _decorator,
  Button,
  Node,
  Toggle,
  Event,
  Label,
  UITransform,
  Vec3,
  Prefab,
  instantiate,
  Tween,
  tween,
  UIOpacity,
} from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { DicesGameMainUI_Component } from "./DicesGameMainUI_Component";
import { NewEventHandler } from "../../../Utils/AddEventHandler";
import moment from "moment";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { DicesGameChip_Component } from "./DicesGameChip_Component";
import { DicesGameResults_Component } from "./DicesGameResults_Component";
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
  // 骰盅节点
  private _diceCupNode: Node = null;
  // 骰盅底盘节点
  private _diceCupBottomNode: Node = null;
  // 骰盅骰子容器节点
  private _dicesContainerNode: Node = null;
  // 骰盅顶部节点
  private _diceCupTopNode: Node = null;
  // 上局结果容器节点
  private _lastResultContainerNode: Node = null;
  // 摇动骰盅动画
  private _shakeDiceCupTween: Tween = null;
  // 打开骰盅动画
  private _openDiceCupTween: Tween = null;
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
  }
  //#endregion

  //#region 筹码容器面板相关方法
  /**
   * 初始化筹码容器面板
   */
  private initChipsContainerPanel() {
    this._chipsContainerPanelNode = this.getNode("Content/ChipsContainerPanel");
  }

  /**
   * 筹码放置动画
   * @param result 区域索引
   * @param value 筹码值
   * @param seat_code 座位号
   * @param player_id 玩家id
   */
  public placeChipAnimation(
    result: number,
    value: number,
    seat_code: string,
    player_id: number,
  ) {
    // 1. 获取起始位置（世界坐标）
    const startWorldPos = this._mainComponent
      .getPlayerSeatsComponent()
      .getSeatWorldPosition(seat_code);

    // 2. 获取目标容器节点
    const chipsContainerNode =
      this._chipsContainerPanelNode.children[result - 1];

    if (!chipsContainerNode) {
      console.error(`未找到筹码容器节点，索引: ${result - 1}`);
      return;
    }

    // 3. 在容器范围内随机生成一个局部坐标
    // 获取 UITransform 组件以获取节点的宽高
    const transform = chipsContainerNode.getComponent(UITransform);

    if (!transform) {
      console.error("目标节点缺少 UITransform 组件");
      return;
    }

    const width = transform.width;
    const height = transform.height;

    // 生成随机坐标 (相对于节点的中心点)
    // Math.random() 生成 [0, 1)，乘以宽高后得到 [0, width)，减去一半得到 [-width/2, width/2)
    const randomLocalX = Math.random() * width - width / 2;
    const randomLocalY = Math.random() * height - height / 2;

    // 创建目标位置的局部坐标向量
    const targetLocalPos = new Vec3(randomLocalX, randomLocalY, 0);
    // 创建开始位置的局部坐标向量
    const startLocalPos = chipsContainerNode
      .getComponent(UITransform)!
      .convertToNodeSpaceAR(startWorldPos);

    // 获取预制体
    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "DicesGame/DicesGameChip",
    );
    const chipNode = instantiate(prefab);
    chipsContainerNode.addChild(chipNode);
    const component = chipNode.addComponent(DicesGameChip_Component);
    component.setChipValue(value, player_id);
    component.runTween(startLocalPos, targetLocalPos);
  }

  public placeChip(result: number, value: number, player_id: number) {
    // 2. 获取目标容器节点
    const chipsContainerNode =
      this._chipsContainerPanelNode.children[result - 1];

    if (!chipsContainerNode) {
      console.error(`未找到筹码容器节点，索引: ${result - 1}`);
      return;
    }

    // 3. 在容器范围内随机生成一个局部坐标
    // 获取 UITransform 组件以获取节点的宽高
    const transform = chipsContainerNode.getComponent(UITransform);

    if (!transform) {
      console.error("目标节点缺少 UITransform 组件");
      return;
    }

    const width = transform.width;
    const height = transform.height;

    // 生成随机坐标 (相对于节点的中心点)
    // Math.random() 生成 [0, 1)，乘以宽高后得到 [0, width)，减去一半得到 [-width/2, width/2)
    const randomLocalX = Math.random() * width - width / 2;
    const randomLocalY = Math.random() * height - height / 2;

    // 创建目标位置的局部坐标向量
    const targetLocalPos = new Vec3(randomLocalX, randomLocalY, 0);

    // 获取预制体
    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "DicesGame/DicesGameChip",
    );
    const chipNode = instantiate(prefab);
    chipsContainerNode.addChild(chipNode);
    const component = chipNode.addComponent(DicesGameChip_Component);
    component.setChipValue(value, player_id);
    chipNode.setPosition(targetLocalPos);
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
    this._diceCupNode = this.getNode("Content/DiceCupPanel/DiceCup");
    this._diceCupBottomNode = this.getNode(
      "Content/DiceCupPanel/DiceCup/DiceCupBottom",
    );
    this._dicesContainerNode = this.getNode(
      "Content/DiceCupPanel/DiceCup/DiceCupBottom/DicesContainer",
    );
    this._diceCupTopNode = this.getNode(
      "Content/DiceCupPanel/DiceCup/DiceCupTop",
    );
    this._lastResultContainerNode = this.getNode(
      "Content/DiceCupPanel/LastResult",
    );
  }

  /**
   * 播放骰盅摇动动画
   */
  public playShakeDiceCupAnimation() {
    // 中心位置
    const centerPos = this._diceCupPanelNode
      .getComponent(UITransform)
      .convertToNodeSpaceAR(
        new Vec3(
          this._tablePanelNode.getWorldPosition().x,
          this._tablePanelNode.getWorldPosition().y + 100,
          this._tablePanelNode.getWorldPosition().z,
        ),
      );
    // 原始位置
    const originalPos = new Vec3(108, 0, 0);
    // 摇动高度
    const shakeHeight = 50;

    if (this._shakeDiceCupTween) {
      this._shakeDiceCupTween.stop();
    } else {
      this._shakeDiceCupTween = tween(this._diceCupNode)
        // 1. 移动到屏幕中心并放大
        .parallel(
          tween().to(0.5, { position: centerPos }, { easing: "sineOut" }),
          tween().to(
            0.5,
            { scale: new Vec3(2.0, 2.0, 2.0) },
            { easing: "sineOut" },
          ),
        )
        // 2. 上下摇动
        .to(0.2, {
          position: new Vec3(
            centerPos.x,
            centerPos.y + shakeHeight,
            centerPos.z,
          ),
        })
        .to(0.2, {
          position: new Vec3(centerPos.x, centerPos.y, centerPos.z),
        })
        .delay(0.1)
        // 3. 回到原位置并缩小
        .parallel(
          tween().to(0.5, { position: originalPos }, { easing: "sineIn" }),
          tween().to(0.5, { scale: new Vec3(1, 1, 1) }, { easing: "sineIn" }),
        )
        .call(() => {
          // 停止当前动画
          this._shakeDiceCupTween.stop();
        });
    }

    // 复原状态
    this._diceCupNode.setPosition(originalPos.x, originalPos.y, originalPos.z);
    this._diceCupNode.setScale(1, 1, 1);

    this._shakeDiceCupTween.start();
  }

  /**
   * 播放骰盅打开动画
   * @param results
   */
  public playerOpenDiceCupAnimation(results: number[]) {
    // 骰盅中心位置
    const centerPos = this._diceCupPanelNode
      .getComponent(UITransform)
      .convertToNodeSpaceAR(
        new Vec3(
          this._tablePanelNode.getWorldPosition().x,
          this._tablePanelNode.getWorldPosition().y + 100,
          this._tablePanelNode.getWorldPosition().z,
        ),
      );
    // 骰盅原始位置
    const originalPos = new Vec3(108, 0, 0);
    // 骰盅顶部原始位置
    const topOriginalPos = new Vec3(0, 8, 0);

    this._dicesContainerNode.removeAllChildren();
    // 生成结果骰子节点
    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "DicesGame/DicesGameResults",
    );
    const node = instantiate(prefab);
    const component = node.addComponent(DicesGameResults_Component);
    this._dicesContainerNode.addChild(node);
    component.setData(results);
    node.setPosition(0, 0, 0);

    if (this._openDiceCupTween) {
      this._openDiceCupTween.stop();
    } else {
      this._openDiceCupTween = tween(this._diceCupNode)
        // 1. 移动到屏幕中心并放大
        .parallel(
          tween().to(0.5, { position: centerPos }, { easing: "sineOut" }),
          tween().to(
            0.5,
            { scale: new Vec3(2.0, 2.0, 2.0) },
            { easing: "sineOut" },
          ),
        )
        .delay(0.2)
        .parallel(
          tween(this._diceCupTopNode).to(
            0.5,
            {
              position: new Vec3(
                this._diceCupTopNode.getPosition().x,
                this._diceCupTopNode.getPosition().y + 50,
                this._diceCupTopNode.getPosition().z,
              ),
            },
            { easing: "sineOut" },
          ),
          tween(this._diceCupTopNode.getComponent(UIOpacity)).to(0.5, {
            opacity: 0,
          }),
        )
        .delay(0.2)
        .call(() => {
          // 必须重新获取节点
          const resultsNode = this._dicesContainerNode.children[0];
          console.log(`callback--->`, resultsNode);

          // 1. 获取当前世界位置
          const worldPos = new Vec3();
          resultsNode.getWorldPosition(worldPos);

          // 2. 设置新父节点
          resultsNode.setParent(this._lastResultContainerNode);

          // 3. 将世界位置转换为新父节点坐标系下的局部位置
          const localPos = new Vec3();
          this._lastResultContainerNode.inverseTransformPoint(
            localPos,
            worldPos,
          );
          resultsNode.setPosition(localPos);
          resultsNode.setScale(2.0, 2.0, 2.0);
          resultsNode.getComponent(DicesGameResults_Component).runTween();
        })
        .parallel(
          tween(this._diceCupBottomNode.getComponent(UIOpacity)).to(0.5, {
            opacity: 0,
          }),
        )
        .delay(1)
        .call(() => {
          this._openDiceCupTween.stop();
          // 复原骰盅顶部位置
          this._diceCupTopNode.setPosition(
            topOriginalPos.x,
            topOriginalPos.y,
            topOriginalPos.z,
          );
          this._diceCupTopNode.getComponent(UIOpacity).opacity = 255;
          this._diceCupBottomNode.getComponent(UIOpacity).opacity = 255;
          // 复原骰盅位置
          this._diceCupNode.setPosition(
            originalPos.x,
            originalPos.y,
            originalPos.z,
          );
          // 复原骰盅大小
          this._diceCupNode.setScale(1, 1, 1);
        });
    }

    // 复原骰盅顶部位置
    this._diceCupTopNode.setPosition(
      topOriginalPos.x,
      topOriginalPos.y,
      topOriginalPos.z,
    );
    this._diceCupTopNode.getComponent(UIOpacity).opacity = 255;
    this._diceCupBottomNode.getComponent(UIOpacity).opacity = 255;
    // 复原骰盅位置
    this._diceCupNode.setPosition(originalPos.x, originalPos.y, originalPos.z);
    // 复原骰盅大小
    this._diceCupNode.setScale(1, 1, 1);

    this._openDiceCupTween.start();
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
    this._timeCounterPanelNode.active = true;
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
