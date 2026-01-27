// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { DietPlan } from '@/database/entity/diet-plan.entity';
// import { DietLog } from '@/database/entity/diet-log.entity';

// /**
//  * TodayDietService 提供汇总用户在某一天的饮食计划与实际摄入的逻辑。
//  *
//  * 它会根据用户的激活计划和计划日配置，计算目标能量与宏量营养素，并统计该日所有饮食记录的摄入量，输出概览数据。
//  */
// @Injectable()
// export class TodayDietService {
//   constructor(
//     @InjectRepository(DietPlan)
//     private readonly planRepo: Repository<DietPlan>,
//     @InjectRepository(DietLog)
//     private readonly logRepo: Repository<DietLog>,
//   ) {}

//   /**
//    * 生成当前日期（YYYY-MM-DD）的饮食概览。
//    *
//    * @param userId 当前用户 ID
//    * @param date 要查询的日期（YYYY-MM-DD）
//    * @returns 包含目标值、摄入值和剩余值的概览对象
//    */
//   async getTodayOverview(userId: number, date: string) {
//     // 获取用户的激活计划
//     const plan = await this.planRepo.findOne({
//       where: { user: { id: userId }, isActive: true },
//       relations: {
//         planDays: true,
//       },
//     });
//     // 确定目标值：如果当天有特定 planDay，则使用 planDay，否则使用计划默认目标
//     let targetCalories: number | undefined;
//     let targetProtein: number | undefined;
//     let targetFat: number | undefined;
//     let targetCarbs: number | undefined;
//     if (plan) {
//       const day = plan.planDays?.find((d) => d.date === date);
//       if (day) {
//         targetCalories = day.targetCalories
//           ? parseFloat(day.targetCalories)
//           : undefined;
//         targetProtein = day.targetProtein
//           ? parseFloat(day.targetProtein)
//           : undefined;
//         targetFat = day.targetFat ? parseFloat(day.targetFat) : undefined;
//         targetCarbs = day.targetCarbs ? parseFloat(day.targetCarbs) : undefined;
//       } else {
//         targetCalories = plan.targetCalories
//           ? parseFloat(plan.targetCalories)
//           : undefined;
//         targetProtein = plan.targetProtein
//           ? parseFloat(plan.targetProtein)
//           : undefined;
//         targetFat = plan.targetFat ? parseFloat(plan.targetFat) : undefined;
//         targetCarbs = plan.targetCarbs
//           ? parseFloat(plan.targetCarbs)
//           : undefined;
//       }
//     }
//     // 统计今日摄入
//     const logs = await this.logRepo.find({
//       where: { user: { id: userId }, date },
//       relations: ['foodItem'],
//     });
//     let consumedCalories = 0;
//     let consumedProtein = 0;
//     let consumedFat = 0;
//     let consumedCarbs = 0;
//     for (const log of logs) {
//       const quantity = parseFloat(log.quantity as any);
//       if (log.calories) {
//         consumedCalories += parseFloat(log.calories as any);
//       } else if (log.foodItem) {
//         consumedCalories +=
//           quantity * parseFloat(log.foodItem.caloriesPerUnit as any);
//       }
//       if (log.protein) {
//         consumedProtein += parseFloat(log.protein as any);
//       } else if (log.foodItem) {
//         consumedProtein +=
//           quantity * parseFloat(log.foodItem.proteinPerUnit as any);
//       }
//       if (log.fat) {
//         consumedFat += parseFloat(log.fat as any);
//       } else if (log.foodItem) {
//         consumedFat += quantity * parseFloat(log.foodItem.fatPerUnit as any);
//       }
//       if (log.carbs) {
//         consumedCarbs += parseFloat(log.carbs as any);
//       } else if (log.foodItem) {
//         consumedCarbs +=
//           quantity * parseFloat(log.foodItem.carbsPerUnit as any);
//       }
//     }
//     // 计算剩余
//     const remaining = {
//       calories:
//         targetCalories !== undefined
//           ? targetCalories - consumedCalories
//           : undefined,
//       protein:
//         targetProtein !== undefined
//           ? targetProtein - consumedProtein
//           : undefined,
//       fat: targetFat !== undefined ? targetFat - consumedFat : undefined,
//       carbs:
//         targetCarbs !== undefined ? targetCarbs - consumedCarbs : undefined,
//     };
//     return {
//       date,
//       plan: plan
//         ? {
//             planId: plan.id,
//             targetCalories,
//             targetProtein,
//             targetFat,
//             targetCarbs,
//           }
//         : null,
//       consumed: {
//         calories: consumedCalories,
//         protein: consumedProtein,
//         fat: consumedFat,
//         carbs: consumedCarbs,
//       },
//       remaining,
//       planMeals: [], // 可扩展返回计划餐次
//       dietLogs: logs,
//     };
//   }
// }
