import { Logger } from "./Logger";
import { assetManager, ImageAsset, SpriteFrame, Texture2D } from "cc";
import { ResourceManager } from "../Runtime/ResourceManager";
import { GlobalData } from "../Runtime/GlobalData";

/**
 * 获取微信图片精灵
 * @param url
 * @returns
 */
export async function wechatSpriteFrameLoader(
  url: string,
): Promise<SpriteFrame> {
  try {
    // 使用 assetManager 加载远程资源
    const imageAsset = await new Promise<ImageAsset>((resolve, reject) => {
      assetManager.loadRemote<ImageAsset>(
        url,
        { ext: ".jpg" },
        (err, asset) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(asset);
        },
      );
    });

    // 创建纹理
    const texture = new Texture2D();
    texture.image = imageAsset;

    // 创建 SpriteFrame
    const spriteFrame = new SpriteFrame();
    spriteFrame.texture = texture;

    return spriteFrame;
  } catch (error) {
    Logger.error("加载远程图片失败:", error);
    return null;
  }
}

/**
 * 获取本地头像精灵
 * @param url
 * @returns
 */
export async function getAvatarSpriteFrame(
  url: string,
  prefix: string = "custom_",
): Promise<SpriteFrame> {
  // 机器人头像（bot_ 开头）：拼接热更域名 + /avatars/{原始文件名}.jpeg 远程加载
  if (url.startsWith("bot_")) {
    const domain = GlobalData.Instance.getHotUpdateDomain();
    if (domain) {
      const botUrl = `${domain}/avatars/${url}.jpeg`;
      const spriteFrame = await wechatSpriteFrameLoader(botUrl);
      if (spriteFrame) {
        return spriteFrame;
      }
    }
    // 域名缺失或加载失败时回退默认头像
    return ResourceManager.Instance.getSpriteFrame(
      "Images",
      `Common/default_avatar_01`,
    );
  }

  // 分别处理微信头像和自定义头像
  if (url.startsWith(prefix)) {
    return ResourceManager.Instance.getSpriteFrame(
      "Images",
      `Avatars/${url.replace(prefix, "")}`,
    );
  } else if (url.startsWith("https") || url.startsWith("http")) {
    const spriteFrame = await wechatSpriteFrameLoader(url);
    if (spriteFrame) {
      return spriteFrame;
    } else {
      return ResourceManager.Instance.getSpriteFrame(
        "Images",
        `Common/default_avatar_01`,
      );
    }
  } else {
    return ResourceManager.Instance.getSpriteFrame(
      "Images",
      `Common/default_avatar_01`,
    );
  }
}

/**
 * 从base64字符串获取SpriteFrame
 * @param base64
 * @returns
 */
export async function getSpriteFrameFromBase64(
  base64: string,
): Promise<SpriteFrame> {
  try {
    // 使用 assetManager 加载远程资源
    const imageAsset = await new Promise<ImageAsset>((resolve, reject) => {
      assetManager.loadRemote<ImageAsset>(
        base64,
        { ext: ".png" },
        (err, asset) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(asset);
        },
      );
    });

    // 创建纹理
    const texture = new Texture2D();
    texture.image = imageAsset;

    // 创建 SpriteFrame
    const spriteFrame = new SpriteFrame();
    spriteFrame.texture = texture;

    return spriteFrame;
  } catch (error) {
    Logger.error("加载 base64 图片失败:", error);
    return null;
  }
}
