import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Wallet } from './wallet.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('banks')
export class Bank {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 10 })
  bin: string;

  @Field(() => [Wallet], { nullable: true })
  @OneToMany(() => Wallet, (wallet) => wallet.bank)
  wallets: Wallet[];
}

@ObjectType()
export class PaginatedBank extends PaginatedResource(Bank) {}
