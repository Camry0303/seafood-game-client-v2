import { _decorator, Label, Sprite, SpriteAtlas, UITransform } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { ResourceManager } from "../../../Runtime/ResourceManager";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameHistoryItem_Component")
@menu("Hidden/DicesGameHistoryItem_Component")
export class DicesGameHistoryItem_Component extends ComponentController {
  // 局数标签
  private _roundLabel: Label = null;
  // 结果1图片精灵
  private _result1Sprite: Sprite = null;
  // 结果2图片精灵
  private _result2Sprite: Sprite = null;
  // 结果3图片精灵
  private _result3Sprite: Sprite = null;

  // 结果数据
  private _resultData: any = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();
    // 获取局数标签
    [, this._roundLabel] = this.getNodeComponent("Round", Label);
    // 获取结果1图片精灵
    [, this._result1Sprite] = this.getNodeComponent("Result1", Sprite);
    // 获取结果2图片精灵
    [, this._result2Sprite] = this.getNodeComponent("Result2", Sprite);
    // 获取结果3图片精灵
    [, this._result3Sprite] = this.getNodeComponent("Result3", Sprite);
  }

  /**
   * 设置数据
   * @param data
   */
  public setData(data: { round: number; results: number[] }) {
    this._resultData = data;
    // 从资源管理中获取图集
    const atlas = ResourceManager.Instance.getAsset<SpriteAtlas>(
      "Images",
      `DicesGame/icons/small_icon0_atlas`,
    );
    // 设置局数
    this._roundLabel.string = data.round.toString();
    // 设置结果1图片
    this._result1Sprite.spriteFrame = atlas.getSpriteFrame(
      `${data.results[0]}`,
    );
    this._result2Sprite.spriteFrame = atlas.getSpriteFrame(
      `${data.results[1]}`,
    );

    if (data.results.length === 3) {
      this._result3Sprite.spriteFrame = atlas.getSpriteFrame(
        `${data.results[2]}`,
      );
      this._result3Sprite.node.active = true;
      this._result1Sprite.node.getComponent(UITransform).setContentSize(40, 40);
      this._result2Sprite.node.getComponent(UITransform).setContentSize(40, 40);
      this._result3Sprite.node.getComponent(UITransform).setContentSize(40, 40);
    }
  }
}
