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
import {UserUnregistered} from '../models';
import {UserUnregisteredRepository} from '../repositories';

//@authenticate('jwt')
export class UserUnregisteredController {
    constructor(
        @repository(UserUnregisteredRepository)
        public userUnregisteredRepository: UserUnregisteredRepository,
    ) { }

    @post('/user-unregistereds', {
        responses: {
            '200': {
                description: 'UserUnregistered model instance',
                content: {'application/json': {schema: getModelSchemaRef(UserUnregistered)}},
            },
        },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(UserUnregistered, {
                        title: 'NewUserUnregistered',
                        exclude: ['id'],
                    }),
                },
            },
        })
        userUnregistered: Omit<UserUnregistered, 'id'>,
    ): Promise<UserUnregistered> {
        return this.userUnregisteredRepository.create(userUnregistered);
    }


    @get('/user-unregistereds/count', {
        responses: {
            '200': {
                description: 'UserUnregistered model count',
                content: {'application/json': {schema: CountSchema}},
            },
        },
    })
    async count(
        @param.where(UserUnregistered) where?: Where<UserUnregistered>,
    ): Promise<Count> {
        return this.userUnregisteredRepository.count(where);
    }

    @get('/user-unregistereds', {
        responses: {
            '200': {
                description: 'Array of UserUnregistered model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(UserUnregistered, {includeRelations: true}),
                        },
                    },
                },
            },
        },
    })
    async find(
        @param.filter(UserUnregistered) filter?: Filter<UserUnregistered>,
    ): Promise<UserUnregistered[]> {
        return this.userUnregisteredRepository.find(filter);
    }

    @patch('/user-unregistereds', {
        responses: {
            '200': {
                description: 'UserUnregistered PATCH success count',
                content: {'application/json': {schema: CountSchema}},
            },
        },
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(UserUnregistered, {partial: true}),
                },
            },
        })
        userUnregistered: UserUnregistered,
        @param.where(UserUnregistered) where?: Where<UserUnregistered>,
    ): Promise<Count> {
        return this.userUnregisteredRepository.updateAll(userUnregistered, where);
    }

    @get('/user-unregistereds/{id}', {
        responses: {
            '200': {
                description: 'UserUnregistered model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(UserUnregistered, {includeRelations: true}),
                    },
                },
            },
        },
    })
    async findById(
        @param.path.string('id') id: string,
        @param.filter(UserUnregistered, {exclude: 'where'}) filter?: FilterExcludingWhere<UserUnregistered>
    ): Promise<UserUnregistered> {
        return this.userUnregisteredRepository.findById(id, filter);
    }

    @patch('/user-unregistereds/{id}', {
        responses: {
            '204': {
                description: 'UserUnregistered PATCH success',
            },
        },
    })
    async updateById(
        @param.path.string('id') id: string,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(UserUnregistered, {partial: true}),
                },
            },
        })
        userUnregistered: UserUnregistered,
    ): Promise<void> {
        await this.userUnregisteredRepository.updateById(id, userUnregistered);
    }

    @put('/user-unregistereds/{id}', {
        responses: {
            '204': {
                description: 'UserUnregistered PUT success',
            },
        },
    })
    async replaceById(
        @param.path.string('id') id: string,
        @requestBody() userUnregistered: UserUnregistered,
    ): Promise<void> {
        await this.userUnregisteredRepository.replaceById(id, userUnregistered);
    }

    @del('/user-unregistereds/{id}', {
        responses: {
            '204': {
                description: 'UserUnregistered DELETE success',
            },
        },
    })
    async deleteById(@param.path.string('id') id: string): Promise<void> {
        await this.userUnregisteredRepository.deleteById(id);
    }
}
