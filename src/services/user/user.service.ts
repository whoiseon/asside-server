import { RegisterParams } from 'src/services/user/user.type';
import db from 'src/lib/database';
import bcrypt from 'bcrypt';
import { Context } from 'koa';

class UserService {
  private static instance: UserService;

  public static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  static SALT_ROUNDS: number = 10;

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

  login() {
    return 'logged in!';
  }
}

export default UserService;
