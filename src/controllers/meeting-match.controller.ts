import {inject} from '@loopback/core';
import {
    Count,
    CountSchema,
    Filter,
    FilterExcludingWhere,
    repository,
    Where
} from '@loopback/repository';
import {
    del, get,
    getModelSchemaRef, param,
    patch, post,
    put,
    requestBody
} from '@loopback/rest';
import {MeetingMatch, UserUnregistered} from '../models';
import {MeetingMatchRepository, UserUnregisteredRepository} from '../repositories';
import {MeetingService} from '../services/meeting.service';

export class MeetingMatchController {
    constructor(
        @repository(MeetingMatchRepository)
        public meetingMatchRepository: MeetingMatchRepository,
        @repository(UserUnregisteredRepository)
        public userUnregisteredRepository: UserUnregisteredRepository,
        @inject("MeetingService") protected _meetingService: MeetingService,
    ) { }

    @post('/meeting-matches', {
        responses: {
            '200': {
                description: 'MeetingMatch model instance',
                content: {'application/json': {schema: getModelSchemaRef(MeetingMatch), includeRelations: true, additionalProperties: true}},
            },
        },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(MeetingMatch, {
                        title: 'NewMeetingMatch',
                        exclude: ['id'],
                    }),
                },
            },
        })
        meetingMatch: Omit<MeetingMatch, 'id'>,
    ): Promise<MeetingMatch> {

        meetingMatch.creationDate = new Date();
        let user = new UserUnregistered();

        if (meetingMatch.additionalProp1.user != undefined) {
            user.name = meetingMatch.additionalProp1.user.name;
            user.email = meetingMatch.additionalProp1.user.email

            user = await this.userUnregisteredRepository.create(user);
            meetingMatch.userUnregisteredId = user.id;

        } else {
            throw new Error("No se registraron datos del usuario");
        }

        delete meetingMatch['additionalProp1'];

        let newMeetingMatch = await this.meetingMatchRepository.create(meetingMatch);

        let filter = {
            "include": [
                {
                    "relation": "userUnregistered",
                    "scope": {
                        "offset": 0,
                        "limit": 100,
                        "skip": 0
                    }
                },
                {
                    "relation": "meeting",
                    "scope": {
                        "include": [
                            {"relation": "userUnregistered"},
                            {"relation": "userAuth"}
                        ],
                        "offset": 0,
                        "limit": 100,
                        "skip": 0,
                        "fields": {
                            "privateSlug": false,
                            "alternatives": false,
                            "password": false,
                        },
                    },


                },
            ]
        };

        let meetingMatched = await this.meetingMatchRepository.findById(newMeetingMatch.id, filter);

        this._meetingService.sendEmailMeetingMatch(meetingMatched);

        return meetingMatched

    }

    @get('/meeting-matches/count', {
        responses: {
            '200': {
                description: 'MeetingMatch model count',
                content: {'application/json': {schema: CountSchema}},
            },
        },
    })
    async count(
        @param.where(MeetingMatch) where?: Where<MeetingMatch>,
    ): Promise<Count> {
        return this.meetingMatchRepository.count(where);
    }

    @get('/meeting-matches', {
        responses: {
            '200': {
                description: 'Array of MeetingMatch model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(MeetingMatch, {includeRelations: true}),
                        },
                    },
                },
            },
        },
    })
    async find(
        @param.filter(MeetingMatch) filter?: Filter<MeetingMatch>,
    ): Promise<MeetingMatch[]> {
        return this.meetingMatchRepository.find(filter);
    }

    @patch('/meeting-matches', {
        responses: {
            '200': {
                description: 'MeetingMatch PATCH success count',
                content: {'application/json': {schema: CountSchema}},
            },
        },
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(MeetingMatch, {partial: true}),
                },
            },
        })
        meetingMatch: MeetingMatch,
        @param.where(MeetingMatch) where?: Where<MeetingMatch>,
    ): Promise<Count> {
        return this.meetingMatchRepository.updateAll(meetingMatch, where);
    }

    @get('/meeting-matches/{id}', {
        responses: {
            '200': {
                description: 'MeetingMatch model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(MeetingMatch, {includeRelations: true}),
                    },
                },
            },
        },
    })
    async findById(
        @param.path.string('id') id: string,
        @param.filter(MeetingMatch, {exclude: 'where'}) filter?: FilterExcludingWhere<MeetingMatch>
    ): Promise<MeetingMatch> {
        return this.meetingMatchRepository.findById(id, filter);
    }

    @patch('/meeting-matches/{id}', {
        responses: {
            '204': {
                description: 'MeetingMatch PATCH success',
            },
        },
    })
    async updateById(
        @param.path.string('id') id: string,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(MeetingMatch, {partial: true}),
                },
            },
        })
        meetingMatch: MeetingMatch,
    ): Promise<void> {
        await this.meetingMatchRepository.updateById(id, meetingMatch);
    }

    @put('/meeting-matches/{id}', {
        responses: {
            '204': {
                description: 'MeetingMatch PUT success',
            },
        },
    })
    async replaceById(
        @param.path.string('id') id: string,
        @requestBody() meetingMatch: MeetingMatch,
    ): Promise<void> {
        await this.meetingMatchRepository.replaceById(id, meetingMatch);
    }

    @del('/meeting-matches/{id}', {
        responses: {
            '204': {
                description: 'MeetingMatch DELETE success',
            },
        },
    })
    async deleteById(@param.path.string('id') id: string): Promise<void> {
        await this.meetingMatchRepository.deleteById(id);
    }


    @get('/meeting-matches/meeting/{meetingId}', {
        responses: {
            '200': {
                description: 'MeetingMatch model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(MeetingMatch, {includeRelations: true}),
                    },
                },
            },
        },
    })
    async findByMeetingId(
        @param.path.string('meetingId') meetingId: string,
    ): Promise<MeetingMatch[]> {

        let filter = {
            "where": {meetingId: meetingId},
            "fields": {
                "creationDate": false,
                "id": false,
            },
            "include": [
                {
                    "relation": "userUnregistered",
                    "scope": {
                        "offset": 0,
                        "limit": 100,
                        "skip": 0
                    }
                },
            ],

        };

        return this.meetingMatchRepository.find(filter);
    }
}
