import { User } from '@/database/entity/user.entity';
import { UserResponseDto } from '@/dtos/user.dto';

/**
 * User → UserResponseDto
 * 只返回必要字段，避免前端不需要的字段泄露
 */
export class UserTransformer {
  static toResponse(user: User | null | undefined): UserResponseDto | null {
    if (!user) return null;

    // 资料是否填写完整：只判断必要项
    const isCompleted =
      !!user.nickname &&
      !!user.genderId &&
      !!user.activityLevelId &&
      !!user.goalTypeId &&
      !!user.heightCm &&
      !!user.weightKg;
    // const isCompleted = false;

    return {
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,

      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      dateOfBirth: user.dateOfBirth ?? undefined,

      heightCm: user.heightCm ?? undefined,
      weightKg: user.weightKg ?? undefined,
      // targetWeightKg: user.targetWeightKg ?? undefined,
      // goalRate: user.goalRate ?? undefined,

      // 直接返回 id
      genderId: user.genderId ?? undefined,
      activityLevelId: user.activityLevelId ?? undefined,
      goalTypeId: user.goalTypeId ?? undefined,

      // 直接返回 text，前端展示更友好
      isCompleted,
    };
  }
}
