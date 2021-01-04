import {Entity, model, property} from '@loopback/repository';

@model()
export class UserUnregistered extends Entity {
    @property({
        type: 'string',
        id: true,
        generated: true,
    })
    id: string;

    @property({
        type: 'string',
        required: true,
    })
    name: string;

    @property({
        type: 'string',
        required: true,
    })
    email: string;

    @property({
        type: 'date',
    })
    creationDate?: Date;


    constructor(data?: Partial<UserUnregistered>) {
        super(data);
    }
}

export interface UserUnregisteredRelations {
    // describe navigational properties here
}

export type UserUnregisteredWithRelations = UserUnregistered & UserUnregisteredRelations;
