import {Model, model, property} from '@loopback/repository';

@model()
export class EventAlternative extends Model {
  @property({
    type: 'date',
    required: true,
  })
  start: string;

  @property({
    type: 'date',
    required: true,
  })
  end: string;

  constructor(data?: Partial<EventAlternative>) {
    super(data);
  }
}

export interface EventAlternativeRelations {
  // describe navigational properties here
}

export type EventAlternativeWithRelations = EventAlternative & EventAlternativeRelations;
