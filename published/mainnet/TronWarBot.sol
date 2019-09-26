
// File: contracts/interface/IWarCoin.sol

pragma solidity ^0.4.25;

interface IWarCoin {

  //WarCoin
  function isWAR() external pure returns(bool);
  function mint(address to, uint256 amount) external returns(bool);
  /* function burn(uint256 value) external returns(bool); */
  function authorizedApprove(address spender, uint256 value) external returns (bool);


  //ERC20
  function totalSupply() external view returns (uint256);
  function balanceOf(address owner) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  //ERC20Detailed
  function name() external view returns (string memory);
  function symbol() external view returns (string memory);
  function decimals() external view returns (uint8);
  //ERC20Pausable
  function transfer(address to, uint256 value) external returns (bool);
  function transferFrom(address from, address to, uint256 value) external returns (bool);
  function approve(address spender, uint256 value) external returns (bool);
  function increaseAllowance(address spender, uint addedValue) external returns (bool success);
  function decreaseAllowance(address spender, uint subtractedValue) external returns (bool success);
  //Pausable
  function paused() external view returns (bool);
  function pause() external;
  function unpause() external;
  //PauserRole
  function isPauser(address account) external view returns (bool);
  function addPauser(address account) external;
  function removePauser(address account) external;
  function renouncePauser() external;
  //Ownable
  function owner() external view returns (address);
  function isOwner() external view returns (bool);
  function transferOwnership(address newOwner) external;
  //Backend
  function isBackend() external pure returns (bool);
  function isFrontend(address account) external view returns (bool);
  function addFrontend(address account) external;
  function removeFrontend(address account) external;
  //BackendAdmin
  function isBackendAdmin(address account) external view returns (bool);
  function addBackendAdmin(address account) external;
  function removeBackendAdmin(address account) external;
  function renounceBackendAdmin() external;
  //HasNoEther
  function reclaimEther() external;
  function() external;

  //Events
  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
  event Paused(address account);
  event Unpaused(address account);
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
  event PauserAdded(address indexed account);
  event PauserRemoved(address indexed account);
  event FrontendAdded(address indexed account);
  event FrontendRemoved(address indexed account);
  event BackendAdminAdded(address indexed account);
  event BackendAdminRemoved(address indexed account);
}

// File: contracts/interface/ITronWarBot.sol

pragma solidity ^0.4.25;

interface ITronWarBot {
  /**************/
  /* TronWarBot */
  /**************/
  /* GETTERS */
  /* Returns currently set address of the house */
//  function houseAddress() external view returns (address);
  /* Returns currently set address of the dividend pool */
//  function divPoolAddress() external view returns (address);
  /* Returns the rate of house mined tokens over user mined tokens: x WAR to the house for every 1 WAR to the user   */
//  function houseMiningRate() external view returns (uint256);
  /* Returns the rate of dividends distribution to stakeholders over total house profits: */
  /* 1 TRX equals 100% of profits redistributed through dividends to stakeholders */
//  function dividendsToProfitsRate() external view returns (uint256);
  /* Returns the block number of start of current round for specific game type, 0 if stopped */
//  function roundStartedAt(uint256 _gameType) external view returns (uint256);
  /* Returns house edge, minimum and maximum bet set for specific game type */
//  function gameParams(uint256 _gameType) external view returns (uint256, uint256, uint256);
  /* Returns the current round of the specific game type */
//  function currentRound(uint256 _gameType) external view returns (uint256);
  /* Returns the current available jackpot for the specific game type of current round */
//  function jackpot(uint256 _gameType) external view returns (uint256);
  /* Returns the final archived net jackpot for specific round of gametype, the remaining available funds not yet payed out and the edge paid to house */
//  function roundFunds(uint256 _gameType, uint256 _round) external view returns (uint256, uint256, uint256);

  /* SETTERS */
  /* Set the payable address of the house */
  function setHouseAddress(address _houseAddress) external returns (bool);
  /* Set the payable address of the dividend pool */
  function setDivPoolAddress(address _divPoolAddress) external returns (bool);
  /* Set the rate of house mined tokens over user mined tokens: 1 TRX equals an additional 1 WAR to the house for each user mined WAR */
  function setHouseMiningRate(uint256 _houseMiningRate) external returns (bool);
  /* Set the rate of dividends distributed to stakeholders over total house profits: */
  /* 1 TRX equals 100% of profits redistributed through dividends to stakeholders */
  function setDividendsToProfitsRate(uint256 _dividendsToProfitsRate) external returns (bool);
  /* Set the specific game params:  house edge (1 TRX equals 100%) for that game, minimum bet and maximum bet expressed in SUN */
  function setGameParams(uint256 _gameType, uint256 _houseEdge, uint256 _minimumBet, uint256 _maximumBet) external returns (bool);

