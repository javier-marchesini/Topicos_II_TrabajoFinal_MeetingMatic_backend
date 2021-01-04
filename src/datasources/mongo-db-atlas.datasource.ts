import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';



// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MongoDbAtlasDataSource extends juggler.DataSource
    implements LifeCycleObserver {
    static dataSourceName = 'MongoDbAtlas';

    constructor(
        @inject('datasources.config.MongoDbAtlas', {optional: true})
        dsConfig: object = {},
    ) {
        Object.assign(dsConfig, {
            name: 'MongoDbAtlas',
            connector: 'mongodb',
            url: process.env.MONGO_DB_CONNECTION,
            host: '',
            port: 0,
            user: '',
            password: '',
            database: '',
            useNewUrlParser: true
        });
        super(dsConfig);
    }
}
