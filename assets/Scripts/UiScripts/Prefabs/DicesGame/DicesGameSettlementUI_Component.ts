import { _decorator, instantiate, Node, Prefab, Sprite, SpriteAtlas } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { Gateway } from "../../../Types/gateway";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { DicesGameSettlementItem_Component } from "./DicesGameSettlementItem_Component";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameSettlementUI_Component")
@menu("Hidden/DicesGameSettlementUI_Component")
export class DicesGameSettlementUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  // 结果1图片精灵
  private _result1Sprite: Sprite = null;
  // 结果2图片精灵
  private _result2Sprite: Sprite = null;
  // 结果3图片精灵
  private _result3Sprite: Sprite = null;
  // 结算项容器
  private _settlementItemContainer: Node = null;

  // 结算数据
  private _data: {
    results: number[];
    settlements: Gateway.Returned.Games.DicesGame.PlayerSettlementData[];
  } = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取结果1图片精灵
    [, this._result1Sprite] = this.getNodeComponent(
      "MainView/Content/OpenResults/Results/Result1",
      Sprite,
    );
    // 获取结果2图片精灵
    [, this._result2Sprite] = this.getNodeComponent(
      "MainView/Content/OpenResults/Results/Result2",
      Sprite,
    );
    // 获取结果3图片精灵
    [, this._result3Sprite] = this.getNodeComponent(
      "MainView/Content/OpenResults/Results/Result3",
      Sprite,
    );

    // 获取结算项容器
    this._settlementItemContainer = this.getNode(
      "MainView/Content/ScrollView/view/content",
    );

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    // 设置关闭按钮点击事件
    this.setButtonClickEvent(
      "MainView/CloseBtn",
      0,
      "close",
      this.getClassName(),
    );

    // 设置蒙版关闭按钮点击事件
    this.setButtonClickEvent("MaskNode", 0, "close", this.getClassName());
  }

  /**
   * 关闭弹窗
   */
  public close() {
    this._bubbleWindow.close(() => {
      ComponentManager.Instance.destroyNode(this.node);
    });
  }

  /**
   * 设置数据
   * @param data
   */
  public setData(data: {
    results: number[];
    settlements: Gateway.Returned.Games.DicesGame.PlayerSettlementData[];
  }) {
    this._data = data;
    // 从资源管理中获取图集
    const atlas = ResourceManager.Instance.getAsset<SpriteAtlas>(
      "Images",
      `DicesGame/icons/icons0_atlas`,
    );

    // 设置结果1图片
    this._result1Sprite.spriteFrame = atlas.getSpriteFrame(
      `${data.results[0]}`,
    );
    // 设置结果2图片
    this._result2Sprite.spriteFrame = atlas.getSpriteFrame(
      `${data.results[1]}`,
    );
    // 设置结果3图片;
    if (data.results.length === 3) {
      this._result3Sprite.spriteFrame = atlas.getSpriteFrame(
        `${data.results[2]}`,
      );
      this._result3Sprite.node.active = true;
    }

    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "DicesGame/DicesGameSettlementItem",
    );

    // 渲染结算项
    data.settlements.forEach((item) => {
      const node = instantiate(prefab);
      const component = node.addComponent(DicesGameSettlementItem_Component);
      this._settlementItemContainer.addChild(node);
      component.setData(item);
    });
  }
}