  /* LOGIC */
  /* Officially start another round of the game */
  function startGame(uint256 _gameType, bool _playAgainstDealer) external returns (bool);
  /* It places the bet, it mines tokens for the user and for the house according to houseMiningRate and records it in an event */
  function bet(uint256 _gameType, uint256 _userChoice, uint256 _betReference) external payable returns (bool);
  /* It deducts and send the house edge, it mantains a _preservedJackpotRate for next round's jackpot and move off the jackpot needed for winning users.
     It returns the closing round number */
  function endGame(uint256 _gameType, uint256 _preservedJackpotRate) external returns (bool);
  /* It pays the winning users using available roundFunds */
  function payout(uint256 _gameType, uint256 _round, address _recipient, uint256 _amount) external returns (bool);
  /* Function to reload contract funds */
  function deposit() external payable returns (bool);

  event Bet(uint256 indexed gameType, uint256 indexed round, address from, uint256 amount, uint256 userChoice, uint256 indexed betReference);
  event Payout(uint256 indexed gameType, uint256 indexed round, address indexed to, uint256 amount);
  event StartGame(uint256 indexed gameType, uint256 indexed round, uint256 startBlock, uint256 initialJackpot);
  event EndGame(uint256 indexed gameType, uint256 indexed round, uint256 endBlock, uint256 finalJackpot);
  event GameParamsChanged(uint256 indexed gameType, uint256 houseEdge, uint256 minimumBet, uint256 maximumBet);

  /*********/
  /* UTILS */
  /*********/
  /* Frontend */
  function isBackendConfigured() external view returns(bool);
  function changeWarCoinContract(address newAddress) external returns(bool);
  function WAR() external view returns(IWarCoin);
  /* FrontendAdmin */
  function isAdmin(address _account) external view returns (bool);
  function isFrontendAdmin(address _account) external view returns (bool);
  function addFrontendAdmin(address _account) external;
  function removeFrontendAdmin(address _account) external;
  function renounceFrontendAdmin() external;
}

// File: contracts/utils/SafeMath.sol

pragma solidity ^0.4.25;

/**
 * @title SafeMath
 * @dev Unsigned math operations with safety checks that revert on error
 */
