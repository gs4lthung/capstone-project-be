import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Province } from './province.entity';
import { District } from './district.entity';
import { Course } from './course.entity';

@Entity('courts')
export class Court {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 25,
    nullable: true,
    unique: true,
  })
  @IsOptional()
  @IsPhoneNumber('VN')
  phoneNumber?: string;

  @Column({
    name: 'price_per_hour',
    type: 'numeric',
    precision: 15,
    scale: 3,
    default: 0,
  })
  @IsInt()
  @Min(1)
  pricePerHour: number;

  @Column({ name: 'public_url', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  publicUrl?: string;

  @Column({ name: 'address', type: 'text' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: false,
  })
  isActive: boolean;

  @Column({
    name: 'latitude',
    type: 'numeric',
    precision: 10,
    scale: 6,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a number' })
  latitude?: number;

  @Column({
    name: 'longitude',
    type: 'numeric',
    precision: 10,
    scale: 6,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  longitude?: number;

  @Index()
  @ManyToOne(() => Province, (province) => province.courts, {
    eager: true,
  })
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @Index()
  @ManyToOne(() => District, (district) => district.courts, {
    eager: true,
  })
  @JoinColumn({ name: 'district_id' })
  district: District;

  @OneToMany(() => Course, (course) => course.court)
  courses: Course[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
