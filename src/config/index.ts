import merge from 'lodash/merge';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const stage = process.env.STAGE || 'dev';

let envConfig;

if (stage === 'prod') {
    envConfig = require('./prod').default;
}else if (stage === 'test') {
    envConfig = require('./test').default;
}else {
    envConfig = require('./dev').default;
}

const defaultConfig = {
    stage,
    dbUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    port: process.env.PORT,
    logging: false,
};

export default merge(defaultConfig, envConfig);

