import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../database/entity/user.entity';
import { HealthProfile } from '../../database/entity/health-profile.entity';
import { UpdateUserDto } from '@/dtos/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    public readonly userRepository: Repository<User>,
    @InjectRepository(HealthProfile)
    private readonly healthProfileRepository: Repository<HealthProfile>,
    private readonly dataSource: DataSource,
  ) {}

  async findOrCreateByOpenid(openId: string): Promise<User> {
    let user = await this.userRepository.findOne({ 
      where: { openId },
      relations: ['healthProfile'] 
    });

    if (!user) {
      user = this.userRepository.create({ openId });
      // 同时初始化空的健康档案
      const profile = this.healthProfileRepository.create();
      user.healthProfile = profile;
      
      await this.userRepository.save(user);
    }
    return user;
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { id },
      relations: ['healthProfile']
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.findUserById(id);
  }

  async updateMe(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 开启事务处理双表更新
    await this.dataSource.transaction(async (manager) => {
      // 1. 更新 User 表字段
      if (dto.nickname !== undefined || dto.avatarUrl !== undefined || dto.email !== undefined || dto.phone !== undefined) {
        user.nickname = dto.nickname ?? user.nickname;
        user.avatarUrl = dto.avatarUrl ?? user.avatarUrl;
        // user.email = dto.email; // 暂时如果 DTO 有 email 字段
        // user.phone = dto.phone;
        await manager.save(User, user);
      }

      // 2. 更新 HealthProfile 表字段
      let profile = user.healthProfile;
      if (!profile) {
        profile = this.healthProfileRepository.create({ userId: user.id });
      }

      if (dto.genderId !== undefined) profile.gender = dto.genderId === 1 ? 'male' : 'female'; // 假设 1=male, 2=female
      if (dto.heightCm !== undefined) profile.height = dto.heightCm;
      if (dto.weightKg !== undefined) profile.weight = dto.weightKg;
      if (dto.dateOfBirth !== undefined) profile.birthday = dto.dateOfBirth;
      if (dto.activityLevelId !== undefined) {
        // 简单映射：1->1.2, 2->1.375 等，或者直接传数值
        // 这里假设 DTO 传的是 ID，需要映射。暂且假设 1=1.2
        const activityMap = { 1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725, 5: 1.9 };
        profile.activityLevel = activityMap[dto.activityLevelId] || 1.2;
      }

      // 自动计算 BMR/TDEE
      this.calculateHealthMetrics(profile);

      await manager.save(HealthProfile, profile);
    });

    return this.findUserById(id) as Promise<User>;
  }

  /**
   * 计算 BMR 和 TDEE (Mifflin-St Jeor 公式)
   */
  private calculateHealthMetrics(profile: HealthProfile): void {
    if (profile.height && profile.weight && profile.birthday && profile.gender) {
      const age = new Date().getFullYear() - new Date(profile.birthday).getFullYear();
      let bmr = 10 * Number(profile.weight) + 6.25 * Number(profile.height) - 5 * age;
      bmr += profile.gender === 'male' ? 5 : -161;
      
      profile.bmr = Math.round(bmr);
      profile.tdee = Math.round(bmr * Number(profile.activityLevel || 1.2));
    }
  }
}
