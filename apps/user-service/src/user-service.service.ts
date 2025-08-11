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
      const isUserExists = await this.userRepository.findOne({
        where: { email: data.email },
      });

      if (isUserExists) {
        throw new CustomRpcException(
          'USER.ALREADY_EXISTS',
          HttpStatus.CONFLICT,
        );
      }

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
        withDeleted: false,
      });
      return users;
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: id },
        withDeleted: false,
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

  async softDeleteUser(id: number): Promise<CustomApiResponse<void>> {
    try {
      const isUserExists = await this.userRepository.findOne({
        where: { id: id },
      });

      if (!isUserExists) {
        throw new CustomRpcException('USER.NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      await this.userRepository.softDelete(id);
      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'USER.DELETE_USER_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async deleteUser(id: number): Promise<CustomApiResponse<void>> {
    try {
      const isUserExists = await this.userRepository.findOne({
        where: { id: id },
      });

      if (!isUserExists) {
        throw new CustomRpcException('USER.NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      await this.userRepository.delete(id);
      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'USER.DELETE_USER_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async restoreUser(id: number): Promise<CustomApiResponse<void>> {
    try {
      const isUserExists = await this.userRepository.findOne({
        where: { id: id },
        withDeleted: true,
      });

      if (!isUserExists) {
        throw new CustomRpcException('USER.NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      await this.userRepository.restore(id);
      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'USER.RESTORE_USER_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
