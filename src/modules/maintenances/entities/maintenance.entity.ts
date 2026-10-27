import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Mechanic } from '../../mechanics/entities/mechanic.entity';
import { Workshop } from '../../workshops/entities/workshop.entity';

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'maintenances' })
export class Maintenance {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'enum',
    enum: MaintenanceType,
  })
  type: MaintenanceType;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  mileage: number;

  @Column({ type: 'timestamp with time zone', name: 'scheduled_date' })
  scheduledDate: Date;

  @Column({ type: 'int', default: 2, name: 'estimated_duration_hours' })
  estimatedDurationHours: number;

  @Column({
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.SCHEDULED,
  })
  status: MaintenanceStatus;

  // Relaciones requeridas por el enunciado
  @ManyToOne(() => Vehicle, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => Mechanic, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'mechanic_id' })
  mechanic: Mechanic;

  @ManyToOne(() => Workshop, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'workshop_id' })
  workshop: Workshop;

  // Campos de cierre (obligatorios al finalizar a COMPLETED)
  @Column({ type: 'text', nullable: true, name: 'work_done' })
  workDone: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, name: 'final_cost' })
  finalCost: number;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'finished_at' })
  finishedAt: Date;

  @Column({ type: 'int', nullable: true, name: 'final_mileage' })
  finalMileage: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
