// import { Controller, Get, Query, Req } from '@nestjs/common';
// import { TodayDietService } from './today-diet.service';

// /**
//  * TodayDietController 提供获取指定日期饮食概览的接口。
//  *
//  * 该接口结合当前用户的激活饮食计划和当天所有饮食记录，返回目标摄入与实际摄入的对比信息。
//  */
// @Controller('today-diet')
// export class TodayDietController {
//   constructor(private readonly todayDietService: TodayDietService) {}

//   /**
//    * 获取当天或指定日期的饮食概览。
//    * 参数 date 可选，默认为当天日期。
//    */
//   @Get()
//   async getToday(@Req() req: any, @Query('date') date?: string) {
//     const userId = req.user?.id;
//     const theDate = date || new Date().toISOString().slice(0, 10);
//     return this.todayDietService.getTodayOverview(userId, theDate);
//   }
// }
