import { Module } from '@nestjs/common';
import { DietPlansController } from './diet-plans.controller';
import { DietPlansService } from './diet-plans.service';
import { EntitiesModule } from '@/database/entities.module';
import { FoodItemModule } from '../food-items/food-items.module';

@Module({
  imports: [EntitiesModule, FoodItemModule],
  controllers: [DietPlansController],
  providers: [DietPlansService],
  exports: [DietPlansService],
})
export class DietPlansModule {}
