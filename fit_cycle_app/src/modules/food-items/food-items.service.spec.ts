import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FoodItemsService } from './food-items.service';
import { FoodItem, FoodCategory } from '@/database/entity/food-item.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { FoodType } from '@/database/entity/food-item.entity';

describe('FoodItemsService', () => {
  let service: FoodItemsService;
  let repo: Repository<FoodItem>;

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  };

  const mockRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    exists: jest.fn(),
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
          useValue: mockRepo,
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
    repo = module.get<Repository<FoodItem>>(getRepositoryToken(FoodItem));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return paginated results with default parameters', async () => {
      const result = await service.list({});

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('food');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(result).toEqual({ total: 0, page: 1, pageSize: 20, items: [] });
    });

    it('should apply keyword filter when q is provided', async () => {
      await service.list({ q: 'apple' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(food.name LIKE :q OR food.description LIKE :q)',
        { q: '%apple%' },
      );
    });

    it('should apply category filter when category is provided', async () => {
      await service.list({ category: FoodCategory.FRUITS });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'food.category = :category',
        { category: FoodCategory.FRUITS },
      );
    });

    it('should apply custom pagination', async () => {
      await service.list({ page: 2, pageSize: 10 });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should combine multiple filters correctly', async () => {
      await service.list({ q: 'egg', category: FoodCategory.PROTEIN });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(food.name LIKE :q OR food.description LIKE :q)',
        { q: '%egg%' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'food.category = :category',
        { category: FoodCategory.PROTEIN },
      );
    });
  });

  describe('detail', () => {
    it('should return a food item if found', async () => {
      const mockItem = { id: 1, name: 'Apple' };
      mockRepo.findOne.mockResolvedValue(mockItem);

      const result = await service.detail(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockItem);
    });

    it('should throw NotFoundException if item is not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.detail(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new custom food item', async () => {
      const dto = { name: 'New Food', unit: 'g', calories: 100, protein: 10, fat: 5, carbs: 20 };
      const userId = 1;
      
      mockRepo.findOne.mockResolvedValue(null); // No duplicate name
      mockRepo.create.mockReturnValue({ ...dto, id: 1, type: FoodType.CUSTOM, userId });
      mockRepo.save.mockResolvedValue({ ...dto, id: 1, type: FoodType.CUSTOM, userId });

      const result = await service.create(userId, dto as any);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { name: dto.name } });
      expect(mockRepo.create).toHaveBeenCalled();
      expect(result.userId).toBe(userId);
    });

    it('should throw ConflictException if name exists', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, name: 'Exist' });
      await expect(service.create(1, { name: 'Exist' } as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update food item if user is creator', async () => {
      const item = { id: 1, userId: 1, name: 'Old' };
      const dto = { name: 'New' };
      
      mockRepo.findOne.mockResolvedValueOnce(item); // First call to find the item
      mockRepo.findOne.mockResolvedValueOnce(null); // Second call to check name duplicate
      mockRepo.save.mockResolvedValue({ ...item, ...dto });

      const result = await service.update(1, 1, dto as any);
      expect(result.name).toBe('New');
    });

    it('should throw ForbiddenException if user is not creator', async () => {
      const item = { id: 1, userId: 2, name: 'Old' };
      mockRepo.findOne.mockResolvedValue(item);

      await expect(service.update(1, 1, { name: 'New' } as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should remove food item if user is creator', async () => {
      const item = { id: 1, userId: 1 };
      mockRepo.findOne.mockResolvedValue(item);
      mockRepo.remove.mockResolvedValue(true);

      const result = await service.delete(1, 1);
      expect(result.success).toBe(true);
      expect(mockRepo.remove).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user tries to delete others food', async () => {
      const item = { id: 1, userId: 2 };
      mockRepo.findOne.mockResolvedValue(item);

      await expect(service.delete(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });
});