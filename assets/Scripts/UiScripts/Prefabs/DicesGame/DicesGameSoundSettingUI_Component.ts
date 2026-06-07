import { _decorator, Slider, UITransform, Node } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { SoundsManager } from "../../../Runtime/SoundsManager";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameSoundSettingUI_Component")
@menu("Hidden/DicesGameSoundSettingUI_Component")
export class DicesGameSoundSettingUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _bgmSliderNode: Node = null;
  private _bgmSlider: Slider = null;

  private _effectNode: Node = null;
  private _effectSlider: Slider = null;

  private _bgmSliderMaskNode: Node = null;
  private _bgmSliderMaskUi: UITransform = null;

  private _effectSliderMaskNode: Node = null;
  private _effectSliderMaskUi: UITransform = null;

  private _originWidth: number = 0;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    this._originWidth = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/MainContent/BGM/Slider",
      UITransform,
    )[1].width;

    [this._bgmSliderNode, this._bgmSlider] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/MainContent/BGM/Slider",
      Slider,
    );

    [this._effectNode, this._effectSlider] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/MainContent/Effect/Slider",
      Slider,
    );

    [this._bgmSliderMaskNode, this._bgmSliderMaskUi] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/MainContent/BGM/Slider/Mask",
      UITransform,
    );

    [this._effectSliderMaskNode, this._effectSliderMaskUi] =
      this.getNodeComponent(
        "MainView/Content/ScrollView/view/content/MainContent/Effect/Slider/Mask",
        UITransform,
      );

    // 设置BGM滑动条滑动事件
    this.setSlideEvent(
      "MainView/Content/ScrollView/view/content/MainContent/BGM/Slider",
      0,
      "onBgmSliderChange",
      this.getClassName(),
    );

    // 设置音效滑动条滑动事件
    this.setSlideEvent(
      "MainView/Content/ScrollView/view/content/MainContent/Effect/Slider",
      0,
      "onEffectSliderChange",
      this.getClassName(),
    );

    // 设置关闭按钮点击事件
    this.setButtonClickEvent(
      "MainView/CloseBtn",
      0,
      "close",
      this.getClassName(),
    );

    // 设置蒙版关闭按钮点击事件
    this.setButtonClickEvent("MaskNode", 0, "close", this.getClassName());

    this.initDialogSettingUI();
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
   * 初始化设置面板
   */
  public initDialogSettingUI() {
    const bgmVolume = SoundsManager.Instance.getBgmVolume();
    this._bgmSlider.progress = bgmVolume;
    this._bgmSliderMaskUi.width = this._originWidth * this._bgmSlider.progress;

    const effectVolume = SoundsManager.Instance.getEffectVolume();
    this._effectSlider.progress = effectVolume;
    this._effectSliderMaskUi.width =
      this._originWidth * this._effectSlider.progress;
  }

  /**
   * BGM滑动条事件
   * @param event
   */
  private onBgmSliderChange(event: Event) {
    // 将progress值四舍五入到最近的0.1的倍数
    const steppedProgress = Math.round(this._bgmSlider.progress * 10) / 10;
    this._bgmSlider.progress = steppedProgress;

    this._bgmSliderMaskUi.width = this._originWidth * this._bgmSlider.progress;
    SoundsManager.Instance.setBgmVolume(this._bgmSlider.progress);
  }

  /**
   * 音效滑动条事件
   * @param event
   */
  private onEffectSliderChange(event: Event) {
    // 将progress值四舍五入到最近的0.1的倍数
    const steppedProgress = Math.round(this._effectSlider.progress * 10) / 10;
    this._effectSlider.progress = steppedProgress;

    this._effectSliderMaskUi.width =
      this._originWidth * this._effectSlider.progress;
    SoundsManager.Instance.setEffectVolume(this._effectSlider.progress);
  }
}
