// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-todo-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {authenticate, TokenService} from '@loopback/authentication';
import {
    Credentials,
    MyUserService,
    TokenServiceBindings,
    User,
    UserRepository,
    UserServiceBindings
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {Count, CountSchema, repository, Where} from '@loopback/repository';
import {
    get,
    getModelSchemaRef,
    HttpErrors,
    param,
    post,
    requestBody,
    SchemaObject
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {genSalt, hash} from 'bcryptjs';
import _ from 'lodash';
import {UserAuth} from '../models';
import {AccountType} from '../models/account-type.enum';
import {UserAuthRepository} from '../repositories';
import {UserService} from '../services/user.service';



const CredentialsSchema: SchemaObject = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
        email: {
            type: 'string',
            format: 'email',
            unique: true,
        },
        password: {
            type: 'string',
            minLength: 8,
        },
    },
};

export const CredentialsRequestBody = {
    description: 'The input of login function',
    required: true,
    content: {
        'application/json': {schema: CredentialsSchema},
    },
};

export class UserController {
    constructor(
        @inject(TokenServiceBindings.TOKEN_SERVICE)
        public jwtService: TokenService,
        @inject(UserServiceBindings.USER_SERVICE)
        public myUserService: MyUserService,
        @inject(SecurityBindings.USER, {optional: true})
        public user: UserProfile,
        @repository(UserRepository) protected userRepository: UserRepository,
        @repository(UserAuthRepository) protected userAuthRepository: UserAuthRepository,
        @inject("UserService") protected _userService: UserService,

    ) { }

    @post('/users/login', {
        responses: {
            '200': {
                description: 'userData',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                },
                                email: {
                                    type: 'string',
                                },
                                roles: {
                                    type: 'string',
                                },
                                token: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    async login(
        @requestBody(CredentialsRequestBody) credentials: Credentials,
    ): Promise<any> {

        const user = await this.myUserService.verifyCredentials(credentials);
        const userProfile = this.myUserService.convertToUserProfile(user);
        const token = await this.jwtService.generateToken(userProfile);

        let userData = {
            "id": userProfile[securityId],
            "email": userProfile.email,
            "name": user.name,
            "token": token,
            "accountType": user['accountType'],
            "roles": user['roles']
        }
        return {userData};
    }

    @authenticate('jwt')
    @get('/whoAmI', {
        responses: {
            '200': {
                description: 'Return current user',
                content: {
                    'application/json': {
                        schema: {
                            type: 'string',
                        },
                    },
                },
            },
        },
    })
    async whoAmI(
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<string> {
        return currentUserProfile[securityId];
    }

    @post('/signup', {
        responses: {
            '200': {
                description: 'User',
                content: {
                    'application/json': {
                        schema: {
                            'x-ts-type': User,
                        },
                    },
                },
            },
        },
    })
    async signUp(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(UserAuth, {
                        title: 'NewUser',
                    }),
                },
            },
        })
        user: UserAuth,
    ): Promise<User> {

        let checkedUser = await this.userRepository.findOne({where: {email: user.email}});

        if (checkedUser) throw new HttpErrors[402]("This user acount alredy exists!");

        user.roles = ['owner'];
        user.accountType = AccountType.FREE;
        user.creationDate = new Date();

        const savedUser = await this.userRepository.create(_.omit(user, 'password'));

        const password = await hash(user.password, await genSalt());
        await this.userRepository.userCredentials(savedUser.id).create({password});

        this._userService.sendEmailNewUser(savedUser)
        return savedUser;
    }
    @post('/signup/adminuser', {
        responses: {
            '200': {
                description: 'User',
                content: {
                    'application/json': {
                        schema: {
                            'x-ts-type': User,
                        },
                    },
                },
            },
        },
    })
    async signUpAdminuser(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(UserAuth, {
                        title: 'NewUser',
                    }),
                },
            },
        })
        user: UserAuth,
    ): Promise<User> {

        let checkedUser = await this.userRepository.findOne({where: {email: user.email}});

        if (checkedUser) throw new HttpErrors[402]("This user acount alredy exists!");

        user.roles = ['admin'];
        user.accountType = AccountType.ADMIN;
        user.creationDate = new Date();

        const savedUser = await this.userRepository.create(_.omit(user, 'password'));

        const password = await hash(user.password, await genSalt());
        await this.userRepository.userCredentials(savedUser.id).create({password});

        return savedUser;
    }


    @authenticate('jwt')
    @get('/users', {
        responses: {
            '200': {
                description: 'Return Users Registered',
                content: {
                    'application/json': {
                        schema: {
                            type: 'string',
                        },
                    },
                },
            },
        },
    })
    async find(
    ): Promise<User[]> {

        return this.userRepository.find();
    }

    @get('/users/count', {
        responses: {
            '200': {
                description: 'User model count',
                content: {'application/json': {schema: CountSchema}},
            },
        },
    })
    async count(
        @param.where(User) where?: Where<User>,
    ): Promise<Count> {
        return this.userRepository.count(where);
    }


}
