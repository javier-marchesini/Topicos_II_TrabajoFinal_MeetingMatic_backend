import {belongsTo, Entity, model, property} from '@loopback/repository';
import {EventAlternative} from '.';
import {Meeting} from './meeting.model';
import {UserUnregistered} from './user-unregistered.model';

@model({settings: {strict: false}})
export class MeetingMatch extends Entity {
    @property({
        type: 'string',
        id: true,
        generated: true,
    })
    id?: string;

    @property.array(EventAlternative)
    alternativesMatched: EventAlternative[];

    @property({
        type: 'date',
    })
    creationDate?: Date;

    @belongsTo(() => UserUnregistered)
    userUnregisteredId?: string;

    @belongsTo(() => Meeting)
    meetingId: string;

    [prop: string]: any;

    constructor(data?: Partial<MeetingMatch>) {
        super(data);
    }
}

export interface MeetingMatchRelations {
    // describe navigational properties here
}

export type MeetingMatchWithRelations = MeetingMatch & MeetingMatchRelations;
