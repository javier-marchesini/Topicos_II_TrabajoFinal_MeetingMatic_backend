import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Meeting,
  UserUnregistered,
} from '../models';
import {MeetingRepository} from '../repositories';

export class MeetingUserUnregisteredController {
  constructor(
    @repository(MeetingRepository)
    public meetingRepository: MeetingRepository,
  ) { }

  @get('/meetings/{id}/user-unregistered', {
    responses: {
      '200': {
        description: 'UserUnregistered belonging to Meeting',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(UserUnregistered)},
          },
        },
      },
    },
  })
  async getUserUnregistered(
    @param.path.string('id') id: typeof Meeting.prototype.id,
  ): Promise<UserUnregistered> {
    return this.meetingRepository.userUnregistered(id);
  }
}
