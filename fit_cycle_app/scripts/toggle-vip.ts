/**
 * 开发者工具：切换 VIP 状态
 * 用法：npx ts-node fit_cycle_app/scripts/toggle-vip.ts [userId] [level]
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/modules/user/user.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  const userId = process.argv[2];
  const level = process.argv[3] || '1';

  if (!userId) {
    console.error('请提供用户 ID: npm run toggle-vip -- [userId] [level]');
    await app.close();
    return;
  }

  const user = await userService.userRepository.findOne({ where: { id: Number(userId) } });
  if (!user) {
    console.error('用户不存在');
  } else {
    user.memberLevel = Number(level);
    if (user.memberLevel === 1) {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      user.memberExpiresAt = expiresAt;
    }
    await userService.userRepository.save(user);
    console.log(`✅ 用户 ${user.nickname} (ID: ${userId}) 等级已更新为: ${level === '1' ? 'VIP' : '普通用户'}`);
  }

  await app.close();
}

bootstrap();