library SafeMath {
    /**
     * @dev Multiplies two unsigned integers, reverts on overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b);

        return c;
    }

    /**
     * @dev Integer division of two unsigned integers truncating the quotient, reverts on division by zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Subtracts two unsigned integers, reverts on overflow (i.e. if subtrahend is greater than minuend).
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Adds two unsigned integers, reverts on overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);

        return c;
    }

    /**
     * @dev Divides two unsigned integers and returns the remainder (unsigned integer modulo),
     * reverts when dividing by zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}

// File: contracts/utils/ReentrancyGuard.sol

pragma solidity ^0.4.25;

/**
 * @title Helps contracts guard against reentrancy attacks.
 * @author Remco Bloemen <remco@2π.com>, Eenae <alexey@mixbytes.io>
 * @dev If you mark a function `nonReentrant`, you should also
 * mark it `external`.
 */
contract ReentrancyGuard {
    /// @dev counter to allow mutex lock with only one SSTORE operation
    uint256 private _guardCounter;

    constructor () internal {
        // The counter starts at one to prevent changing it from zero to a non-zero
        // value, which is a more expensive operation.
        _guardCounter = 1;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and make it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _guardCounter += 1;
        uint256 localCounter = _guardCounter;
        _;
        require(localCounter == _guardCounter);
    }
}

// File: contracts/interface/IAdmin.sol

pragma solidity ^0.4.25;

/**
 * @title IAdmin
 * @notice Admins have special permissions and are responsible for mantaining a contract.
 */
interface IAdmin {

  /**
   * @dev It MUST implement the function that checks whether an address is an admin
   */
  function isAdmin(address account) external view returns (bool);

  /**
   * @dev This modifier checks if the caller is an admin of the contract
   */
  modifier onlyAdmin() {
    require(this.isAdmin(msg.sender));
    _;
  }

}

// File: contracts/utils/Ownable.sol

pragma solidity ^0.4.25;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    constructor () internal {
        _owner = msg.sender;
        emit OwnershipTransferred(address(0), _owner);
    }

    /**
     * @return the address of the owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(isOwner());
        _;
    }

    /**
     * @return true if `msg.sender` is the owner of the contract.
     */
    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    /**
     * @dev Allows the current owner to relinquish control of the contract.
     * It will not be possible to call the functions with the `onlyOwner`
     * modifier anymore.
     * @notice Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    // function renounceOwnership() public onlyOwner {
    //     emit OwnershipTransferred(_owner, address(0));
    //     _owner = address(0);
    // }

    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0));
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

// File: contracts/utils/Counters.sol

pragma solidity ^0.4.25;


/**
 * @title Counters
 * @author Matt Condon (@shrugs)
 * @dev Provides counters that can only be incremented or decremented by one. This can be used e.g. to track the number
 * of elements in a mapping, issuing ERC721 ids, or counting request ids
 *
 * Include with `using Counters for Counters.Counter;`
 * Since it is not possible to overflow a 256 bit integer with increments of one, `increment` can skip the SafeMath
 * overflow check, thereby saving gas. This does assume however correct usage, in that the underlying `_value` is never
 * directly accessed.
 */
library Counters {
    using SafeMath for uint256;

    struct Counter {
        // This variable should never be directly accessed by users of the library: interactions must be restricted to
        // the library's function. As of Solidity v0.5.2, this cannot be enforced, though there is a proposal to add
        // this feature: see https://github.com/ethereum/solidity/issues/4637
        uint256 _value; // default: 0
    }

    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(Counter storage counter) internal {
        counter._value = counter._value.add(1);
    }

    function decrement(Counter storage counter) internal {
        counter._value = counter._value.sub(1);
    }
}

// File: contracts/roles/Roles.sol

pragma solidity ^0.4.25;

/**
 * @title Roles
 * @dev Library for managing addresses assigned to a Role.
 */
library Roles {
    using Counters for Counters.Counter;
    struct Role {
        mapping (address => bool) bearer;
        Counters.Counter size;
    }

    /**
     * @dev give an account access to this role
     */
    function add(Role storage role, address account) internal {
        require(account != address(0));
        require(!has(role, account));

        role.bearer[account] = true;
        role.size.increment();
    }

    /**
     * @dev remove an account's access to this role
     */
    function remove(Role storage role, address account) internal {
        require(account != address(0));
        require(has(role, account));

        role.bearer[account] = false;
        role.size.decrement();
    }

    /**
     * @dev check if an account has this role
     * @return bool
     */
    function has(Role storage role, address account) internal view returns (bool) {
        require(account != address(0));
        return role.bearer[account];
    }

    /**
     * @dev check how many accounts has this role
     * @return bool
     */
    function count(Role storage role) internal view returns (uint256) {
        return role.size.current();
    }
}

// File: contracts/roles/PauserRole.sol

pragma solidity ^0.4.25;



/**
 * @title PauserRole
 * @dev PauserRoles are account that are entitled to stop a contract operation in case an emergency arise.
 * That could be represented by a contract vulnerability discovery, an ongoing contract upgrade or any greater cause.
 * PauserRoles are managed by contract admins, but they also might eventually renounce to the title of Pauser indipendently.
 */
contract PauserRole is IAdmin {
    using Roles for Roles.Role;

    event PauserAdded(address indexed account);
    event PauserRemoved(address indexed account);

    Roles.Role private _pausers;

    constructor () internal {
        _addPauser(msg.sender);
    }

    modifier onlyPauser() {
        require(isPauser(msg.sender));
        _;
    }

    function isPauser(address account) public view returns (bool) {
        return _pausers.has(account);
    }

    function addPauser(address account) public onlyAdmin {
        _addPauser(account);
    }

    function removePauser(address account) public onlyAdmin {
        _removePauser(account);
    }

    function renouncePauser() public {
        _removePauser(msg.sender);
    }

    function _addPauser(address account) internal {
        _pausers.add(account);
        emit PauserAdded(account);
    }

    function _removePauser(address account) internal {
        _pausers.remove(account);
        emit PauserRemoved(account);
    }
}

// File: contracts/utils/Pausable.sol

pragma solidity ^0.4.25;


/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is PauserRole {
    event Paused(address account);
    event Unpaused(address account);

    bool private _paused;

    constructor () internal {
        _paused = false;
    }

    /**
     * @return true if the contract is paused, false otherwise.
     */
    function paused() public view returns (bool) {
        return _paused;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     */
    modifier whenNotPaused() {
        require(!_paused);
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     */
    modifier whenPaused() {
        require(_paused);
        _;
    }

    /**
     * @dev called by the pauser to pause, triggers stopped state
     */
    function pause() public onlyPauser whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @dev called by the pauser to unpause, returns to normal state
     */
    function unpause() public onlyPauser whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }
}

// File: contracts/utils/Destructible.sol

pragma solidity ^0.4.25;


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

// File: contracts/roles/FrontendAdmin.sol

pragma solidity ^0.4.25;




/**
 * @title FrontendAdmin
 * @dev FrontendAdmins are responsible for managing frontend contracts,
 * i.e. contracts that use backend contracts as data storage, thus they can specify backend contracts as storage.
 * FrontendAdmins can only be added or removed by the owner of the contract, but they might eventually renounce to the title indipendently
 */
contract FrontendAdmin is IAdmin, Ownable {
    using Roles for Roles.Role;

    event FrontendAdminAdded(address indexed account);
    event FrontendAdminRemoved(address indexed account);

    Roles.Role private _frontendAdmins;

    constructor () internal {
        _addFrontendAdmin(msg.sender);
    }

    modifier onlyFrontendAdmin() {
        require(isFrontendAdmin(msg.sender));
        _;
    }

    function isAdmin(address account) public view returns (bool) {
        return isFrontendAdmin(account);
    }

    function isFrontendAdmin(address account) public view returns (bool) {
        return _frontendAdmins.has(account);
    }

    function addFrontendAdmin(address account) public onlyOwner {
        _addFrontendAdmin(account);
    }

    function removeFrontendAdmin(address account) public onlyOwner {
        _removeFrontendAdmin(account);
    }

    function renounceFrontendAdmin() public {
        _removeFrontendAdmin(msg.sender);
    }

    function _addFrontendAdmin(address account) internal {
        _frontendAdmins.add(account);
        emit FrontendAdminAdded(account);
    }

    function _removeFrontendAdmin(address account) internal {
        _frontendAdmins.remove(account);
        emit FrontendAdminRemoved(account);
    }
}

// File: contracts/architecture/Frontend.sol

pragma solidity ^0.4.25;

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

// File: contracts/TronWarBot.sol

pragma solidity ^0.4.25;

/**
 * @title TronWarBot v0.2
 * @author Samuele Rodi (a.k.a. Sam Fisherman)
 * @notice This TronWarBot contract is the first release of the TronWarBot logic contract.
 */
contract TronWarBot is  ITronWarBot, Frontend, ReentrancyGuard, Destructible {

  using SafeMath for uint256;

  struct GameParams {
    uint256 houseEdge;
    uint256 minimumBet;
    uint256 maximumBet;
  }

  struct RoundFunds {
    bool playAgainstDealer;
    uint256 finalJackpot;
    uint256 availableFunds;
    uint256 houseEdge;
  }

  address public houseAddress;
  address public divPoolAddress;
  uint256 public houseMiningRate;
  uint256 public dividendsToProfitsRate;

  uint256 public houseReserves;

  mapping (uint256 => GameParams) public gameParams;
  mapping (uint256 => uint256) public currentRound;
  mapping (uint256 => uint256) public roundStartedAt;
  mapping (uint256 => uint256) public jackpot;
  mapping (uint256 => mapping( uint256 => RoundFunds ) ) public roundFunds;

  /* MINING PARAMS */
  /* In total 100M WAR will ever be mined.
  The mining rate of WAR goes through 100 steps.
  To begin with, 500 TRX are required to mine 1 WAR.
  Every time the supply of WAR increases of one percentage point (the step) with respect to the total cap,
  the mining requirement increases of 50 TRX per WAR.
  In this way, the last mining step will see a mining requirement of 5500 TRX per WAR */

  uint256 public war = 1000000000000000000;
  uint256 public miningCap = 100000000; //WAR
  uint256 public miningStep =  1000000; //WAR
  uint256 public miningRateDelta = 50; //TRX per WAR
  uint256 public initialMiningRate = 500; //TRX per WAR
  uint256 public miningRate;



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
    emit GameParamsChanged(_gameType, _houseEdge, _minimumBet, _maximumBet);
    return true;
  }

  /* INTERNALS */
  function _mineTokens(address _recipient, uint256 _amount)
    internal
    returns (bool)
  {
    uint256 _currSupply = Frontend.WAR().totalSupply().div(war);
    if (_currSupply >= miningCap) return false;
    uint256 _step = _currSupply.div(miningStep);
    uint256 _delta = _step.mul(miningRateDelta);
    miningRate = initialMiningRate.add(_delta);
    uint256 _tokens = _amount.mul(war).div(1 trx).div(miningRate);
    return Frontend.WAR().mint(_recipient, _tokens);
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
  function startGame(uint256 _gameType, bool _playAgainstDealer)
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
    roundFunds[_gameType][currentRound[_gameType]] = RoundFunds(_playAgainstDealer, 0, 0, 0);
    if (_playAgainstDealer) {
      houseReserves = houseReserves.add(jackpot[_gameType]);
      jackpot[_gameType] = 0;
    }
    emit StartGame(_gameType, currentRound[_gameType], block.number, jackpot[_gameType]);
    return true;
  }

  /* It places the bet, it mines tokens for the user and for the house according to houseMiningRate and records it in an event */
  function bet(uint256 _gameType, uint256 _userChoice, uint256 _betReference)
    public
    payable
    whenNotPaused
    returns (bool)
  {
    require(roundStartedAt[_gameType]!=0, "Game must have been started");
    uint256 _amount = msg.value;
    require(_amount >= gameParams[_gameType].minimumBet, "Bet amount must be equal or greater than minimum bet");
    require(_amount <= gameParams[_gameType].maximumBet, "Bet amount must be equal or lower than maximum bet");

    if (roundFunds[_gameType][currentRound[_gameType]].playAgainstDealer){
       houseReserves = houseReserves.add(_amount);
       roundFunds[_gameType][currentRound[_gameType]].finalJackpot = roundFunds[_gameType][currentRound[_gameType]].finalJackpot.add(_amount);
    } else {
      jackpot[_gameType] = jackpot[_gameType].add(_amount);
    }

    uint256 _houseMiningAmount = _amount.mul(houseMiningRate).div(1 trx);
    _mineTokens(msg.sender, msg.value);
    _mineTokens(houseAddress, _houseMiningAmount);
    emit Bet(_gameType, currentRound[_gameType], msg.sender, msg.value, _userChoice, _betReference);
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

    // IF GAME IS AGAINST DEALER HOUSEEDGE IS CALCULATED DURING PAYOUT
    if (roundFunds[_gameType][currentRound[_gameType]].playAgainstDealer) return true;

    uint256 _jackpot = jackpot[_gameType];
    uint256 _preservedJackpot = _jackpot.mul(_preservedJackpotRate).div(1 trx);
    _jackpot = _jackpot.sub(_preservedJackpot);
    uint256 _houseEdge = _jackpot.mul(gameParams[_gameType].houseEdge).div(1 trx);
    _jackpot = _jackpot.sub(_houseEdge);
    roundFunds[_gameType][currentRound[_gameType]].finalJackpot = _jackpot;
    roundFunds[_gameType][currentRound[_gameType]].availableFunds = _jackpot;
    roundFunds[_gameType][currentRound[_gameType]].houseEdge = _houseEdge;
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

    if (roundFunds[_gameType][_round].playAgainstDealer) {
      require(houseReserves >= _amount, "Payout must not exceed available funds");
      houseReserves = houseReserves.sub(_amount);
      uint256 _houseEdge = _amount.mul(gameParams[_gameType].houseEdge).div(1 trx);
      _amount = _amount.sub(_houseEdge);
      roundFunds[_gameType][_round].houseEdge = roundFunds[_gameType][_round].houseEdge.add(_houseEdge);
      emit Payout(_gameType, _round, _recipient, _amount);
      _payHouse(_houseEdge);
      if (_recipient != address(this)) _recipient.transfer(_amount);
      else houseReserves = houseReserves.add(_amount);
      return true;
    }

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
  function deposit()
    public
    payable
    returns (bool)
  {
    houseReserves = houseReserves.add(msg.value);
    return true;
  }
}
