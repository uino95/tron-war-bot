pragma solidity ^0.4.25;

import '../interface/IWarCoin.sol';

import '../roles/FrontendAdmin.sol';

/**
 * @title Frontend
 * @notice The Frontend contract is an interface to all the backend contracts.
 * This structure simplify the upgradability as it make it possible to separate logic from storage
 * while guaranteeing the correct write permissions to the storage.
 * Current implementation includes a pointer to WarCoin contract.
 */
contract Frontend is FrontendAdmin {

  IWarCoin private _WAR;

  /**
   * @dev Make sure the entire logic contract has been correctly configured.
   */
  function isBackendConfigured()
  public
  view
  returns(bool)
  {
    require(address(_WAR)!=address(0), "WarCoin contract not configured.");
    return true;
  }

  /**
   * @dev Change the address of the backend WarCoin contract.
   * @param _newAddress The address of the newly deployed contract.
   */
  function changeWarCoinContract(address _newAddress)
  public
  onlyFrontendAdmin
  returns(bool)
  {
    require(_newAddress!=address(0), "Address must be specified.");
    require(IWarCoin(_newAddress).isWAR(), "Address is not a valid backend contract.");
    _WAR =IWarCoin(_newAddress);
    return true;
  }


  /**
   * @dev Return the Backend WarCoin contract.
   */
  function WAR()
  public
  view
  returns(IWarCoin)
  {
    require(address(_WAR)!=address(0), "WarCoin contract is not configured.");
    return _WAR;
  }

}
