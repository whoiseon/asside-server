import { LoginParams, RegisterParams } from 'src/services/user/user.type';
import db from 'src/lib/database';
import bcrypt from 'bcrypt';
import { Context } from 'koa';
import { generateToken } from 'src/lib/tokens';
import { User } from '@prisma/client';

class UserService {
  private static instance: UserService;

  public static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  static SALT_ROUNDS: number = 10;

  async generateTokens(user: User) {
    const { id: userId, email, username } = user;
    const [accessToken, refreshToken] = await Promise.all([
      generateToken({
        type: 'access_token',
        userId,
        tokenId: 1,
        email,
        username,
      }),
      generateToken({
        type: 'refresh_token',
        tokenId: 1,
        rotationCounter: 0,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(ctx: Context, params: RegisterParams) {
    const { username, email, password } = params;
    const exists = await db.user.findUnique({
      where: {
        username,
      },
    });

    if (exists) {
      ctx.throw(409, 'UsernameExists');
    }

    const passwordHash = await bcrypt.hash(password, UserService.SALT_ROUNDS);
    const createdUser = await db.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
    });

    return { createdUser };
  }

  async login(ctx: Context, params: LoginParams) {
    const { email, password } = params;
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      ctx.throw(401, 'AuthenticationError');
    }

    const { passwordHash, ...userInfo } = user;
    const isPasswordCorrect = await bcrypt.compare(password, passwordHash);

    if (!isPasswordCorrect) {
      ctx.throw(401, 'AuthenticationError');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: userInfo,
      tokens,
    };
  }
}

export default UserService;
