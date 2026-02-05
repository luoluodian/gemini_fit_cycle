import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FoodItemsService } from './food-items.service';
import { FoodItem, FoodCategory, FoodType } from '@/database/entity/food-item.entity';
import { UserFavoriteFood } from '@/database/entity/user-favorite-food.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';

describe('FoodItemsService', () => {
  let service: FoodItemsService;
  let foodRepo: Repository<FoodItem>;
  let favoriteRepo: Repository<UserFavoriteFood>;

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getRawAndEntities: jest.fn().mockResolvedValue({ entities: [], raw: [] }),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  };

  const mockFoodRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    exists: jest.fn(),
  };

  const mockFavoriteRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodItemsService,
        {
          provide: getRepositoryToken(FoodItem),
          useValue: mockFoodRepo,
        },
        {
          provide: getRepositoryToken(UserFavoriteFood),
          useValue: mockFavoriteRepo,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockLogger,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<FoodItemsService>(FoodItemsService);
    foodRepo = module.get<Repository<FoodItem>>(getRepositoryToken(FoodItem));
    favoriteRepo = module.get<Repository<UserFavoriteFood>>(getRepositoryToken(UserFavoriteFood));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return paginated results', async () => {
      mockFavoriteRepo.find.mockResolvedValue([]);
      const result = await service.list({}, 1);

      expect(foodRepo.createQueryBuilder).toHaveBeenCalledWith('food');
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(result.items).toEqual([]);
    });

    it('should show isFavorite true for favorited items', async () => {
      const mockItems = [{ id: 1, name: 'Apple' }];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockItems, 1]);
      mockFavoriteRepo.find.mockResolvedValue([{ foodId: 1 }]);

      const result = await service.list({}, 1);
      expect(result.items[0].isFavorite).toBe(true);
    });
  });

  describe('favorite', () => {
    it('should add to favorites if food exists', async () => {
      mockFoodRepo.findOne.mockResolvedValue({ id: 1 });
      mockFavoriteRepo.findOne.mockResolvedValue(null);
      mockFavoriteRepo.create.mockReturnValue({ userId: 1, foodId: 1 });

      const result = await service.favorite(1, 1);
      expect(result.success).toBe(true);
      expect(mockFavoriteRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if food does not exist', async () => {
      mockFoodRepo.findOne.mockResolvedValue(null);
      await expect(service.favorite(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('unfavorite', () => {
    it('should delete favorite record', async () => {
      mockFavoriteRepo.delete.mockResolvedValue({ affected: 1 });
      const result = await service.unfavorite(1, 1);
      expect(result.success).toBe(true);
      expect(mockFavoriteRepo.delete).toHaveBeenCalledWith({ userId: 1, foodId: 1 });
    });
  });

  describe('getPopular', () => {
    it('should return top 10 items sorted by favorite count', async () => {
      const mockItems = [{ id: 1, name: 'Apple' }];
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities: mockItems, raw: [] });
      mockFavoriteRepo.find.mockResolvedValue([]);

      const result = await service.getPopular(1);

      expect(foodRepo.createQueryBuilder).toHaveBeenCalledWith('food');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalled();
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('food.id');
      expect(result[0].name).toBe('Apple');
    });
  });
});