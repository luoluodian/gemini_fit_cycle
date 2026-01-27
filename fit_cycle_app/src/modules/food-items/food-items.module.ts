// src/modules/food-items/food-item.module.ts
import { Module } from '@nestjs/common';
import { EntitiesModule } from '@/database/entities.module';
import { FoodItemsController } from './food-items.controller';
import { FoodItemsService } from './food-items.service';

@Module({
  imports: [EntitiesModule],
  controllers: [FoodItemsController],
  providers: [FoodItemsService],
  exports: [FoodItemsService],
})
export class FoodItemModule {}
