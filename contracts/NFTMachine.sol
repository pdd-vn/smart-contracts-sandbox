// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.21; 

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 
import "./MyNFTToken.sol"; 

contract NFTMachine is MyNFTToken {
    address public erc20Address;

    struct Product { 
        uint256 tokenId;
        uint256 price;
        string uri;
    }

    Product[] products;
    mapping(uint256 => Product) public tokenIdToProduct;

    constructor(address _moneyUse) MyNFTToken(msg.sender) {
        erc20Address = _moneyUse;
    }

    function mintNewNFT(string memory uri, uint256 price) public {
        require(msg.sender == owner(), "You are not owner");
        uint256 tokenId = safeMint(owner(), uri); 
        Product memory newProduct;
        newProduct.tokenId = tokenId; 
        newProduct.price = price;
        newProduct.uri = uri; 
        tokenIdToProduct[tokenId] = newProduct;
        products.push(newProduct); 
    }

    function buyNFT(uint256 _tokenId) public { 
        require(IERC20(erc20Address).allowance(msg.sender, address(this)) >= tokenIdToProduct[_tokenId].price, "insufficient approval");
        IERC20(erc20Address).transferFrom(msg.sender, address(this), tokenIdToProduct[_tokenId].price); 
        this.transferFrom(owner(), msg.sender, _tokenId);
    }

    function getAllNFT() public view returns (Product[] memory) {
        return products; 
    }
}

