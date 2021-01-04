import {DefaultCrudRepository} from '@loopback/repository';
import {UserUnregistered, UserUnregisteredRelations} from '../models';
import {MongoDbAtlasDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class UserUnregisteredRepository extends DefaultCrudRepository<
  UserUnregistered,
  typeof UserUnregistered.prototype.id,
  UserUnregisteredRelations
> {
  constructor(
    @inject('datasources.MongoDbAtlas') dataSource: MongoDbAtlasDataSource,
  ) {
    super(UserUnregistered, dataSource);
  }
}
