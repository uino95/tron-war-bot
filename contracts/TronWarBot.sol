pragma solidity ^0.4.25;

import './interface/ITronWarBot.sol';
import './interface/IWarCoin.sol';

import "./utils/SafeMath.sol";
import "./utils/ReentrancyGuard.sol";
import "./utils/Destructible.sol";
import './architecture/Frontend.sol';

/**
 * @title TronWarBot v0.1
 * @author Samuele Rodi (a.k.a. Sam Fisherman)
 * @notice This TronWarBot contract is the first release of the TronWarBot logic contract.
 */
contract TronWarBot is ITronWarBot, Frontend, ReentrancyGuard, Destructible {

  using SafeMath for uint256;

  struct GameParams {
    uint256 houseEdge;
    uint256 minimumBet;
    uint256 maximumBet;
  }

  struct RoundFunds {
    uint256 finalJackpot;
    uint256 availableFunds;
    uint256 houseEdge;
  }

  address public houseAddress;
  address public divPoolAddress;
  uint256 public houseMiningRate;
  uint256 public dividendsToProfitsRate;

  mapping (uint256 => GameParams) public gameParams;
  mapping (uint256 => uint256) public currentRound;
  mapping (uint256 => uint256) public roundStartedAt;
  mapping (uint256 => uint256) public jackpot;
  mapping (uint256 => mapping( uint256 => RoundFunds ) ) public roundFunds;

  /* SETTERS */
  /* Set the payable address of the house */
  function setHouseAddress(address _houseAddress)
    public
    onlyFrontendAdmin
    returns (bool)
  {
    require(_houseAddress!=address(0), "Must be a valid address");
    houseAddress = _houseAddress;
    return true;
  }

  /* Set the payable address of the dividend pool */
  function setDivPoolAddress(address _divPoolAddress)
    public
    onlyFrontendAdmin
    returns (bool)
  {
    require(_divPoolAddress!=address(0), "Must be a valid address");
    divPoolAddress = _divPoolAddress;
    return true;
  }

  /* Set the rate of house mined tokens over user mined tokens: 1 TRX equals an additional 1 WAR to the house for each user mined WAR */
  function setHouseMiningRate(uint256 _houseMiningRate)
    public
    onlyFrontendAdmin
    returns (bool)
  {
    houseMiningRate = _houseMiningRate;
    return true;
  }

  /* Set the rate of dividends distributed to stakeholders over total house profits: */
  /* 1 TRX equals 100% of profits redistributed through dividends to stakeholders */
  function setDividendsToProfitsRate(uint256 _dividendsToProfitsRate)
    public
    onlyFrontendAdmin
    returns (bool)
  {
    require(_dividendsToProfitsRate <= 1 trx, "Must be a valid decimal number");
    dividendsToProfitsRate = _dividendsToProfitsRate;
    return true;
  }

  /* Set the specific game params:  house edge (1 TRX equals 100%) for that game, minimum bet and maximum bet expressed in SUN */
  function setGameParams(uint256 _gameType, uint256 _houseEdge, uint256 _minimumBet, uint256 _maximumBet)
    public
    onlyFrontendAdmin
    returns (bool)
  {
    require(_houseEdge <= 1 trx, "House edge must be a valid decimal number");
    require(_minimumBet != 0, "Minimum bet must be a valid positive number");
    require(_maximumBet != 0, "Maximum bet must be a valid positive number");
    gameParams[_gameType] = GameParams(_houseEdge, _minimumBet, _maximumBet);
    return true;
  }

  /* INTERNALS */
  function _mineTokens(address _recipient, uint256 _amount)
    internal
  {
    /* uint256 _currSupply = Frontend.WAR().totalSupply(); */
    Frontend.WAR().mint(_recipient, _amount);
  }

  function _payHouse(uint256 _amount)
    internal
  {
    uint256 _toDivPool = _amount.mul(dividendsToProfitsRate).div(1 trx);
    uint256 _toHouse = _amount.sub(_toDivPool);
    if (_toDivPool != 0) divPoolAddress.transfer(_toDivPool);
    if (_toHouse != 0) houseAddress.transfer(_toHouse);
  }


  /* LOGIC */
  /* Officially start another round of the game */
  function startGame(uint256 _gameType)
    onlyFrontendAdmin
    whenNotPaused
    public
    returns (bool)
  {
    require(gameParams[_gameType].minimumBet != 0, "Game must be configured correctly");
    require(gameParams[_gameType].maximumBet != 0, "Game must be configured correctly");
    require(roundStartedAt[_gameType]==0, "Game must have been stopped first");
    currentRound[_gameType]++;
    roundStartedAt[_gameType] = block.number;
    emit StartGame(_gameType, currentRound[_gameType], block.number, jackpot[_gameType]);
    return true;
  }

  /* It places the bet, it mines tokens for the user and for the house according to houseMiningRate and records it in an event */
  function bet(uint256 _gameType, uint256 _userChoice)
    public
    payable
    whenNotPaused
    returns (bool)
  {
    require(roundStartedAt[_gameType]!=0, "Game must have been started");
    uint256 _amount = msg.value;
    require(_amount >= gameParams[_gameType].minimumBet, "Bet amount must be equal or greater than minimum bet");
    require(_amount <= gameParams[_gameType].maximumBet, "Bet amount must be equal or lower than maximum bet");
    jackpot[_gameType] = jackpot[_gameType].add(_amount);
    uint256 _houseAmount = _amount.mul(houseMiningRate).div(1 trx);
    _mineTokens(msg.sender, msg.value);
    _mineTokens(houseAddress, _houseAmount);
    emit Bet(_gameType, currentRound[_gameType], msg.sender, msg.value, _userChoice);
    return true;
  }

  /* It deducts and send the house edge, it mantains a _preservedJackpotRate for next round's jackpot and move off the jackpot needed for winning users.
  It returns the closing round number */
  function endGame(uint256 _gameType, uint256 _preservedJackpotRate)
    onlyFrontendAdmin
    whenNotPaused
    public
    returns (bool)
  {
    require(roundStartedAt[_gameType]!=0, "Game must have been started");
    roundStartedAt[_gameType] = 0;
    emit EndGame(_gameType, currentRound[_gameType], block.number, jackpot[_gameType]);
    uint256 _jackpot = jackpot[_gameType];
    uint256 _houseEdge = _jackpot.mul(gameParams[_gameType].houseEdge).div(1 trx);
    _jackpot = _jackpot.sub(_houseEdge);
    uint256 _preservedJackpot = _jackpot.mul(_preservedJackpotRate).div(1 trx);
    _jackpot = _jackpot.sub(_preservedJackpot);
    roundFunds[_gameType][currentRound[_gameType]] = RoundFunds(_jackpot, _jackpot, _houseEdge);
    jackpot[_gameType] = _preservedJackpot;
    _payHouse(_houseEdge);
    return true;
  }

  /* It pays the winning users using available roundFunds */
  function payout(uint256 _gameType, uint256 _round, address _recipient, uint256 _amount)
    public
    onlyFrontendAdmin
    nonReentrant
    whenNotPaused
    returns (bool)
  {
    require(roundFunds[_gameType][_round].availableFunds >= _amount, "Payout must not exceed available funds");
    roundFunds[_gameType][_round].availableFunds = roundFunds[_gameType][_round].availableFunds.sub(_amount);
    emit Payout(_gameType, _round, _recipient, _amount);
    if (_recipient != address(this)) _recipient.transfer(_amount);
    else jackpot[_gameType] = jackpot[_gameType].add(_amount);
    return true;
  }

  /**
   * @notice This contract accepts ether payments
   */
  function() external payable {}
}
