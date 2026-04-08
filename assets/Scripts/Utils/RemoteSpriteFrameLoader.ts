import { assetManager, ImageAsset, SpriteFrame, Texture2D } from "cc";
import { ResourceManager } from "../Runtime/ResourceManager";

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
    console.error("加载远程图片失败:", error);
    return null;
  }
}

/**
 * 获取头像精灵
 * @param url
 * @returns
 */
export async function getAvatarSpriteFrame(url: string): Promise<SpriteFrame> {
  // 分别处理微信头像和自定义头像
  if (url.startsWith("custom_")) {
    return ResourceManager.Instance.getSpriteFrame(
      "Images",
      `/Common/Avatars/${url.replace("custom_", "")}`,
    );
  } else if (url.startsWith("https") || url.startsWith("http")) {
    const spriteFrame = await wechatSpriteFrameLoader(url);
    if (spriteFrame) {
      return spriteFrame;
    } else {
      return ResourceManager.Instance.getSpriteFrame(
        "Images",
        `Common/Avatars/avatar_21`,
      );
    }
  }
}
