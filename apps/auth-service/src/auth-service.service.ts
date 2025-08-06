import { ConfigService } from '@app/config';
import { User } from '@app/database/entities/user.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CustomRpcException } from '@app/shared/exceptions/custom-rpc.exception';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.request.dto';
import { LoginRequestDto } from '@app/shared/dtos/auth/login.request.dto';
import { LoginResponseDto } from '@app/shared/dtos/auth/login.response.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from '@app/shared/dtos/auth/jwt.payload.dto';
import { RoleEnum } from '@app/shared/enums/role.enum';
import { Role } from '@app/database/entities/role.entity';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { RedisService } from '@app/redis';
import { AuthProviderEnum } from '@app/shared/enums/auth.enum';
import { AuthProvider } from '@app/database/entities/auth-provider.entity';
import { GoogleUserDto } from '@app/shared/dtos/auth/google-user.dto';

@Injectable()
export class AuthServiceService {
  private customerRoleId: number | null = null;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(AuthProvider)
    private readonly authProviderRepository: Repository<AuthProvider>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async login(
    data: LoginRequestDto,
  ): Promise<CustomApiResponse<LoginResponseDto>> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: data.email },
        select: ['id', 'fullName', 'email', 'password'],
      });
      if (!user)
        throw new CustomRpcException('User not found', HttpStatus.NOT_FOUND);

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password,
      );
      if (!isPasswordValid)
        throw new CustomRpcException(
          'Invalid password',
          HttpStatus.UNAUTHORIZED,
        );

      const payload: JwtPayloadDto = {
        id: user.id,
      };

      return new CustomApiResponse<LoginResponseDto>(
        HttpStatus.OK,
        'Login successful',
        {
          accessToken: await this.jwtService.signAsync(payload),
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
          },
        },
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async loginWithGoogle(
    data: GoogleUserDto,
  ): Promise<CustomApiResponse<LoginResponseDto>> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email },
        relations: ['authProviders'],
      });

      if (!existingUser) {
        const roleId = await this.getCustomerRoleId();
        const newUser = this.userRepository.create({
          fullName: `${data.firstName} ${data.lastName}`,
          email: data.email,
          profilePicture: data.picture,
          isEmailVerified: true,
          isActive: true,
          role: { id: roleId } as Role,
          authProviders: [
            {
              provider: AuthProviderEnum.GOOGLE,
              providerId: data.id,
            } as AuthProvider,
          ],
        });
        const savedUser = await this.userRepository.save(newUser);

        const payload: JwtPayloadDto = {
          id: savedUser.id,
        };

        return new CustomApiResponse<LoginResponseDto>(
          HttpStatus.CREATED,
          'User registered successfully',
          {
            accessToken: await this.jwtService.signAsync(payload),
            user: {
              id: savedUser.id,
              fullName: savedUser.fullName,
              email: savedUser.email,
            },
          },
        );
      }

      if (!existingUser.isActive || existingUser.isDeleted) {
        throw new CustomRpcException(
          'User is not active or has been deleted',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const isLinkedWithGoogle = existingUser.authProviders.some(
        (provider) =>
          provider.provider === AuthProviderEnum.GOOGLE &&
          provider.providerId === data.id,
      );

      if (!isLinkedWithGoogle) {
        existingUser.isEmailVerified = true;
        existingUser.profilePicture = data.picture;
        existingUser.authProviders.push({
          provider: AuthProviderEnum.GOOGLE,
          providerId: data.id,
        } as AuthProvider);
        await this.userRepository.save(existingUser);
      }

      const payload: JwtPayloadDto = {
        id: existingUser.id,
      };
      return new CustomApiResponse<LoginResponseDto>(
        HttpStatus.OK,
        'Login successful',
        {
          accessToken: await this.jwtService.signAsync(payload),
          user: {
            id: existingUser.id,
            fullName: existingUser.fullName,
            email: existingUser.email,
          },
        },
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async register(data: RegisterRequestDto): Promise<CustomApiResponse<void>> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email },
      });
      if (existingUser)
        throw new CustomRpcException(
          'Email already exists',
          HttpStatus.CONFLICT,
        );

      const passwordHashed = await bcrypt.hash(
        data.password,
        this.configService.get('password_salt_rounds'),
      );

      const roleId = await this.getCustomerRoleId();

      const newUser = this.userRepository.create({
        fullName: data.fullName,
        email: data.email,
        password: passwordHashed,
        role: {
          id: roleId,
        } as Role,
        authProviders: [
          {
            provider: AuthProviderEnum.LOCAL,
            providerId: data.email,
          } as AuthProvider,
        ],
      });

      await this.userRepository.save(newUser);

      await this.redisService.del('users');

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'Registration successful',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  private async getCustomerRoleId(): Promise<number> {
    if (this.customerRoleId !== null) return this.customerRoleId;

    const role = await this.roleRepository.findOne({
      where: { name: RoleEnum.CUSTOMER },
    });

    if (!role) {
      throw new CustomRpcException(
        'Customer role not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.customerRoleId = role.id;
    return this.customerRoleId;
  }
}
