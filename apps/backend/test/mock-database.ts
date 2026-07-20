import { DataSource } from 'typeorm';

// Set mock environment variables for E2E tests
process.env.JWT_SECRET = 'e2e_jwt_secret_key_for_testing';
process.env.JWT_EXPIRATION = '3600s';
process.env.JWT_REFRESH_SECRET = 'e2e_jwt_refresh_secret_key_for_testing';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.THROTTLER_TTL = '60';
process.env.THROTTLER_LIMIT = '100';
process.env.DB_TYPE = 'postgres';


// Mock in-memory tables
export const tables: Record<string, any[]> = {
  User: [],
  Role: [
    { id: 'role-admin', type: 'admin', name: 'Admin' },
    { id: 'role-customer', type: 'customer', name: 'Customer' },
    { id: 'role-provider', type: 'provider', name: 'Provider' },
  ],
  Provider: [],
  Customer: [],
  Order: [],
  Subscription: [],
  Review: [],
  Address: [],
  ServiceArea: [],
  DeliverySlot: [],
  KitchenCapacity: [],
  Waitlist: [],
};

export function createMockQueryBuilder(tableName: string) {
  const qb = Object.create(mockQueryBuilder);
  qb._where = {};
  qb._tableName = tableName;
  return qb;
}

export const mockQueryBuilder: any = {
  _where: {},
  _tableName: 'User',
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockImplementation(function(this: any, queryStr: string, params: any) {
    if (params) {
      Object.assign(this._where, params);
    }
    return this;
  }),
  andWhere: jest.fn().mockImplementation(function(this: any, queryStr: string, params: any) {
    if (params) {
      Object.assign(this._where, params);
    }
    return this;
  }),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getOne: jest.fn().mockImplementation(function(this: any) {
    const records = tables[this._tableName] || [];
    const match = records.find(r => {
      return Object.keys(this._where).every(key => {
        return r[key] === this._where[key];
      });
    });
    if (match) {
      const result = { ...match };
      if (this._tableName === 'User') {
        const roleRecord = tables.Role.find(role => role.id === result.roleId || role.type === result.userType);
        if (roleRecord) {
          result.role = {
            ...roleRecord,
            permissions: roleRecord.permissions || []
          };
        }
      }
      return Promise.resolve(result);
    }
    return Promise.resolve(null);
  }),
  getMany: jest.fn().mockImplementation(function(this: any) {
    const records = tables[this._tableName] || [];
    const matches = records.filter(r => {
      return Object.keys(this._where).every(key => {
        return r[key] === this._where[key];
      });
    });
    const results = matches.map(m => {
      const result = { ...m };
      if (this._tableName === 'User') {
        const roleRecord = tables.Role.find(role => role.id === result.roleId || role.type === result.userType);
        if (roleRecord) {
          result.role = {
            ...roleRecord,
            permissions: roleRecord.permissions || []
          };
        }
      }
      return result;
    });
    return Promise.resolve(results);
  }),
  getRawOne: jest.fn().mockImplementation(() => Promise.resolve({ gmv: 5000, revenue: 600 })),
  getCount: jest.fn().mockImplementation(function(this: any) {
    const records = tables[this._tableName] || [];
    const matches = records.filter(r => {
      return Object.keys(this._where).every(key => {
        return r[key] === this._where[key];
      });
    });
    return Promise.resolve(matches.length);
  }),
  execute: jest.fn(),
};

