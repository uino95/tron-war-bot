const config = {
  tron: {
    privateKey: process.env.TRON_PRIVATE_KEY || "",
    fullHost: process.env.TRON_FULL_HOST || 'https://api.trongrid.io',
    tronWarBotAddress: process.env.TRON_WAR_BOT_ADDRESS || "TY7KWcSvmwA1J7pCy42S1wBbf9c1siCkMo",
    warCoinAddress: process.env.WAR_COIN_ADDRESS || "TTbPmiq35XjAhQThatnukS45pNYd7xV2m1"
  },
  tronTest: {
    privateKey: process.env.TRON_PRIVATE_KEY || "",
    fullHost: process.env.TRON_FULL_HOST || 'https://api.trongrid.io',
    tronWarBotAddress: "TYUyBmkVZdtftSJf9c5StD8rMXFf37thab",
    warCoinAddress: "TJ6kbSxQ8ctPGuHmRb3W92gUN42AooHeNt"
  },
  game: {
    preservedJackpotRateForNextTurn: 0
  },
  firebase: {
	  "type": "service_account",
	  "project_id": "tron-war-bot",
	  "private_key_id": "149bdbfcad239197a5e6575bb8f7b5c9836d6add",
	  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCuq3aT2/V3hxaX\n+LcNnkJsGm0QhoRbRuCvPY2qV9asN6gUJmwYEnQLYD7EsGMi1GVbhLqtoNg6SCjP\n/gg12AhIrTt7sdejJP2hMtUMLToLB//nUee7jEdte/UF3MO9hsvlJqmcscGuwrDw\nyBEh1WIKbxUYXCfPczBgnaKk4lroT1mMkQs1cp1uKq7lJVi4tAQqAlGjIfcFWTaQ\nlL8xar+Oh3tEcxdOxVWXHCgj5eutCT9XaO8WYNxGNkfBnyH5oPTvw6ZkdwJrY4bx\nBsPP4+izvKhgnXg0MiG5ZFwxkqH3Ujl9JlEpZWHoMSNnpkgbzcVGuC4aF0GlW8y7\n6baTs+9HAgMBAAECggEABQd8148Kx1FFbkTECIlZAkHUiBhHcVVeHM2Z6aCz1quX\nlFTy4dKOMtGnnQQzJoqVDIiK03sBHtR7EFoRJHO+8VDDmLErM1BaWSzcg4g91pl5\nXdC26miEmftqt6t+m1NpRYTSd2eK2xxR+ezYyW+abhB6vAPTRZ7ccru3NiYqVev+\ntSeiS9ON6eWV4X7Qzsfl7QM165lHv33Er9EZF+4iytX9Rd3oKp4yvcfpnZJuZcO1\nL9syN21pc59Jh71BD0TJx1bHVhL3QECyWS+jA+ftKRo7WoXX73MDsxzwICr3eqnd\nHcPM4h/aQP7+hjMKd3NCEoHgGzQrLJoN7WVo3cj4OQKBgQDudlldEUy448XxXeQ/\n+RiLtn24ZL7mFqsS9rId18ahADFaFyOnbtcPmqWQRMt7Q+/2xvvGA95MEs7BBVJ/\ni4isj5SQVQPKYrLBCk9rOOx5LjEUjqCYeXoElWUmDo8KFywc37fa/irW41oxwcsO\nRK7u1ETCJO7ICG0D+509QBkgqwKBgQC7hA9TlxOc++Ch+jQq2L7IgXkTgPioXZWP\nPWQRImTv5Bs8dxZ0AlcX/6Fo3ZrIS4JuM9nRe9YmPeLTPz7S7V6NAUdHU6YMl2rS\n8OShgP8o1hO5KVRQ1ZZy3RfewQ0jQPebyJWUtCaMiCE3wq0lJxCFn1z0J5aVdJv0\n6rdXp71D1QKBgGFV/64khJunpcGbILMYO3Oz/udIgD+tGxF3j0btL8/CI2LxtQUA\nElr1NgWIf0KGfanOmTC/nXqR5sEVKhKT4ysExJCRkyWGWg6/5aEPsD7aowAQI+95\nDlxWmt4I7UwiH0h97S8/tj7WuJc80mS1lm44SQSyTKFsBwusJge9ZURXAoGAGB6+\nkfQG89R6aptyhmhm8geleVrHoXCYQlqVOpcAANOIpVh0LOv4JAAf1QtcU5NS7bYB\nuK6DN1wShzXFcQBTfzPA5W3fGBOKDCQsZJHhQHF5DAJC9DrlJVVHMsIGXJiIwSMm\nCoC5zK3eB/wkpXjG6Uk8fbNx7TuYrAJdHwtWjxkCgYA9nehkRM0r6C/9azeeKAhM\nrgwASymNMJe0Xc8wCkJkO/TwUThbN9xlht3JtVYnkL8UE7HaCkcSevHUC0JLWWTk\nJ4jSjzExtNhafRmzHjyDk/yWIvS8y9VXKxDdnWudP1rpfpTLByumGKHH4slaztD/\nmBo05o/HN+Ie2Jghe9Ap4g==\n-----END PRIVATE KEY-----\n",
	  "client_email": "firebase-adminsdk-xemt9@tron-war-bot.iam.gserviceaccount.com",
	  "client_id": "102481598413384053348",
	  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
	  "token_uri": "https://oauth2.googleapis.com/token",
	  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
	  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xemt9%40tron-war-bot.iam.gserviceaccount.com"
  },
  firebaseTest: {
    "type": "service_account",
    "project_id": "twb-backup-de2e5",
    "private_key_id": "51adfdcdbb13c1c44d68a215a0c2f4caf9da5932",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDLep25qXWSm9pE\ncE7PWIJS237BPamk3Wzx8v9Lc5/y+NodQLZMyAs5NPPUg0eQF1vfPKGPMpmPwSKv\nEDmALmyT8avRXn1s9XskDx91fhPXeqowvUoU7HrXgnKVmgmwiuqwD41cxRQOKmke\nHLQH12PYFIcHCTChg7Qo22hCBznlJrCnDk5bgMLkpt+AFjX72kAU7M7eWMwlJ3se\n2u3S44IuCwIpRl1FgMTkASYeWDmTHVePrSIbZXrr9tYVB5zM2kbS+F55RGNNJRxC\n6y+lCg1LyNMMvqGGMP6wgbW+y2jYYjKIjJRUwAEbwEMyGmH/TFjhzNyCw6lByRz0\nPqxncBL1AgMBAAECggEAA5gDUCOnkXLSPJI1OiFIj/kTeItDw0cr5OwTSTxeD1cI\n1yps7dc8p4KBaff1nBxlgYBbJCHTJ4BUQf5J3bM0NLq4e6atFW8SgTUJK7SR2iTu\n+5RkShFRLBxANNc3I5iYg4qKxyAt9gAWwjLklRzfRRI7vkqRwtCGLpCNe1kQUzU/\nH+dLAn2yPL5UrpAt4pxF3Ez6ubizIWOOhOU2AYHEbtnmzQhDsMgu3vVBAI52byo8\npVyiSpcarBy8Z28EFiohpJ1HQqvimmgtqxCgZ6BJF0ou8F35dsT+Do7POYdKNPno\nDY4bGBxAPUAD7aMWdNvcmJSoXtbCBlySyyiibXW0wQKBgQD8pzjkdHy07Us6dx90\n6vUHR8T/3PVv2lsY9o6y5PSelz6kjVXAdDJnlmiKJLHOVfpdsOxj0x/AeJdyg4A3\nv+NxUm4qUAk/wbMPK6uTseckNCeJUzy6+FahIduiAneH913qc30EZ15hL7PE8JDU\nZ7542n42+3TDF3dzl0VPGNj71QKBgQDOLKNWtW3VB3zyWyhq248x0YDuzxbepm4v\n2kkn3GaNo8XrD0OAKpMdBekfY9FTxFeLfH4/ucD4cKDZvo3N1/JXtvbS+DXhdkMJ\nY0O1G1i3bH9J0vXwkC9U663BYxV1HLTgXSA6LXF4qjINUSBB2rfoHSWFPTBohDOM\ncxtLXyXqoQKBgQDP7wxasSgle5pLXtjLz8ejm0Sd04tH6CzLSbg9sUNF9nH+2bc2\ncis9p8MX1oVjrM0mKMMUkSBztovmGiX/O/UDQfUa684A4/jrRmSqZGM4H5heY9v6\ngQJDEOuC1YbspwBrQWslobFCSREpx1dbCJrxOdlghOke2wRbZKcNJwUFlQKBgQCY\n5e20LhRnuYfly8irhmwpS+9MKvQQ5mgswLsj/oVnYR8z9Tvf3rL/ARUjnEju0FsE\nLK0L4VvEYvJGyNQs5YrpldxyFHUQ4T1RxvW9Z6xhSusS+oo9fxA68BUJp8uP8FwL\nT8TIoE7YZ4965MEBVYyxbHwY1YoC2JfJ/sstGEDsQQKBgGnP+qQAYyzwfphbdL7N\nMxXzUyWbtwlOyeCZWDw6T8icZWPKsjpepwgRecttjSYKJ0W+5NUM+XqV8oQ745/T\nXfFmoBEG5qP1xmXvBeo4hfCepc/Kg95bsEN2QbShgTKGdhhtHcyhdkmqRbW8xiQd\npXjh4VgxPCNUfUVmMesyhPLr\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-6217c@twb-backup-de2e5.iam.gserviceaccount.com",
    "client_id": "117449833925106107296",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-6217c%40twb-backup-de2e5.iam.gserviceaccount.com"
  },
  heroku: {
    apiKey: 'bfbc8a87-fa94-4885-bb7f-e18ca83ec1d8'
  },
  test: JSON.parse(process.env.TEST_MODE || true),
  telegram:{
    token: process.env.TELEGRAM_TOKEN,
    group: JSON.parse(process.env.TELEGRAM_GROUP || -331523835),
    adminGroup: JSON.parse(process.env.TELEGRAM_ADMIN_GROUP || -331523835)
  },
  facebook:{
    pageId: "TronWarBot",
    token: process.env.FB_PAGE_ACCESS_TOKEN,
    appId: process.env.FB_APP_ID,
    appSecret: process.env.FB_APP_SECRET,
  },
  timing: {
    turn: 300,
    blockConfirmation: 4,
    txMargin: 15
  },
  timingTest: {
    turn: 30,
    blockConfirmation: 2,
    txMargin: 5
  },
  social:{
    updates:{
      statsFreq  : 100,
      battleFreq : 100,
      quotesFreq : 419,
      rouletteFreq : 72
    },
    promotions : {
      ambassadorFreq: 987
    },
    roulette: {
      superVote:0.5,
      vote: 0.1,
      bonus: 10
    },
    shares:{
      comment: 0.1,
      share: 1,
      post: 0.2,
      review: 0.5,
    }
  },
  cohesion:{
    battle:{
      "0":{ o:0.1, ot:0, d:0, dt:0 },
      "1":{ o:-0.1, ot:0, d:0, dt:0 },
      "2":{ o:0, ot:0, d:0.2, dt:0 },
      threshold: {
        upper:70,
        lower:30
      }
    }
  },
  wwb:{
    battleWeight: [0.15, 0.56, 0.29],
    civilWarLikelihood: 0.04,
    restart: JSON.parse(process.env.RESTART || false)
  }
}

if (config.test) config.tron = config.tronTest;
if (config.test) config.timing = config.timingTest;

module.exports = config;
