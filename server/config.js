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
    "project_id": "tron-war-bot-test",
    "private_key_id": "90870ff61f2f2e1dc6b57e2a336d0db2bbe7ae7c",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQClHKoxtoE+lmWL\n4SP651zyhFhSGbNp17nTlIVtf77NV19H0nWnf+DvzlNgZrTYEUxB9YvEDt8WOMN7\n/OOjzbgiqoEfFyOqyJaKOweuIpffww9Qbz2CD7O0uvsbOWmmkagTNjFa1469VI1H\n4ZWoTZXI393PGQQk81d+DCJS3F2fKKn0PTHSOJO4bQmoK/yNSjHMyQKl4nt4Qcp4\ndNHD07MDSLYWXNKechn+WaKjUOko4yuh6l0SWuVwj4OYFma701kcF+cIw3tPPtIS\nOf1KSct4NepLm9uojRf34NZk2WaBi9GRuDnBCcoNv88fKRdZoEd+qiIazqW3576m\nCpSHR9UhAgMBAAECggEADFLepX3BWVDOl67FqaSgWc3vgqyTk9xBF436bzEYUR7K\n8uMo8B2EcO8LPELbj39WXAZODjjsRUNrhy2vDFWelLXPE+k9UAdklxYvV/u8hBF8\n1eHWVdwYAMQZBHqX9xG1mWjTgmaG61JBhk02h1HyfVmvkQAwFer0y5Nvx2lWco/Z\nfZTeO9DUJ4l9Bp0FZdeBHfgV/R4e3vpGRD7jU0MWgAZXDdh1KhXHOVTwopUgOEIK\nY187u0bjPEdvVvpn0fc5w/oZ0vXRGNTcGrPifjy8WDrQjHQv99I6ywzrgCLsdVYq\n9I/LALwiGH/bKRvDFW2IoP6GvA6zdzb6iuOvTc78TQKBgQDP5LrpPztMvBDxYub0\nL478gri3FgQ0XPnR7kqdMoPMwXbIJeYCzWRu56GJ1EU7+QEQ6MVblsLVlEOFQVP8\nYGSjFuWVvZxQW76yLSFSK7BmBLV7Hghsa2Fsm90q2vjfBhmgLU30L+KoxOoONJ6v\nc/GY+A1cGIZ2EIFkUQ3i42B55QKBgQDLUaDUnMpHUeS7uWlD5ToQw++4De/jljmz\nglHT6jPzt/y+cKzNprV1lFKhVOVIJu71QHDqlfXK/OoQhWTzo1epsqvsakEZ3WVJ\n9uZEvNEuTz9FiTgfhP+bMNXwm9zGCyabMUViqwVbVZS9tCxXaRfeCj1G052krurJ\nIbM+t77KjQKBgANb+9U3C1tDErcD1R2PAy17Y0a6GVlLQ1IsGpKNtWmCmsvDKQNU\nlFHidk7G2lOMw4KlcEL5na5b1fd6RcQnPpkQDqerx7HYua0hY49zW0davh/+LT6r\nQYjCwAEoRqs76wAWm1LdzzjQ7cNLAGFvazEAmR6q2slfnOelE6dd6zotAoGAIfO/\np8GHBeHnEHIl4fClgac2oMWzCY5MlG1uvLSfeFOBIUwvjygHpVrfcZF7uFDIFqxs\nLsBcC0mwzJF6CjV8rhnoG9KijG8sOu3ABjqBs/oH1tTTSnArPv8ousVMWMYD7GaN\n76wfeOERtZwgy3gBRFLxaKJt8NJE4tF93TtR4QECgYEAxszQ6MFUkQUs4Ew8htqA\nutgaAiY20/bxKK1Qd+Hhi2MSucRJIlI4Yf6ZvCHzmPQEheLTlJiVsz7pTJgKzQF2\n4FTD1xDpHrt2BEr2Isc2l7LXX3sKi7OGKoXCSVIetiqwXFKScslIBfUINrqtAls9\n8rEol43NofnF0yKAcA2zUc8=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fk2r7@tron-war-bot-test.iam.gserviceaccount.com",
    "client_id": "110214308616889396478",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fk2r7%40tron-war-bot-test.iam.gserviceaccount.com"
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
      quotesFreq : 319,
      rouletteFreq : 72
    },
    roulette: {
      superVote:0.5,
      vote: 0.1,
      bonus: 5
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
    civilWarLikelihood: 0.02,
    restart: JSON.parse(process.env.RESTART || false)
  }
}

if (config.test) config.tron = config.tronTest;
if (config.test) config.timing = config.timingTest;

module.exports = config;
