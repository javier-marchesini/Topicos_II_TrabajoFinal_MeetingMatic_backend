import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, repository} from '@loopback/repository';
import {MongoDbAtlasDataSource} from '../datasources';
import {Meeting, MeetingMatch, MeetingMatchRelations, UserUnregistered} from '../models';
import {MeetingRepository} from './meeting.repository';
import {UserUnregisteredRepository} from './user-unregistered.repository';


export class MeetingMatchRepository extends DefaultCrudRepository<
    MeetingMatch,
    typeof MeetingMatch.prototype.id,
    MeetingMatchRelations
    > {

    public readonly userUnregistered: BelongsToAccessor<UserUnregistered, typeof MeetingMatch.prototype.id>;

    public readonly meeting: BelongsToAccessor<Meeting, typeof MeetingMatch.prototype.id>;

    constructor(
        @inject('datasources.MongoDbAtlas') dataSource: MongoDbAtlasDataSource,
        @repository.getter('UserUnregisteredRepository') protected userUnregisteredRepositoryGetter: Getter<UserUnregisteredRepository>,
        @repository.getter('MeetingRepository') protected meetingRepositoryGetter: Getter<MeetingRepository>,
    ) {
        super(MeetingMatch, dataSource);
        this.meeting = this.createBelongsToAccessorFor('meeting', meetingRepositoryGetter,);
        this.registerInclusionResolver('meeting', this.meeting.inclusionResolver);
        this.userUnregistered = this.createBelongsToAccessorFor('userUnregistered', userUnregisteredRepositoryGetter,);
        this.registerInclusionResolver('userUnregistered', this.userUnregistered.inclusionResolver);
    }
}
