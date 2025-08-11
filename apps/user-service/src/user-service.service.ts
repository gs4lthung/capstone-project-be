import { CloudinaryService } from '@app/cloudinary';
import { User } from '@app/database/entities/user.entity';
import { CreateUserDto } from '@app/shared/dtos/users/create-user.dto';
import { CustomRpcException } from '@app/shared/exceptions/custom-rpc.exception';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@app/config';
import { Role } from '@app/database/entities/role.entity';
import { RoleEnum } from '@app/shared/enums/role.enum';

@Injectable()
export class UserServiceService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async createUser(data: CreateUserDto): Promise<CustomApiResponse<void>> {
    try {
      const passwordHashed = await bcrypt.hash(
        data.password,
        this.configService.get('password_salt_rounds'),
      );

      const customerRole = await this.roleRepository.findOne({
        where: { name: RoleEnum.CUSTOMER },
      });
      const user = this.userRepository.create({
        fullName: data.fullName,
        email: data.email,
        password: passwordHashed,
        role: data.role ? data.role : customerRole,
        isActive: true,
        isEmailVerified: true,
      });
      await this.userRepository.save(user);
      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'USER.CREATE_USER_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        where: { isActive: true },
      });
      return users;
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: id, isActive: true },
      });

      if (!user)
        throw new CustomRpcException('User not  found', HttpStatus.NOT_FOUND);

      return user;
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async updateUserAvatar(
    id: number,
    file: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    try {
      const res = await this.cloudinaryService.uploadFile(file);
      await this.userRepository.update(id, {
        profilePicture: res.url,
      });
      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'USER.UPDATE_USER_AVATAR_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
