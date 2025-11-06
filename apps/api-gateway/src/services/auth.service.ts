import { ConfigService } from '@app/config';
import { AuthProvider } from '@app/database/entities/auth-provider.entity';
import { Role } from '@app/database/entities/role.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { GoogleUserDto } from '@app/shared/dtos/auth/google-user.dto';
import { JwtPayloadDto } from '@app/shared/dtos/auth/jwt.payload.dto';
import {
  CurrentUserResponseDto,
  LoginRequestDto,
  LoginResponseDto,
} from '@app/shared/dtos/auth/login.dto';
import { RegisterRequestDto } from '@app/shared/dtos/auth/register.dto';
import { ResetPasswordDto } from '@app/shared/dtos/auth/reset-password.dto';
import {
  HttpStatus,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { AuthProviderEnum } from '@app/shared/enums/auth.enum';
import { MailSendDto } from '@app/shared/dtos/mails/mail-send.dto';
import { UserRole } from '@app/shared/enums/user.enum';
import { MailService } from './mail.service';
import { Learner } from '@app/database/entities/learner.entity';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  private customerRoleId: number | null = null;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  //#region Login
  async login(
    data: LoginRequestDto,
  ): Promise<CustomApiResponse<LoginResponseDto>> {
    return await this.dataSource.transaction(async (manager) => {
      const user = await this.userRepository.findOne({
        where: { email: data.email },
        withDeleted: false,
        select: ['id', 'fullName', 'email', 'password'],
      });
      if (!user) throw new UnauthorizedException('Không tìm thấy tài khoản');

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password,
      );
      if (!isPasswordValid)
        throw new UnauthorizedException('Mật khẩu không chính xác');

      const payload: JwtPayloadDto = {
        id: user.id,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt').access_token.secret,
        expiresIn: this.configService.get('jwt').access_token.expiration,
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt').refresh_token.secret,
        expiresIn: this.configService.get('jwt').refresh_token.expiration,
      });

      const refreshTokenHash = await bcrypt.hash(
        refreshToken,
        this.configService.get('password_salt_rounds'),
      );
      user.refreshToken = refreshTokenHash;
      await manager.getRepository(User).save(user);

      return new CustomApiResponse<LoginResponseDto>(
        HttpStatus.OK,
        'AUTH.LOGIN_SUCCESS',
        {
          accessToken: accessToken,
          refreshToken: refreshToken,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          },
        },
      );
    });
  }

  async getCurrentUser(
    userId: number,
  ): Promise<CustomApiResponse<CurrentUserResponseDto>> {
    return await this.dataSource.transaction(async (manager) => {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        withDeleted: false,
        relations: ['role'],
        select: ['id', 'fullName', 'email', 'role'],
      });

      await manager.getRepository(User).save(user);
      const role = user.role;
      return new CustomApiResponse<CurrentUserResponseDto>(
        HttpStatus.OK,
        'AUTH.LOGIN_SUCCESS',
        {
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: {
              id: role.id,
              name: role.name,
              users: role.users,
            },
          },
        },
      );
    });
  }

  async refreshNewAccessToken(data: {
    refreshToken: string;
  }): Promise<CustomApiResponse<{ accessToken: string }>> {
    const payload: JwtPayloadDto = await this.jwtService.verifyAsync(
      data.refreshToken,
      {
        secret: this.configService.get('jwt').refresh_token.secret,
      },
    );

    const user = await this.userRepository.findOne({
      where: { id: payload.id },
      select: ['id', 'fullName', 'email', 'refreshToken'],
    });

    if (!user)
      throw new CustomRpcException('INVALID.TOKEN', HttpStatus.UNAUTHORIZED);

    const isMatch = await bcrypt.compare(data.refreshToken, user.refreshToken);
    if (!isMatch)
      throw new CustomRpcException('INVALID.TOKEN', HttpStatus.UNAUTHORIZED);

    const newAccessToken = await this.jwtService.signAsync(
      { id: user.id },
      {
        secret: this.configService.get('jwt').access_token.secret,
        expiresIn: this.configService.get('jwt').access_token.expiration,
      },
    );

    return new CustomApiResponse<{ accessToken: string }>(
      HttpStatus.OK,
      'AUTH.LOGIN',
      { accessToken: newAccessToken },
    );
  }

  async loginWithGoogle(data: GoogleUserDto): Promise<string> {
    return await this.dataSource.transaction(async (manager) => {
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email },
        withDeleted: false,
        relations: ['authProviders'],
      });

      if (!existingUser) {
        const roleId = await this.getLearnerRoleId();
        const newUser = this.userRepository.create({
          fullName: `${data.firstName} ${data.lastName}`,
          email: data.email,
          profilePicture: data.picture,
          isEmailVerified: true,
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

        return `${this.configService.get('front_end').url}/login?accessToken=${await this.jwtService.signAsync(payload)}`;
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
        await manager.getRepository(User).save(existingUser);
      }

      const payload: JwtPayloadDto = {
        id: existingUser.id,
      };
      return `${this.configService.get('front_end').url}/login?accessToken=${await this.jwtService.signAsync(payload)}`;
    });
  }
  //#endregion

  //#region Register
  async register(data: RegisterRequestDto): Promise<CustomApiResponse<void>> {
    return await this.dataSource.transaction(async (manager) => {
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email },
      });
      if (existingUser)
        throw new CustomRpcException(
          'USER.ALREADY_EXISTS',
          HttpStatus.CONFLICT,
        );

      const passwordHashed = await bcrypt.hash(
        data.password,
        this.configService.get('password_salt_rounds'),
      );

      const roleId = await this.getLearnerRoleId();

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
        learner: [
          {
            skillLevel: data.learner.skillLevel,
            learningGoal: data.learner.learningGoal,
            province: { id: data.learner.province },
            district: { id: data.learner.district },
          } as Learner,
        ],
      });

      const payload: JwtPayloadDto = {
        id: newUser.id,
      };
      const emailVerificationToken = await this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt').verify_email_token.secret,
        expiresIn: this.configService.get('jwt').verify_email_token.expiration,
      });

      newUser.emailVerificationToken = emailVerificationToken;

      await manager.getRepository(User).save(newUser);

      await this.sendVerificationEmail(newUser.email, emailVerificationToken);

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'AUTH.REGISTER_SUCCESS',
      );
    });
  }

  //#endregion

  //#region Email Verification

  async verifyEmail(data: { token: string }): Promise<string> {
    return await this.dataSource.transaction(async (manager) => {
      const payload = await this.jwtService.verifyAsync(data.token, {
        secret: this.configService.get('jwt').verify_email_token.secret,
      });
      const user = await this.userRepository.findOne({
        where: { id: payload.id, emailVerificationToken: data.token },
      });

      if (!user) {
        throw new CustomRpcException(
          'AUTH.INVALID_TOKEN',
          HttpStatus.UNAUTHORIZED,
        );
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      await manager.getRepository(User).save(user);

      return `${this.configService.get('front_end').url}`;
    });
  }

  async resendVerificationEmail(data: {
    email: string;
  }): Promise<CustomApiResponse<void>> {
    return await this.dataSource.transaction(async (manager) => {
      const user = await this.userRepository.findOne({
        where: { email: data.email, isEmailVerified: false },
      });

      if (!user) {
        throw new CustomRpcException(
          'AUTH.INVALID_VERIFICATION',
          HttpStatus.NOT_FOUND,
        );
      }

      const payload: JwtPayloadDto = {
        id: user.id,
      };
      const emailVerificationToken = await this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt').verify_email_token.secret,
        expiresIn: this.configService.get('jwt').verify_email_token.expiration,
      });

      user.emailVerificationToken = emailVerificationToken;
      await manager.getRepository(User).save(user);

      await this.sendVerificationEmail(user.email, emailVerificationToken);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'AUTH.EMAIL_SEND_SUCCESS',
      );
    });
  }

  private async sendVerificationEmail(
    email: string,
    emailVerificationToken: string,
  ): Promise<void> {
    this.mailService.sendMail({
      to: email,
      subject: 'Email Verification',
      text: 'Please verify your email address',
      template: './verify-mail',
      context: {
        verificationLink: `${this.configService.get('app').url}/api/${this.configService.get('app').version}/auth/verify-email?token=${emailVerificationToken}`,
      },
    } as MailSendDto);
  }

  //#endregion

  //#region Reset Password

  async requestResetPassword(data: {
    email: string;
  }): Promise<CustomApiResponse<void>> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: data.email },
        withDeleted: false,
      });

      if (!user) {
        throw new CustomRpcException(
          'AUTH.USER_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }

      const resetPasswordToken = await this.jwtService.signAsync(
        { id: user.id },
        {
          secret: this.configService.get('jwt').reset_password_token.secret,
          expiresIn:
            this.configService.get('jwt').reset_password_token.expiration,
        },
      );

      user.resetPasswordToken = resetPasswordToken;
      await this.userRepository.save(user);

      this.mailService.sendMail({
        to: user.email,
        subject: 'Reset Password',
        text: 'Please reset your password',
        template: './reset-password',
        context: {
          resetLink: `${this.configService.get('app').url}/api/${this.configService.get('app').version}/auth/reset-password?token=${resetPasswordToken}`,
        },
      } as MailSendDto);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'AUTH.RESET_PASSWORD_EMAIL_SENT',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async resetPassword(
    data: ResetPasswordDto,
  ): Promise<CustomApiResponse<void>> {
    try {
      const user = await this.userRepository.findOne({
        where: { resetPasswordToken: data.token },
        withDeleted: false,
      });

      if (!user) {
        throw new CustomRpcException(
          'AUTH.INVALID_TOKEN',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const passwordHashed = await bcrypt.hash(
        data.newPassword,
        this.configService.get('password_salt_rounds'),
      );
      user.password = passwordHashed;
      user.resetPasswordToken = null;
      await this.userRepository.save(user);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'AUTH.PASSWORD_RESET_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  //#endregion

  private async getLearnerRoleId(): Promise<number> {
    if (this.customerRoleId !== null) return this.customerRoleId;

    const role = await this.roleRepository.findOne({
      where: { name: UserRole.LEARNER },
    });

    if (!role) {
      throw new CustomRpcException(
        'Role not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.customerRoleId = role.id;
    return this.customerRoleId;
  }
}
