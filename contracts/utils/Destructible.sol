pragma solidity ^0.4.25;

import "../interface/IAdmin.sol";

import "../utils/Ownable.sol";
import "../utils/Pausable.sol";


/**
 * @title Destructible
 * @dev Base contract that can be destroyed by owner. All funds in contract will be sent to the owner.
 */
contract Destructible is IAdmin, Ownable, Pausable {
  /**
   * @dev Transfers the current balance to the owner and terminates the contract.
   */
  function destroy()
    public
    onlyAdmin
    whenPaused
  {
    selfdestruct(Ownable.owner());
  }

  function destroyAndSend(address _recipient)
    public
    onlyOwner
    whenPaused
  {
    selfdestruct(_recipient);
  }
}
