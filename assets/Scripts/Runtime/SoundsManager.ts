import { AudioClip, AudioSource, Button, EventTouch, _decorator } from "cc";
import { SingletonComponent } from "../Common/SingletonComponent";
import { Config } from "../Types/typing";
import { ResourceManager } from "./ResourceManager";
const { ccclass, property } = _decorator;

/**
 * 音效管理类
 */
// @ccclass('SoundsManager')
export class SoundsManager extends SingletonComponent {
  private _bgmAudioSource: AudioSource | null = null;

  private _effectAudioSource: AudioSource | null = null;

  private _soundsMap: { [key: string]: AudioClip } = {};

  // 音乐音量
  private _bgmVolume: number = 1;

  // 音效音量
  private _effectVolume: number = 1;

  // 背景音乐是否开启
  private _bgmEnabled: boolean = true;

  // 音效是否开启
  private _effectEnabled: boolean = true;

  // 单例
  // 获取单例
  static get Instance() {
    return super.GetInstance<SoundsManager>();
  }

  protected onLoad(): void {
    // 单例模式代码
    if (SoundsManager.GetInstance() === null) {
      // 获取音效配置
      const soundsConfigString = this.getDataFromStorage("SoundsConfig");
      if (soundsConfigString) {
        const soundsConfig: Config.SoundsConfig =
          JSON.parse(soundsConfigString);
        this._bgmVolume = soundsConfig.bgmVolume;
        this._effectVolume = soundsConfig.effectVolume;
        this._bgmEnabled = soundsConfig.bgmEnabled;
        this._effectEnabled = soundsConfig.effectEnabled;
      } else {
        this._bgmVolume = 1;
        this._effectVolume = 1;
        this._bgmEnabled = true;
        this._effectEnabled = true;
        const soundsConfig: Config.SoundsConfig = {
          bgmVolume: this._bgmVolume,
          effectVolume: this._effectVolume,
          bgmEnabled: this._bgmEnabled,
          effectEnabled: this._effectEnabled,
        };
        this.setDataToStorage("SoundsConfig", soundsConfig);
      }
      // 挂载 bgmAudioSource 组件
      const bgmAudioSource = this.node.addComponent(AudioSource);
      this._bgmAudioSource = bgmAudioSource;

      // 挂载 EffectAudioSource 组件
      const effectAudioSource = this.node.addComponent(AudioSource);
      this._effectAudioSource = effectAudioSource;

      SoundsManager.SetInstance(this);
    } else {
      this.destroy();
    }
  }

  start() {}

  update(deltaTime: number) {}

  /**
   * 映射音频资源
   * @param map
   */
  public mapAudioClips(map: Config.SoundsMap) {
    // 加载音效资源
    for (const abName in map) {
      const audioMaps = map[abName];
      for (let index = 0; index < audioMaps.length; index++) {
        const audioInfo = audioMaps[index];
        const audioClip: AudioClip = ResourceManager.Instance.getAsset(
          abName,
          audioInfo.url
        );
        if (audioClip) {
          this._soundsMap[audioInfo.name] = audioClip;
        }
      }
    }
  }

  /**
   * 播放音效
   * @param effectName
   */
  public playEffect(effectName: string) {
    if (!this._effectAudioSource) {
      console.error(
        `[SoundsManager] playEffect faild: effectAudioSource not exist!`
      );
      return;
    }
    if (this._effectEnabled) {
      const audioClip = this._soundsMap[effectName];
      if (!audioClip) {
        console.error(
          `[SoundsManager] playEffect faild:AudioClip<${effectName}> not exist!`
        );
        return;
      }
      this._effectAudioSource.playOneShot(audioClip, this._effectVolume);
    }
  }

  /**
   * 播放背景音乐
   * @param bgmName
   */
  public playMusic(bgmName: string) {
    if (!this._bgmAudioSource) {
      console.error(
        `[SoundsManager] playMusic faild:bgmAudioSource not exist!`
      );
      return;
    }
    if (this._bgmEnabled) {
      const audioClip = this._soundsMap[bgmName];
      if (!audioClip) {
        console.error(
          `[SoundsManager] playMusic faild:AudioClip<${bgmName}> not exist!`
        );
        return;
      }
      this._bgmAudioSource.clip = audioClip;
      this._bgmAudioSource.loop = true;
      this._bgmAudioSource.volume = this._bgmVolume;
      this._bgmAudioSource.play();
    }
  }

  /**
   * 设置Bgm音量
   * @param volume
   */
  public setBgmVolume(volume: number) {
    this._bgmVolume = volume;
    if (this._bgmAudioSource) {
      this._bgmAudioSource.volume = this._bgmVolume;
      const soundsConfig: Config.SoundsConfig = {
        bgmVolume: this._bgmVolume,
        effectVolume: this._effectVolume,
        bgmEnabled: this._bgmEnabled,
        effectEnabled: this._effectEnabled,
      };
      this.setDataToStorage("SoundsConfig", soundsConfig);
    }
  }

  /**
   * 获取Bgm音量
   * @returns
   */
  public getBgmVolume() {
    return this._bgmVolume;
  }

  /**
   * 设置音效音量
   * @param volume
   */
  public setEffectVolume(volume: number) {
    this._effectVolume = volume;
    if (this._effectAudioSource) {
      const soundsConfig: Config.SoundsConfig = {
        bgmVolume: this._bgmVolume,
        effectVolume: this._effectVolume,
        bgmEnabled: this._bgmEnabled,
        effectEnabled: this._effectEnabled,
      };
      this.setDataToStorage("SoundsConfig", soundsConfig);
    }
  }

  /**
   * 获取音效音量
   * @returns
   */
  public getEffectVolume() {
    return this._effectVolume;
  }

  /**
   * 设置全局按钮音效
   * @param effectName
   * @param exceptNodeName
   */
  public setGlobalButtonEffect(effectName: string, exceptNodeNames: string[]) {
    if (Button.prototype["_onTouchEndedClone"]) {
      return;
    } else {
      Button.prototype["_onTouchEndedClone"] =
        Button.prototype["_onTouchEnded"];
      Button.prototype["_onTouchEnded"] = function (event: EventTouch) {
        if (this.interactable && this.enabledInHierarchy) {
          let isPlayer = true;
          for (let index = 0; index < exceptNodeNames.length; index++) {
            const element = exceptNodeNames[index];
            if ((event.currentTarget.name as string).includes(element)) {
              isPlayer = false;
              break;
            }
          }
          if (isPlayer) {
            SoundsManager.Instance.playEffect(effectName);
          }
        }
        Button.prototype["_onTouchEndedClone"].call(this, event);
      };
    }
  }
}
