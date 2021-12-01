module.exports = {
  apps : [{
    name: 'pman-spa',
    script: './server.front.js',
    watch: false,
    restart_delay: 30000,
    env: {
      'PORT': 50080,
      'HTTPS': true,
      'SSL_CRT_FILE': '/etc/letsencrypt/live/codingjoa.kro.kr/cert.pem',
      'SSL_KEY_FILE': '/etc/letsencrypt/live/codingjoa.kro.kr/privkey.pem',
    },
    env_dev: {
      'PORT': 50080,
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
      'APIKEY_KAKAO': './secret/key.kakao.js',
      'MARIADB_NAME': 'pman',
      'FRONT_DOMAIN': 'https://codingjoa.kro.kr:50080',
      'JEKO_HOME': `${process.env.HOME}/jeko`,
      'SSL_CERT': '/etc/letsencrypt/live/codingjoa.kro.kr/cert.pem',
      'SSL_KEY': '/etc/letsencrypt/live/codingjoa.kro.kr/privkey.pem',
    },
    env_dev: {
      'DEBUG': '1',
      'ERROR': '1',
      'FRONT_DOMAIN': 'https://codingjoa.kro.kr:50080',
      'DEV': true,
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
