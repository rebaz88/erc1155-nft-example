pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract YourCollectible is ERC1155, Ownable {
  uint256 private _currentTokenID = 0;
	mapping(uint256 => uint256) public tokenSupply;

  constructor(string memory _uri) ERC1155(_uri) 
  {}

  function mint(
      address _to,
		  uint256 _id,
		  uint256 _quantity,
		  bytes memory _data
  )
      public
      onlyOwner
  {
      if(tokenSupply[_id] == 0)
        require(_id == _currentTokenID, "Wrong id provided");

		  _mint(_to, _id, _quantity, _data);
		  tokenSupply[_id] = tokenSupply[_id] + _quantity;
      _incrementTokenTypeId();
  }

    // Number of gorillas should be greater than or equal to 5 to unlock zebras
    modifier zebrasAreNotLocked (uint256 _id) {
        if(_id == 2) {
            require(balanceOf(_msgSender(), 0) >= 5, "Zebras are locked. You should have at least 5 gorillas to unlock zebras");
        }
        _;
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual override zebrasAreNotLocked(id) {
        
        if(tokenSupply[id] == 0)
            require(id == _currentTokenID, "Wrong id provided");

        super.safeTransferFrom(from, to, id, amount, data);
    }
  
  /**
	 * @dev calculates the next token ID based on value of _currentTokenID
	 * @return uint256 for the next token ID
	 */
	function _getNextTokenID() private view returns (uint256) {
		  return _currentTokenID + 1;
	}

	/**
	 * @dev increments the value of _currentTokenID
	 */
	function _incrementTokenTypeId() private {
		  _currentTokenID++;
	}

  function getCurrentTokenID() public view returns(uint256){
      return _currentTokenID;
  }
}
