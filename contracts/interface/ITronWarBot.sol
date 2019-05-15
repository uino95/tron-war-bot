pragma solidity ^0.5.2;

import '../interface/IWarCoin.sol';

interface ITronWarBot {

  /* TronWarBot */
  /* Return current House Edge in percentage: 1 TRX equals 100% */
  function houseEdge() external view returns (uint256);
  /* Return minimum and maximum bet set for specific game type */
  function gameParams(uint256 _gameType) external view returns (uint256, uint256);
  /* Set new house edge: 1 TRX equals 100% */
  function setHouseEdge(uint256 _houseEdge) external returns (bool);
  /* Set the specific game params:  minimum bet and maximum bet expressed in SUN */
  function setGameParams(uint256 _gameType, uint256 _minimumBet, uint256 _maximumBet) external returns (bool);
  /* It places the bet, it mints x token for the user and x for the house and records it in an event */
  function bet(uint256 _gameType, uint256 _userChoice) external returns (bool);
  /* It pays the user after deducting the house edge and send TRX to house and to user */
  function payout(address _recipient, uint256 _amount) external returns (bool);


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
