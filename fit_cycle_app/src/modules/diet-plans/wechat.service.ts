import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WechatService {
  private readonly logger = new Logger(WechatService.name);
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private configService: ConfigService) {}

  /**
   * 获取微信 Access Token (带缓存)
   */
  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiresAt) {
      return this.accessToken as string;
    }

    const appId = this.configService.get<string>('WECHAT_APPID');
    const secret = this.configService.get<string>('WECHAT_SECRET');

    if (!appId || !secret) {
      this.logger.error('WECHAT_APPID 或 WECHAT_SECRET 未在环境变量中配置');
      throw new InternalServerErrorException('微信凭证未配置');
    }

    try {
      const res = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
        params: {
          grant_type: 'client_credential',
          appid: appId,
          secret: secret,
        },
      });

      if (res.data.access_token) {
        this.accessToken = res.data.access_token;
        // 缓存失效提前 5 分钟
        this.tokenExpiresAt = now + (res.data.expires_in - 300) * 1000;
        return this.accessToken as string;
      }
      throw new Error(`微信 Token 获取失败: ${JSON.stringify(res.data)}`);
    } catch (err) {
      this.logger.error('获取微信 AccessToken 出错', err.message);
      throw new InternalServerErrorException('获取微信服务凭证失败');
    }
  }

  /**
   * 生成小程序码 (B接口: 数量无限制，scene 最大 32 位)
   */
  async getUnlimitedQRCode(scene: string, page: string): Promise<Buffer> {
    const token = await this.getAccessToken();
    const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token}`;

    // 根据环境决定小程序码跳转的小程序版本
    // 生产环境: release, 开发环境: develop, 体验环境: trial
    let envVersion = 'release';
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    if (nodeEnv === 'development') {
      envVersion = 'develop';
    } else if (this.configService.get('IS_TRIAL') === 'true') {
      envVersion = 'trial';
    }

    try {
      const response = await axios.post(
        url,
        {
          scene,
          page,
          width: 280,
          check_path: false, 
          env_version: envVersion,
        },
        { responseType: 'arraybuffer' },
      );

      // 微信接口如果返回 JSON 说明出错了
      if (response.headers['content-type']?.includes('application/json')) {
        const error = JSON.parse(response.data.toString());
        throw new Error(`微信生成码失败: ${error.errmsg || '未知错误'}`);
      }

      return Buffer.from(response.data);
    } catch (err) {
      this.logger.error('调用微信生成小程序码接口失败', err.message);
      throw new InternalServerErrorException('生成小程序码失败');
    }
  }
}
