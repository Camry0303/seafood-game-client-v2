import md5 from "md5";
import CryptoES from "crypto-es"; // 改用 crypto-es
import Constants from "../Common/Constants";

export default class CryptoUtils {
  /**
   * 生成签名后的参数
   * @param params
   * @param secret_key
   */
  public static genSignedParams<T>(params: object, secret_key: string): T {
    const sign = this.genSignature(params, secret_key);
    const signedParams = { ...params, sign };
    return signedParams as T;
  }

  /**
   * 生成对应Key的签名
   * @param params
   * @returns
   */
  public static genSignature(params: object, secret_key: string): string {
    const keys = Object.keys(params).sort();
    let str = "";
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key !== "sign") {
        const value = params[key as keyof typeof params];
        str += `${value}`;
      }
    }
    const sign = md5(`${str}${secret_key}`);
    return sign;
  }

  /**
   * 生成加密密码
   * @param userInfo openId,account or phone_number
   * @param password
   * @returns
   */
  public static genEncodedPassword(userInfo: string, password: string): string {
    const encodedPassword = md5(
      `${userInfo}${password}${Constants.PASSWORD_KEY}`,
    );
    return encodedPassword;
  }

  /**
   * 密码传输加密
   * @param password
   * @returns
   */
  public static desEncryptPassword(password: string) {
    const encryptedPassword = CryptoES.DES.encrypt(
      password,
      Constants.PASSWORD_KEY,
    );
    return encryptedPassword.toString();
  }

  /**
   * 密码传输解密
   * @param encryptedPassword
   * @returns
   */
  public static desDecryptPassword(encryptedPassword: string) {
    const decryptedPassword = CryptoES.DES.decrypt(
      encryptedPassword,
      Constants.PASSWORD_KEY,
    );
    return decryptedPassword.toString(CryptoES.enc.Utf8);
  }

  /**
   * 在范围中生成整数
   * @param a
   * @param b
   * @returns
   */
  public static genRandomIntegerBetween(a: number, b: number): number {
    const random = Math.floor(Math.random() * (b - a + 1)) + a;
    return random;
  }
}
