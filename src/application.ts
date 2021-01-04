import {AuthenticationComponent} from '@loopback/authentication';
import {
    JWTAuthenticationComponent,
    TokenServiceBindings,
    UserServiceBindings
} from '@loopback/authentication-jwt';
import {AuthorizationComponent} from '@loopback/authorization';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
    RestExplorerBindings,
    RestExplorerComponent
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import path from 'path';
import {MongoDbAtlasDataSource} from './datasources';
import {MySequence} from './sequence';
import {JWTService} from './services/jwt.service';
import {MeetingService} from './services/meeting.service';
import {NotificationService} from './services/notification.service';
import {UserService} from './services/user.service';


export {ApplicationConfig};


export class MeetingApplication extends BootMixin(
    ServiceMixin(RepositoryMixin(RestApplication)),
) {
    constructor(options: ApplicationConfig = {}) {
        super(options);
        dotenv.config();
        dotenvExt.load({
            schema: '.env',
            errorOnMissing: true,
        });

        // Set up the custom sequence
        this.sequence(MySequence);
        this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);

        //DI
        this.bind("MeetingService").toClass(MeetingService);
        this.bind("NotificationService").toClass(NotificationService);
        this.bind("UserService").toClass(UserService);



        // Set up default home page
        this.static('/', path.join(__dirname, '../public'));

        // Customize @loopback/rest-explorer configuration here
        this.configure(RestExplorerBindings.COMPONENT).to({
            path: '/explorer',
        });
        this.component(RestExplorerComponent);

        this.projectRoot = __dirname;
        // Customize @loopback/boot Booter Conventions here
        this.bootOptions = {
            controllers: {
                // Customize ControllerBooter Conventions here
                dirs: ['controllers'],
                extensions: ['.controller.js'],
                nested: true,
            },
        };

        // ------ ADD SNIPPET AT THE BOTTOM ---------
        // Mount authentication system
        this.component(AuthenticationComponent);
        // Mount jwt component
        this.component(JWTAuthenticationComponent);
        this.component(AuthorizationComponent);


        // Bind datasource
        this.dataSource(MongoDbAtlasDataSource, UserServiceBindings.DATASOURCE_NAME);
        // ------------- END OF SNIPPET -------------
    }
}






