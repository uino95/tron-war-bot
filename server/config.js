module.exports = {
  tron: {
    privateKey: process.env.TRON_PRIVATE_KEY || "",
    fullHost: process.env.TRON_FULL_HOST || 'https://api.trongrid.io',
    tronWarBotAddress: process.env.TRON_WAR_BOT_ADDRESS || "TPA9FDwukKbrYC4pyNjey7XKvMwKi5aj7e",
    warCoinAddress: process.env.WAR_COIN_ADDRESS || "TJ6kbSxQ8ctPGuHmRb3W92gUN42AooHeNt"
  },
  game: {
    preservedJackpotRateForNextTurn: 0.1
  }
}