export const mockEntityManager: any = {
  create: jest.fn((entityClass: any, plainObject: any) => {
    console.log('mockEntityManager.create called with:', {
      entityClassType: typeof entityClass,
      entityClassName: entityClass?.name,
      plainObject,
    });
    if (typeof entityClass === 'function') {
      const obj = Object.create(entityClass.prototype);
      Object.assign(obj, plainObject);
      return obj;
    }
    return plainObject;
  }),
  findOne: jest.fn((entityClass: any, options: any) => {
    const className = entityClass.name || entityClass.constructor.name;
    const records = tables[className] || [];
    const where = options?.where || {};
    
    const match = records.find(r => {
      return Object.keys(where).every(key => {
        return r[key] === where[key];
      });
    });
    
    if (match) {
      const result = { ...match };
      if (className === 'User') {
        const roleRecord = tables.Role.find(role => role.id === result.roleId || role.type === result.userType);
        if (roleRecord) {
          result.role = {
            ...roleRecord,
            permissions: roleRecord.permissions || []
          };
        }
      }
      return Promise.resolve(result);
    }
    return Promise.resolve(null);
  }),
  find: jest.fn((entityClass: any, options: any) => {
    const className = entityClass.name || entityClass.constructor.name;
    const records = tables[className] || [];
    const where = options?.where || {};
    
    const matches = records.filter(r => {
      return Object.keys(where).every(key => {
        return r[key] === where[key];
      });
    });
    
    const results = matches.map(m => {
      const result = { ...m };
      if (className === 'User') {
        const roleRecord = tables.Role.find(role => role.id === result.roleId || role.type === result.userType);
        if (roleRecord) {
          result.role = {
            ...roleRecord,
            permissions: roleRecord.permissions || []
          };
        }
      }
      return result;
    });
    
    return Promise.resolve(results);
  }),
  count: jest.fn((entityClass: any, options: any) => {
    const className = entityClass.name || entityClass.constructor.name;
    const records = tables[className] || [];
    const where = options?.where || {};
    
    const matches = records.filter(r => {
      return Object.keys(where).every(key => {
        return r[key] === where[key];
      });
    });
    
    return Promise.resolve(matches.length);
  }),
  save: jest.fn((targetOrEntity: any, entityOrOptions?: any) => {
    let entity: any;
    let className: string;
    
    if (typeof targetOrEntity === 'function' || typeof targetOrEntity === 'string') {
      entity = entityOrOptions;
      className = typeof targetOrEntity === 'function' ? targetOrEntity.name : targetOrEntity;
    } else {
      entity = targetOrEntity;
      className = entity?.constructor?.name || 'Unknown';
    }
    
    if (!entity) return Promise.resolve(entity);
    
    const saveSingle = (item: any) => {
      if (!tables[className]) {
        tables[className] = [];
      }
      if (!item.id) {
        item.id = `${className.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
      const idx = tables[className].findIndex(x => x.id === item.id);
      if (idx >= 0) {
        tables[className][idx] = item;
      } else {
        tables[className].push(item);
      }
      
      const result = { ...item };
      if (className === 'User') {
        const roleRecord = tables.Role.find(role => role.id === result.roleId || role.type === result.userType);
        if (roleRecord) {
          result.role = {
            ...roleRecord,
            permissions: roleRecord.permissions || []
          };
        }
      }
      return result;
    };

    if (Array.isArray(entity)) {
      return Promise.resolve(entity.map(saveSingle));
    }
    return Promise.resolve(saveSingle(entity));
  }),
  remove: jest.fn(),
  createQueryBuilder: jest.fn((entityClass?: any) => {
    const tableName = entityClass?.name || 'User';
    return createMockQueryBuilder(tableName);
  }),
  transaction: jest.fn((cb) => cb(mockEntityManager)),
  connection: {
    options: {
      type: 'postgres',
    },
    getMetadata: jest.fn((entity: any) => ({
      target: entity,
      columns: [],
      relations: [],
      propertiesMap: {},
    })),
  },
};

export const mockDataSource: any = {
  createEntityManager: () => mockEntityManager,
  manager: mockEntityManager,
  getRepository: jest.fn((entityClass) => ({
    create: jest.fn((plainObject) => mockEntityManager.create(entityClass, plainObject)),
    findOne: jest.fn((options) => mockEntityManager.findOne(entityClass, options)),
    find: jest.fn((options) => mockEntityManager.find(entityClass, options)),
    count: jest.fn((options) => mockEntityManager.count(entityClass, options)),
    save: jest.fn((entity) => mockEntityManager.save(entity)),
    remove: jest.fn((entity) => mockEntityManager.remove(entity)),
    createQueryBuilder: jest.fn(() => createMockQueryBuilder(entityClass.name)),
  })),
};

// Mock TypeOrmModule
jest.mock('@nestjs/typeorm', () => {
  const dummyModule = {
    global: true,
    module: class {},
    providers: [
      {
        provide: DataSource,
        useValue: mockDataSource,
      },
    ],
    exports: [DataSource],
  };

  return {
    TypeOrmModule: {
      forRoot: () => dummyModule,
      forRootAsync: () => dummyModule,
      forFeature: () => ({
        module: class {},
        providers: [],
        exports: [],
      }),
    },
  };
});
