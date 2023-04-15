import { RegisterParams } from 'src/services/user/user.type';
import db from 'src/lib/database';
import bcrypt from 'bcrypt';
import { ExtendableContext } from 'koa';

class UserService {
  private static instance: UserService;

  public static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  static SALT_ROUNDS: number = 10;

  async register(ctx: ExtendableContext, params: RegisterParams) {
    const { username, email, password } = params;
    try {
      const exists = await db.user.findUnique({
        where: {
          username,
        },
      });

      if (exists) {
        ctx.status = 409;
        ctx.body = {
          message: 'Username already exists',
        };
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
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        message: 'Internal server error',
      };
    }
  }

  login() {
    return 'logged in!';
  }
}

export default UserService;
