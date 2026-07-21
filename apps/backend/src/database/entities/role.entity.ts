import { Entity, Column, Index, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('roles')
@Index(['name'], { unique: true })
export class Role extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'varchar', enum: ['super_admin', 'admin', 'support', 'finance', 'partner', 'partner_manager', 'delivery', 'customer'] })
  type: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}

@Entity('permissions')
@Index(['resource', 'action'])
export class Permission extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  resource: string;

  @Column()
  action: string;

  @Column({ default: true })
  isActive: boolean;
}


