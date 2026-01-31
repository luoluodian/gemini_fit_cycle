import { User } from '@/database/entity/user.entity';
import { UserResponseDto } from '@/dtos/user.dto';

/**
 * User → UserResponseDto
 * 从 User 和 HealthProfile 聚合数据
 */
export class UserTransformer {
  static toResponse(user: User | null | undefined): UserResponseDto | null {
    if (!user) return null;

    const profile = user.healthProfile;

    // 资料是否填写完整
    const isCompleted = !!(profile && profile.height && profile.weight && profile.gender && profile.birthday);

    return {
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      
      // 从 HealthProfile 获取
      dateOfBirth: profile?.birthday ?? undefined,
      heightCm: profile ? Number(profile.height) : undefined,
      weightKg: profile ? Number(profile.weight) : undefined,
      genderText: profile?.gender === 'male' ? '男' : (profile?.gender === 'female' ? '女' : undefined),
      genderId: profile?.gender === 'male' ? 1 : (profile?.gender === 'female' ? 2 : undefined),
      
      activityLevelId: 1, // TODO: 反向映射
      activityLevelText: String(profile?.activityLevel ?? 1.2),

      isCompleted,
    };
  }
}