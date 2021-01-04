import {authenticate} from '@loopback/authentication';
import {UserRepository} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {
    Count,
    CountSchema,


    repository,
    Where
} from '@loopback/repository';
import {
    del, get,
    getModelSchemaRef, HttpErrors, param,
    patch, post,
    put,
    requestBody
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {ServiceKeys as keys} from '../keys/service-keys';
import {Meeting, UserUnregistered} from '../models';
import {AccountType} from '../models/account-type.enum';
import {MeetingType} from '../models/meeting-type.enum';
import {MeetingMatchRepository, MeetingRepository} from '../repositories';
import {UserUnregisteredRepository} from '../repositories/user-unregistered.repository';
import {EncryptDecrypt} from '../services/encrypt-decrypt.service';
import {MeetingService} from '../services/meeting.service';

export class MeetingControllerController {
    constructor(
        @repository(MeetingRepository)
        public meetingRepository: MeetingRepository,
        @repository(UserUnregisteredRepository)
        public userUnregisteredRepository: UserUnregisteredRepository,
        @inject("MeetingService") protected _meetingService: MeetingService,

        @repository(MeetingMatchRepository)
        public meetingMatchRepository: MeetingMatchRepository,

        @repository(UserRepository)
        protected userRepository: UserRepository,

    ) { }

    @post('/meetings', {
        responses: {
            '200': {
                description: 'Meeting model instance',
                content: {'application/json': {schema: getModelSchemaRef(Meeting), includeRelations: true, additionalProperties: true}},
            },
        },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Meeting, {
                        title: 'NewMeeting',
                        exclude: ['id'],
                    }),
                },
            },
        })
        meeting: Omit<Meeting, 'id'>,
    ): Promise<Meeting> {

        meeting.type = MeetingType.REGISTERED;
        meeting.enable = true;
        meeting.creationDate = new Date();

        let user = new UserUnregistered();

        if (meeting.additionalProp1.user != undefined) {
            user.name = meeting.additionalProp1.user.name;
            user.email = meeting.additionalProp1.user.email
            user.creationDate = new Date();

            user = await this.userUnregisteredRepository.create(user);
            meeting.userUnregisteredId = user.id;
            meeting.type = MeetingType.UNREGISTERED;

        } else {
            throw new Error("No se registraron datos del usuario");
        }

        delete meeting['additionalProp1'];
        meeting.privateSlug = new EncryptDecrypt(keys.MD5).Encrypt(new Date().getTime() + meeting.name + user.id);
        let newMeeting = await this.meetingRepository.create(meeting);

        this._meetingService.sendEmailNewMeeting(newMeeting, user);

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
            ]
        };

        return this.meetingRepository.findById(newMeeting.id, filter);

    }


    @get('/meetings/count', {
        responses: {
            '200': {
                description: 'Meeting model count',
                content: {'application/json': {schema: CountSchema}},
            },
        },
    })
    async count(
        @param.where(Meeting) where?: Where<Meeting>,
    ): Promise<Count> {
        return this.meetingRepository.count(where);
    }

    @get('/meetings', {
        responses: {
            '200': {
                description: 'Array of Meeting model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(Meeting, {includeRelations: true}),
                        },
                    },
                },
            },
        },
    })
    async find(): Promise<Meeting[]> {
        let filter = {
            "include": [
                {
                    "relation": "userUnregistered",

                },
                {
                    "relation": "userAuth",

                },
            ]
        };
        return this.meetingRepository.find(filter);
    }

    @patch('/meetings', {
        responses: {
            '200': {
                description: 'Meeting PATCH success count',
                content: {'application/json': {schema: CountSchema}},
            },
        },
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Meeting, {partial: true}),
                },
            },
        })
        meeting: Meeting,
        @param.where(Meeting) where?: Where<Meeting>,
    ): Promise<Count> {
        return this.meetingRepository.updateAll(meeting, where);
    }

    @get('/meetings/{id}', {
        responses: {
            '200': {
                description: 'Meeting model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(Meeting, {includeRelations: true}),
                    },
                },
            },
        },
    })
    async findById(
        @param.path.string('id') id: string,
    ): Promise<Meeting> {
        let filter = {
            "include": [
                {
                    "relation": "userUnregistered",

                },
                {
                    "relation": "userAuth",

                },
            ]
        };
        return this.meetingRepository.findById(id, filter);
    }


    @get('/meetings/simpledata/{id}', {
        responses: {
            '200': {
                description: 'Meeting model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(Meeting, {includeRelations: true}),
                    },
                },
            },
        },
    })
    async findSimpleDataById(
        @param.path.string('id') id: string,

    ): Promise<Meeting> {

        let filter = {
            "fields": {
                "privateSlug": false,
                "password": false,
                "place": false,
                "type": false,
                "userUnregisteredId": false,
                "alternatives": false

            },
        };
        return this.meetingRepository.findById(id, filter);
    }


    @get('/meetings/validate/{id}/{password}', {
        responses: {
            '200': {
                description: 'Meeting model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(Meeting, {includeRelations: true}),
                    },
                },
            },
        },
    })
    async findByIdValidatePassword(
        @param.path.string('id') id: string,
        @param.path.string('password') password: string
    ): Promise<Meeting> {

        let filter = {
            "fields": {
                "privateSlug": false
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
            ]
        };

        let meeting = await this.meetingRepository.findById(id, filter);

        if (meeting.password === password) {
            return meeting
        } else {
            throw new HttpErrors[400]("La password no corresponde a la meeting");
        }
    }



    @get('/meetings/slug/{privateSlug}', {
        responses: {
            '200': {
                description: 'Meeting model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(Meeting, {includeRelations: true}),
                    },
                },
            },
        },
    })
    async findByPrivateSlug(
        @param.path.string('privateSlug') privateSlugParameter: string,
    ): Promise<Meeting | null> {

        let filter = {
            "where": {
                "privateSlug": decodeURIComponent(privateSlugParameter),
            },
            "include": [
                {
                    "relation": "userUnregistered",
                },
            ]
        };

        let meeting = await this.meetingRepository.findOne(filter);

        if (!meeting) throw new HttpErrors[404]("This meeting does not exists!");
        return meeting

    }


    @authenticate('jwt')
    @patch('/meetings/{id}', {
        responses: {
            '204': {
                description: 'Meeting PATCH success',
            },
        },
    })
    async updateById(
        @param.path.string('id') id: string,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Meeting, {partial: true}),
                },
            },
        })
        meeting: Meeting,
    ): Promise<void> {
        await this.meetingRepository.updateById(id, meeting);
    }

    @authenticate('jwt')
    @put('/meetings/{id}', {
        responses: {
            '204': {
                description: 'Meeting PUT success',
            },
        },
    })
    async replaceById(
        @param.path.string('id') id: string,
        @requestBody() meeting: Meeting,
    ): Promise<void> {
        await this.meetingRepository.replaceById(id, meeting);
    }

    @authenticate('jwt')
    @del('/meetings/{id}', {
        responses: {
            '204': {
                description: 'Meeting DELETE success',
            },
        },
    })
    async deleteById(@param.path.string('id') id: string): Promise<void> {

        let meeting = await this.meetingRepository.findById(id);
        this.meetingRepository.deleteById(id);

        let filter = {"where": {"meetingId": meeting.id}};
        let meetingMatchs = await this.meetingMatchRepository.find(filter);

        meetingMatchs.forEach(meetingMatch => {
            let userUnregisteredMatchId = meetingMatch.userUnregisteredId;
            let meetingMatchId = meetingMatch.id;
            this.meetingMatchRepository.deleteById(meetingMatchId);

            if (userUnregisteredMatchId) {
                this.userUnregisteredRepository.deleteById(userUnregisteredMatchId);
            }

        })

        if (meeting.type == MeetingType.UNREGISTERED && meeting.userUnregisteredId != undefined) {
            let userUnregisteredId = meeting.userUnregisteredId;
            this.userUnregisteredRepository.deleteById(userUnregisteredId);
        }

    }


    @authenticate('jwt')
    @get('/meetings/auth', {
        responses: {
            '200': {
                description: 'Array of Meeting model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(Meeting, {includeRelations: true}),
                        },
                    },
                },
            },
        },
    })
    async findByUserAuthenticatedId(
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile
    ): Promise<Meeting[]> {

        let filter = {
            "where": {
                "userAuthId": currentUserProfile[securityId]
            },
            "include": [
                {
                    "relation": "meetingMatches",
                    "scope": {
                        "offset": 0,
                        "limit": 100,
                        "skip": 0
                    }
                },
                {
                    "relation": "userAuth",
                    "scope": {
                        "offset": 0,
                        "limit": 100,
                        "skip": 0
                    }
                },
            ]
        };

        return await this.meetingRepository.find(filter);;
    }


    @authenticate('jwt')
    @post('/meetings/auth', {
        responses: {
            '200': {
                description: 'Meeting model instance',
                content: {'application/json': {schema: getModelSchemaRef(Meeting), includeRelations: true, additionalProperties: true}},
            },
        },
    })
    async createAuthMeeting(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Meeting, {
                        title: 'NewMeeting',
                        exclude: ['id'],
                    }),
                },
            },
        })
        meeting: Omit<Meeting, 'id'>,
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<Meeting> {

        let userAuth = await this.userRepository.findById(currentUserProfile[securityId]);

        let filterMeeting = {"where": {"userAuthId": currentUserProfile[securityId]}};

        let meetings = await this.meetingRepository.find(filterMeeting);

        let meetingsCurrentMonth = meetings.filter(meeting => {
            if (meeting.creationDate) {
                if (new Date(meeting.creationDate).getUTCMonth() + 1 == new Date().getUTCMonth() + 1) {
                    return meeting;
                }
            }
        });

        if (meetingsCurrentMonth.length >= 10 && userAuth.accountType == AccountType.FREE) {
            throw new HttpErrors[400]("Tu cuenta es FREE, solo puedes registrar hasta 10 meetings mensuales");
        }

        meeting.enable = true;
        meeting.type = MeetingType.REGISTERED;
        meeting.creationDate = new Date();
        meeting.privateSlug = new EncryptDecrypt(keys.MD5).Encrypt(new Date().getTime() + meeting.name + meeting.description + userAuth.id);
        meeting.userAuthId = currentUserProfile[securityId];


        let newMeeting = await this.meetingRepository.create(meeting);

        this._meetingService.sendEmailNewMeeting(newMeeting, userAuth);

        let filter = {
            "include": [
                {
                    "relation": "userAuth",
                    "scope": {
                        "offset": 0,
                        "limit": 100,
                        "skip": 0
                    }
                },
            ]
        };

        return this.meetingRepository.findById(newMeeting.id, filter);
    }

    @authenticate('jwt')
    @put('/meetings/clone/{id}', {
        responses: {
            '200': {
                description: 'Meeting model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(Meeting, {includeRelations: true}),
                    },
                },
            },
        },
    })
    async cloneMeeting(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.path.string('id') id: string,
    ): Promise<Meeting> {


        let userAuth = await this.userRepository.findById(currentUserProfile[securityId]);

        let filterMeeting = {"where": {"userAuthId": currentUserProfile[securityId]}};

        let meetings = await this.meetingRepository.find(filterMeeting);

        let meetingsCurrentMonth = meetings.filter(meeting => {
            if (meeting.creationDate) {
                if (new Date(meeting.creationDate).getUTCMonth() + 1 == new Date().getUTCMonth() + 1) {
                    return meeting;
                }
            }
        });

        if (meetingsCurrentMonth.length >= 10 && userAuth.accountType == AccountType.FREE) {
            throw new HttpErrors[400]("Tu cuenta es FREE, solo puedes registrar hasta 10 meetings mensuales");
        }
        let meeting = await this.meetingRepository.findById(id);

        let clonedMeeting = new Meeting();

        clonedMeeting.description = meeting.description;
        clonedMeeting.name = meeting.name;
        clonedMeeting.password = meeting.password;
        clonedMeeting.place = meeting.place;
        clonedMeeting.alternatives = meeting.alternatives;
        clonedMeeting.userAuthId = meeting.userAuthId;
        clonedMeeting.type = MeetingType.REGISTERED;
        clonedMeeting.enable = true;
        clonedMeeting.creationDate = new Date();
        clonedMeeting.privateSlug = new EncryptDecrypt(keys.MD5).Encrypt(new Date().getTime() + meeting.name + meeting.description + userAuth.id);

        return this.meetingRepository.create(clonedMeeting);
    }


    @get('/meetings/enable-disable/{id}', {
        responses: {
            '200': {
                description: 'Meeting model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(Meeting, {includeRelations: true}),
                    },
                },
            },
        },
    })
    async disableMeetingById(
        @param.path.string('id') id: string,

    ): Promise<Meeting> {

        let meeting = await this.meetingRepository.findById(id);
        if (meeting.enable) {
            meeting.enable = false;
        } else {
            meeting.enable = true
        }

        this.meetingRepository.updateById(id, meeting);
        return meeting;

    }

}
