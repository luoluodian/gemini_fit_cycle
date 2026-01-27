import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entity/user.entity';

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
      // Don't save here, let the caller decide when to save after potentially adding more user data
      // await this.userRepository.save(user); // Removed implicit save
    }
    return user;
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}