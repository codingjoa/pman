module.exports = {
  apps : [{
    name: 'pman-spa',
    script: './server.front.js',
    watch: false,
    restart_delay: 30000,
    env: {
      'PORT': 3000,
      'HTTPS': true,
      'SSL_CRT_FILE': './ssl/cert.crt',
      'SSL_KEY_FILE': './ssl/cert.key'
    },
    env_dev: {
      'PORT': 3000,
      'HTTPS': false
    }
  }, {
    name: 'pman-restAPI',
    script: './server.back.js',
    watch: false,
    restart_delay: 30000,
    env: {
      'MARIADB': true,
      'JWT': true,
      'PROXY': true,
      'MARIADB_NAME': 'pman'
    },
    env_dev: {
      'DEBUG': '1',
      'ERROR': '1'
    }
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
