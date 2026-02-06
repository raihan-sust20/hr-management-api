import { Knex } from 'knex';
import { injectable, inject } from 'tsyringe';
import DatabaseConfig from '../../config/database.config';
import { IPaginationQuery, IPaginationMeta } from '../types/common.type';

export interface IBaseRepository<T> {
  findAll(pagination?: IPaginationQuery): Promise<{ data: T[]; meta: IPaginationMeta }>;
  findById(id: number): Promise<T | undefined>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T | undefined>;
  delete(id: number): Promise<boolean>;
}

// @injectable()
export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected db: Knex;
  protected abstract tableName: string;

  constructor(@inject(DatabaseConfig) protected dbConfig: DatabaseConfig) {
    this.db = dbConfig.getConnection();
  }

  protected get table(): Knex.QueryBuilder {
    return this.db(this.tableName);
  }

  public async findAll(
    pagination?: IPaginationQuery
  ): Promise<{ data: T[]; meta: IPaginationMeta }> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = (page - 1) * limit;

    let query = this.table.select('*');

    // Apply sorting
    if (pagination?.sortBy) {
      query = query.orderBy(pagination.sortBy, pagination.sortOrder || 'asc');
    }

    // Get total count
    const [{ count }] = await this.table.count('* as count');
    const total = parseInt(count as string, 10);

    // Apply pagination
    const data = await query.limit(limit).offset(offset);

    const meta: IPaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return { data: data as T[], meta };
  }

  public async findById(id: number): Promise<T | undefined> {
    const result = await this.table.where({ id }).first();
    return result as T | undefined;
  }

  public async create(data: Partial<T>): Promise<T> {
    const [result] = await this.table.insert(data).returning('*');
    return result as T;
  }

  public async update(id: number, data: Partial<T>): Promise<T | undefined> {
    const [result] = await this.table
      .where({ id })
      .update({
        ...data,
        updated_at: this.db.fn.now(),
      })
      .returning('*');
    return result as T | undefined;
  }

  public async delete(id: number): Promise<boolean> {
    const deleted = await this.table.where({ id }).delete();
    return deleted > 0;
  }

  protected async findOne(conditions: Partial<T>): Promise<T | undefined> {
    const result = await this.table.where(conditions).first();
    return result as T | undefined;
  }

  protected async findMany(conditions: Partial<T>): Promise<T[]> {
    const results = await this.table.where(conditions);
    return results as T[];
  }

  protected async exists(conditions: Partial<T>): Promise<boolean> {
    const result = await this.table.where(conditions).first();
    return !!result;
  }
}
