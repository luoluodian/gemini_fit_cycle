import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ActivationCode } from '../../database/entity/activation-code.entity';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(ActivationCode)
    private readonly activationCodeRepo: Repository<ActivationCode>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 批量生成激活码
   */
  async batchGenerate(adminId: number, dto: {
    count: number;
    memberLevel: number;
    durationDays: number;
    expiredAt: string;
    type?: string;
  }) {
    if (dto.count <= 0 || dto.count > 100) {
      throw new BadRequestException('生成数量必须在1-100之间');
    }

    const expiredAt = new Date(dto.expiredAt);
    if (isNaN(expiredAt.getTime())) {
      throw new BadRequestException('无效的过期日期');
    }

    const codes: ActivationCode[] = [];
    for (let i = 0; i < dto.count; i++) {
      const activationCode = new ActivationCode();
      activationCode.code = this.generateRandomCode();
      activationCode.type = dto.type || 'VIP';
      activationCode.memberLevel = dto.memberLevel;
      activationCode.durationDays = dto.durationDays;
      activationCode.expiredAt = expiredAt;
      activationCode.createdBy = adminId;
      codes.push(activationCode);
    }

    return await this.activationCodeRepo.save(codes);
  }

  /**
   * 生成随机激活码 (格式: FIT-XXXX-XXXX)
   */
  private generateRandomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除易混淆字符
    const segment = () => {
      let s = '';
      for (let i = 0; i < 4; i++) {
        s += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return s;
    };
    return `FIT-${segment()}-${segment()}`;
  }
}
