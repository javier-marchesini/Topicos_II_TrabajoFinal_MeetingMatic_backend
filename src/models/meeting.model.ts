import {User} from '@loopback/authentication-jwt';
import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {EventAlternative} from './event-alternative.model';
import {MeetingMatch} from './meeting-match.model';
import {UserUnregistered} from './user-unregistered.model';

@model({settings: {strict: false}})
export class Meeting extends Entity {

    @property({
        type: 'string',
        id: true,
    })
    id: string;

    @property({
        type: 'string',
        required: true,
    })
    description: string;

    @property({
        type: 'string',
        required: true,
    })
    name: string;

    @property({
        type: 'string',
        required: true,
    })
    password: string;

    @property({
        type: 'string',
    })
    place?: string;

    @property({
        type: 'string',
    })
    privateSlug?: string;

    @property({
        type: 'String',
        default: new Date(),
    })
    creationDate?: Date;

    @property({
        type: 'String',
    })
    type?: string;

    @property({
        type: 'Boolean',
    })
    enable?: Boolean;

    @property.array(EventAlternative)
    alternatives: EventAlternative[];

    @belongsTo(() => UserUnregistered)
    userUnregisteredId?: string;

    @belongsTo(() => User)
    userAuthId?: string;

    @hasMany(() => MeetingMatch)
    meetingMatches?: MeetingMatch[];

    [prop: string]: any;

    constructor(data?: Partial<Meeting>) {
        super(data);
    }
}

export interface MeetingRelations {

    userUnregisteredId?: MeetingWithRelations;
    userAuthId?: MeetingWithRelations;
}

export type MeetingWithRelations = Meeting & MeetingRelations;
