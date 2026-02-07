import { injectable } from 'tsyringe';
import { BaseRepository } from '../../common/utils/base.repository';
import { IEmployee, ICreateEmployeeData } from './employee.type';

@injectable()
export class EmployeeRepository extends BaseRepository<IEmployee> {
  protected tableName = 'employees';

  public async createEmployee(employeeData: ICreateEmployeeData): Promise<IEmployee> {
    const employee = await this.create(employeeData as Partial<IEmployee>);
    return employee;
  }

  public async updatePhotoPath(id: number, photoPath: string): Promise<IEmployee | undefined> {
    const updated = await this.update(id, { photo_path: photoPath } as Partial<IEmployee>);
    return updated;
  }

  public async findByIdWithDetails(id: number): Promise<IEmployee | undefined> {
    return await this.findById(id);
  }

  public async updateEmployee(
    id: number,
    updateData: Partial<IEmployee>
  ): Promise<IEmployee | undefined> {
    return await this.update(id, updateData);
  }
}
