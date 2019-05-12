pragma solidity ^0.5.2;

import './interface/ITronWarBot.sol';
import './interface/IWarCoin.sol';

import './frontend/Frontend.sol';

/**
 * @title TronWarBot v0.1
 * @author Samuele Rodi (a.k.a. Sam Fisherman)
 * @notice This TronWarBot contract is the first release of the TronWarBot logic contract.
 */
contract TronWarBot is ITronWarBot, Frontend {

  uint256 houseEdge;
  address payable house;


  function bet() public
    whenNotPaused
    returns (bool)
  {
    Frontend.WAR().mint(msg.sender, 0);
    return true;
  }

  function payout() public
    onlyFrontendAdmin
    whenNotPaused
    returns (bool)
  {
    return true;
  }

  /**
   * @notice This contract accepts ether payments
   */
  function() external payable {}
}
