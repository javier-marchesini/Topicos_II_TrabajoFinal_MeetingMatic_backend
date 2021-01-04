import {User, UserRepository} from '@loopback/authentication-jwt';
import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {MongoDbAtlasDataSource} from '../datasources';
import {Meeting, MeetingMatch, MeetingRelations, UserUnregistered} from '../models';
import {MeetingMatchRepository} from './meeting-match.repository';
import {UserUnregisteredRepository} from './user-unregistered.repository';

export class MeetingRepository extends DefaultCrudRepository<
    Meeting,
    typeof Meeting.prototype.id,
    MeetingRelations
    > {

    public readonly userUnregistered: BelongsToAccessor<UserUnregistered, typeof Meeting.prototype.id>;
    public readonly meetingMatches: HasManyRepositoryFactory<MeetingMatch, typeof Meeting.prototype.id>;

    public readonly userAuth: BelongsToAccessor<User, typeof Meeting.prototype.id>;

    constructor(
        @inject('datasources.MongoDbAtlas') dataSource: MongoDbAtlasDataSource,
        @repository.getter('UserUnregisteredRepository') protected userUnregisteredRepositoryGetter: Getter<UserUnregisteredRepository>,
        @repository.getter('MeetingMatchRepository') protected meetingMatchRepositoryGetter: Getter<MeetingMatchRepository>,
        @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,


    ) {
        super(Meeting, dataSource);
        this.userAuth = this.createBelongsToAccessorFor('userAuth', userRepositoryGetter,);
        this.registerInclusionResolver('userAuth', this.userAuth.inclusionResolver);

        this.meetingMatches = this.createHasManyRepositoryFactoryFor('meetingMatches', meetingMatchRepositoryGetter);
        this.registerInclusionResolver('meetingMatches', this.meetingMatches.inclusionResolver);

        this.userUnregistered = this.createBelongsToAccessorFor('userUnregistered', userUnregisteredRepositoryGetter);
        this.registerInclusionResolver('userUnregistered', this.userUnregistered.inclusionResolver);



    }
}
