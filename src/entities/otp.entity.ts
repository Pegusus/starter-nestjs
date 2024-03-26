import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OTP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  otp: string;

  @Column({ type: 'timestamp' })
  expiration_time: Date;

  @Column({ type: 'boolean', default: false, nullable: true })
  verified: boolean;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  updated_at: Date;
}
