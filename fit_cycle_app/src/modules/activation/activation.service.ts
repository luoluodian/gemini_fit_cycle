import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ActivationCode } from '../../database/entity/activation-code.entity';
import { User } from '../../database/entity/user.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class ActivationService {
  constructor(
    @InjectRepository(ActivationCode)
    private readonly activationCodeRepo: Repository<ActivationCode>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  /**
   * 兑换激活码
   */
  async activate(userId: number, code: string) {
    this.logger.info(`[Activation] User ${userId} starting activation for code: ${code}`);

    // 1. 查找并校验激活码
    const activationCode = await this.activationCodeRepo.findOne({
      where: { code },
    });

    if (!activationCode) {
      this.logger.warn(`[Activation] Failed: User ${userId} attempted invalid code: ${code}`);
      throw new NotFoundException('该激活码不存在');
    }

    if (activationCode.isUsed) {
      this.logger.warn(`[Activation] Failed: User ${userId} used consumed code: ${code}`);
      throw new BadRequestException('该激活码已被使用');
    }

    if (new Date() > activationCode.expiredAt) {
      this.logger.warn(`[Activation] Failed: User ${userId} used expired code: ${code}`);
      throw new BadRequestException('该激活码已过期');
    }

    // 2. 查找用户
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.error(`[Activation] Critical: User ${userId} not found during activation`);
      throw new NotFoundException('用户不存在');
    }

    // 3. 开启事务进行兑换
    const result = await this.dataSource.transaction(async (manager) => {
      // 再次锁定激活码以防并发 (悲观锁)
      const lockedCode = await manager.findOne(ActivationCode, {
        where: { id: activationCode.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedCode) {
        throw new NotFoundException('激活码在处理中丢失');
      }

      if (lockedCode.isUsed) {
        throw new BadRequestException('该激活码正在被处理或已被使用');
      }

      // 计算新的到期时间
      let newExpiresAt: Date;
      const currentExpiresAt = user.memberExpiresAt ? new Date(user.memberExpiresAt) : null;
      const now = new Date();

      if (currentExpiresAt && currentExpiresAt > now) {
        // 续期
        newExpiresAt = new Date(currentExpiresAt.getTime() + activationCode.durationDays * 24 * 60 * 60 * 1000);
      } else {
        // 新开通
        newExpiresAt = new Date(now.getTime() + activationCode.durationDays * 24 * 60 * 60 * 1000);
      }

      // 更新激活码状态
      lockedCode.isUsed = true;
      lockedCode.usedBy = userId;
      lockedCode.usedAt = now;
      await manager.save(lockedCode);

      // 更新用户会员状态
      user.memberLevel = activationCode.memberLevel;
      user.memberExpiresAt = newExpiresAt;
      await manager.save(user);

      return {
        memberLevel: user.memberLevel,
        memberExpiresAt: user.memberExpiresAt,
        message: `激活成功! 会员已延长至 ${user.memberExpiresAt.toLocaleDateString()}`,
      };
    });

    this.logger.info(`[Activation] Success: User ${userId} activated code ${code}. New Level: ${result.memberLevel}, Expires: ${result.memberExpiresAt}`);
    return result;
  }
}
