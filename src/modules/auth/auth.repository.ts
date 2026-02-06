import { injectable } from 'tsyringe';
import { IHrUser, ICreateUserDto } from './auth.type';
import bcrypt from 'bcrypt';
import { BaseRepository } from '../../common/utils/base.repository';

@injectable()
export class AuthRepository extends BaseRepository<IHrUser> {
  protected tableName = 'hr_users';

  public async findByEmail(email: string): Promise<IHrUser | undefined> {
    return await this.findOne({ email } as Partial<IHrUser>);
  }

  public async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  public async emailExists(email: string): Promise<boolean> {
    return await this.exists({ email } as Partial<IHrUser>);
  }
}
