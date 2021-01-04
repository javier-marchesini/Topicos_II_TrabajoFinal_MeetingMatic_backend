import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDbAtlasDataSource} from '../datasources';
import {UserAuth, UserAuthRelations} from '../models';

export class UserAuthRepository extends DefaultCrudRepository<
    UserAuth,
    typeof UserAuth.prototype.id,
    UserAuthRelations
    > {
    constructor(
        @inject('datasources.MongoDbAtlas') dataSource: MongoDbAtlasDataSource,
    ) {
        super(UserAuth, dataSource);
    }
}
