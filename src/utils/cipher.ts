import { encrypt, decrypt } from 'crypto-js/aes';
import { parse } from 'crypto-js/enc-utf8';
import pkcs7 from 'crypto-js/pad-pkcs7';
import ECB from 'crypto-js/mode-ecb';
import md5 from 'crypto-js/md5';
import UTF8 from 'crypto-js/enc-utf8';
import Base64 from 'crypto-js/enc-base64';
import { getToken } from '/@/utils/auth';
import { getAppEnvConfig } from '/@/utils/env';
import { JSEncrypt } from 'jsencrypt';

// 获取密钥
const { VITE_GLOB_PUBLICKEY } = getAppEnvConfig();

export interface EncryptionParams {
  key: string;
  iv: string;
}

export class AesEncryption {
  private key;
  private iv;

  constructor(opt: Partial<EncryptionParams> = {}) {
    const { key, iv } = opt;
    if (key) {
      this.key = parse(key);
    }
    if (iv) {
      this.iv = parse(iv);
    }
  }

  get getOptions() {
    return {
      mode: ECB,
      padding: pkcs7,
      iv: this.iv,
    };
  }

  encryptByAES(cipherText: string) {
    return encrypt(cipherText, this.key, this.getOptions).toString();
  }

  decryptByAES(cipherText: string) {
    return decrypt(cipherText, this.key, this.getOptions).toString(UTF8);
  }
}

export function encryptByBase64(cipherText: string) {
  return UTF8.parse(cipherText).toString(Base64);
}

export function decodeByBase64(cipherText: string) {
  return Base64.parse(cipherText).toString(UTF8);
}

export function encryptByMd5(password: string) {
  return md5(password).toString();
}

// 加密指定内容
export function RsaEncrypt(data: string) {
  // 初始化加密
  const Encrypt = new JSEncrypt();

  // 导入密钥
  Encrypt.setPublicKey(VITE_GLOB_PUBLICKEY);

  // 返回加密数据
  return Encrypt.encrypt(data);
}

// 加密请求参数
export function EncryptParams(data: string) {
  // 获取Token
  const token: any = getToken();

  // 加密
  let Md5Key: any = md5(VITE_GLOB_PUBLICKEY).toString();

  // 验证Token是否存在
  if (token) {
    Md5Key = md5(VITE_GLOB_PUBLICKEY + token).toString();
  }

  // 截取 16位字符串
  const SubString = Md5Key.substring(0, 16);

  // 转换截取后的16位密钥
  const Key = parse(SubString);

  // 转换参数
  const Params = parse(data);

  // 加密参数
  const Encrypted = encrypt(Params, Key, { mode: ECB, padding: pkcs7 });

  // 返回加密后的参数
  return Encrypted.toString();
}
