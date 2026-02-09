import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  console.log('🚀 [DB SQL Inject] Initializing context...');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const dataSource = app.get(DataSource);
    console.log('📡 Connected. Running targeted SQL fixes...');
    
    // 1. 修复 plan_days 缺失字段
    console.log('🔧 Checking plan_days.is_configured...');
    try {
      await dataSource.query("ALTER TABLE `plan_days` ADD `is_configured` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已配置完成'");
      console.log('✅ Successfully added is_configured to plan_days.');
    } catch (e) {
      if (e.message.includes('Duplicate column name')) {
        console.log('ℹ️ Field is_configured already exists.');
      } else {
        throw e;
      }
    }

    // 2. 额外修复：确保 plan_shares 表存在（根据之前报错推测可能缺失）
    console.log('🔧 Ensuring plan_shares table exists...');
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS \`plan_shares\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`code\` varchar(50) NOT NULL COMMENT '分享码',
        \`plan_id\` bigint NOT NULL,
        \`user_id\` bigint NOT NULL,
        \`expire_at\` timestamp NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UK_PLAN_SHARE_CODE\` (\`code\`)
      ) ENGINE=InnoDB;
    `);
    console.log('✅ plan_shares table checked/created.');

    console.log('🎊 ALL TARGETED SQL FIXES COMPLETED!');
  } catch (error) {
    console.error('❌ SQL Execution failed:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();