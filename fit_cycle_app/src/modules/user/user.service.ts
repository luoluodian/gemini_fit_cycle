import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entity/user.entity';
import { UpdateUserDto } from '@/dtos/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    public readonly userRepository: Repository<User>,
  ) {}

  async findOrCreateByOpenid(openId: string): Promise<User> {
    let user = await this.userRepository.findOne({ where: { openId } });

    if (!user) {
      user = this.userRepository.create({ openId });
      await this.userRepository.save(user);
    }
    return user;
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findById(id: number): Promise<User | null> {
    return this.findUserById(id);
  }

  async updateMe(id: number, dto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, dto);
    const user = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}