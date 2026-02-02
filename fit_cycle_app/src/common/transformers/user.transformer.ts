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
      user: {
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        email: user.email ?? undefined,
        phone: user.phone ?? undefined,
        isCompleted,
      },
      health: {
        genderId: profile?.gender === 'male' ? 1 : (profile?.gender === 'female' ? 2 : undefined),
        genderText: profile?.gender === 'male' ? '男' : (profile?.gender === 'female' ? '女' : undefined),
        heightCm: profile ? Number(profile.height) : undefined,
        weightKg: profile ? Number(profile.weight) : undefined,
        dateOfBirth: profile?.birthday ?? undefined,
        activityLevelId: 1, // TODO: 从 profile.activityLevel 反向映射
        activityLevelText: String(profile?.activityLevel ?? 1.2),
        bmr: profile?.bmr,
        tdee: profile?.tdee,
      },
      stats: {
        totalDays: 0, // TODO: 从 DietLog 统计
        completedPlans: 0 // TODO: 从 DietPlan 统计
      }
    };
  }
}