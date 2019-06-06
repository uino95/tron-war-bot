module.exports = {
  tron: {
    privateKey: process.env.TRON_PRIVATE_KEY || "",
    fullHost: process.env.TRON_FULL_HOST || 'https://api.trongrid.io',
    tronWarBotAddress: process.env.TRON_WAR_BOT_ADDRESS || "TPA9FDwukKbrYC4pyNjey7XKvMwKi5aj7e",
    warCoinAddress: process.env.WAR_COIN_ADDRESS || "TJ6kbSxQ8ctPGuHmRb3W92gUN42AooHeNt"
  },
  game: {
    preservedJackpotRateForNextTurn: 0.1
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
    }
}
