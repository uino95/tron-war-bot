pragma solidity ^0.4.25;

import './interface/IWarCoin.sol';

import './architecture/Backend.sol';
import './utils/HasNoEther.sol';
import './ERC20/ERC20Pausable.sol';
import './ERC20/ERC20Metadata.sol';
import './ERC20/ERC20Detailed.sol';

/**
 * @title WarCoin
 * @author Samuele Rodi (a.k.a. Sam Fisherman)
 * @notice This is the official WarCoin token contract.
 * It is a backend ERC20 contract used for the TronWarBot dApp contract.
 */
contract WarCoin is IWarCoin, ERC20Pausable, ERC20Detailed("WarCoin","WAR", 18), ERC20Metadata, HasNoEther, Backend {


  constructor(string memory tokenURI) ERC20Metadata(tokenURI) public {}

  /**
   * @notice Function that confirms that this contract implements a ZtickyCoinZ interface
   * @return true.
   */
  function isWAR()
    public
    pure
    returns(bool)
  {
    return true;
  }

  /**
   * @notice Function to mint tokens restricted to frontend contracts
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount)
    onlyFrontend
    whenNotPaused
    public
    returns (bool)
  {
    /**
     * @dev This represents a single point of failure as it gives to a single address, i.e. the backend admin responsible
     * to manage frontend contracts, the power of minting to any arbitrary address.
     * However, this vulnerability is strongly mitigated by a frontend activation
     * time which provides enough time for the ban of the malicious backend admin,
     * or in case of private key theft, and the removal of the undesired frontend contract.
     */
    ERC20._mint(_to, _amount);
    return true;
  }

  /**
   * @notice This function allows the frontend contract to directly withdraw from user balance
   * using an authorized preapproval scheme. This is done in order to reduce user interactions
   * when invoked from logic contract and conclude a WAR transfer together with additional logic
   * within a single transaction.
   * @param spender The address of the approved spender.
   * @param value The amount of approval.
   * @return A boolean that indicates if the operation was successful.
   */
  function authorizedApprove(address spender, uint256 value) public
    onlyFrontend
    whenNotPaused
    returns (bool)
  {
    /**
     * @dev tx.origin because only the legitimate caller is allowed to grant approval.
     * This is necessary for security reasons and to avoid creating a system with a single point of failure.
     */
    ERC20._approve(tx.origin, spender, value);
    return true;
  }

}
