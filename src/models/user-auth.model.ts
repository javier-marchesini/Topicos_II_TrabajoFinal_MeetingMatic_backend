import {User} from '@loopback/authentication-jwt';
import {model, property} from '@loopback/repository';


@model()
export class UserAuth extends User {

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
    password: string;

    @property({
        type: 'string',
        required: true,
    })
    name: string;

    @property({
        type: 'array',
        itemType: 'string',
    })
    accountType?: string;

    @property({
        type: 'array',
        itemType: 'string',
    })
    roles?: string[];

    @property({
        type: 'date',
    })
    creationDate?: Date;
}


export interface UserAuthRelations {
    // describe navigational properties here
}

export type UserAuthWithRelations = UserAuth &
    UserAuthRelations;


