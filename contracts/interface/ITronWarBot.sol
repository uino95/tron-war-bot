pragma solidity ^0.5.2;

import '../interface/IWarCoin.sol';

interface ITronWarBot {
  /**************/
  /* TronWarBot */
  /**************/
  /* GETTERS */
  /* Returns currently set address of the house */
  function houseAddress() external view returns (address);
  /* Returns the rate of house mined tokens over user mined tokens: x WAR to the house for every 1 WAR to the user   */
  function houseMiningRate() external view returns (uint256);
  /* Returns the rate of dividends distribution to stakeholders over total house profits: */
  /* 1 TRX equals 100% of profits redistributed through dividends to stakeholders */
  function dividendsToProfitsRate() external view returns (uint256);
  /* Returns house edge, minimum and maximum bet set for specific game type */
  function gameParams(uint256 _gameType) external view returns (uint256, uint256, uint256);
  /* Returns the current available jackpot for the specific game type of current round */
  function jackpot(uint256 _gameType) external view returns (uint256);
  /* Returns the final archived net jackpot for specific round of gametype and the remaining available funds not yet payed out */
  function gameFunds(uint256 _gameType, uint256 _round) external view returns (uint256, uint256);

  /* SETTERS */
  /* Set the payable address of the house */
  function setHouseAddress(address payable _house) external returns (bool);
  /* Set the rate of house mined tokens over user mined tokens: 1 TRX equals an additional 1 WAR to the house for each user mined WAR */
  function setHouseMiningRate(uint256 _houseMiningRate) external returns (bool);
  /* Set the rate of dividends distributed to stakeholders over total house profits: */
  /* 1 TRX equals 100% of profits redistributed through dividends to stakeholders */
  function setDividendsToProfitsRate(uint256 _dividendsToProfitsRate) external returns (bool);
  /* Set the specific game params:  house edge (1 TRX equals 100%) for that game, minimum bet and maximum bet expressed in SUN */
  function setGameParams(uint256 _gameType, uint256 _houseEdge, uint256 _minimumBet, uint256 _maximumBet) external returns (bool);

  /* LOGIC */
  /* It places the bet, it mines tokens for the user and for the house according to houseMiningRate and records it in an event */
  function bet(uint256 _gameType, uint256 _userChoice) external payable returns (bool);
  /* It deducts and send the house edge, it mantains a _preservedJackpotRate for next round's jackpot and move off the jackpot needed for winning users.
     It returns the closing round number */
  function closeGame(uint256 _gameType, uint256 _preservedJackpotRate) external returns (bool);
  /* It pays the winning users and set them into leaderboard */
  function payout(uint256 _gameType, uint256 _round, address _recipient, uint256 _amount) external returns (bool);

  event Bet(uint256 indexed gameType, uint256 indexed round, address indexed from, uint256 amount);
  event Payout(uint256 indexed gameType, uint256 indexed round, address indexed to, uint256 amount);
  event StartGame(uint256 gameType, uint256 round, uint256 startBlock, uint256 initialJackpot);
  event EndGame(uint256 gameType, uint256 round, uint256 endBlock, uint256 finalJackpot);

  /*********/
  /* UTILS */
  /*********/
  /* Frontend */
  function isBackendConfigured() external view returns(bool);
  function changeWarCoinContract(address payable newAddress) external returns(bool);
  function WAR() external view returns(IWarCoin);
  /* FrontendAdmin */
  function isAdmin(address _account) external view returns (bool);
  function isFrontendAdmin(address _account) external view returns (bool);
  function addFrontendAdmin(address _account) external;
  function removeFrontendAdmin(address _account) external;
  function renounceFrontendAdmin() external;
}
