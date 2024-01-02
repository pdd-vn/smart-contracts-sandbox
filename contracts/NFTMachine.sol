// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MyNFTToken.sol";

contract NFTMachine is MyNFTToken {
    address public erc20Address;
    uint8 public interest; // 1 to 100 per day

    struct Product {
        uint256 tokenId;
        uint256 price;
        string uri;
        address owner;
        address tmpOwner;
        uint256 lendingDay;
        uint256 period;
        uint8 interest;
    }

    Product[] products;
    mapping(uint256 => Product) public tokenIdToProduct;

    constructor(address erc20address, uint8 base_interest) MyNFTToken(msg.sender) {
        erc20Address = erc20address;
        interest = base_interest;
    }

    function set_interest(uint8 new_interest) public {
        interest = new_interest;
    }

    function mintNewNFT(string memory uri, uint256 price, uint256 period) public {
        // Sender will delegate the NFT to NFTMachine.
        uint256 tokenId = safeMint(address(this), uri);
        Product memory newProduct;
        newProduct.tokenId = tokenId;
        newProduct.uri = uri;
        newProduct.price = price;
        newProduct.period = period;
        newProduct.owner = msg.sender;
        tokenIdToProduct[tokenId] = newProduct;
        products.push(newProduct);
    }

    function lend(uint256 _tokenId) public {
        require(
            IERC20(erc20Address).allowance(msg.sender, tokenIdToProduct[_tokenId].owner) >=
                tokenIdToProduct[_tokenId].price,
            "Insufficient approval"
        );

        IERC20(erc20Address).transferFrom(
            msg.sender,
            tokenIdToProduct[_tokenId].owner,
            tokenIdToProduct[_tokenId].price
        );

        // Put NFT on hold
        tokenIdToProduct[_tokenId].tmpOwner = msg.sender;
        tokenIdToProduct[_tokenId].lendingDay = block.timestamp;
        tokenIdToProduct[_tokenId].interest = interest;
    }

    function repay(uint256 _tokenId) public {
        // Owner will call this function to get back their NFT
        require(tokenIdToProduct[_tokenId].tmpOwner != address(0), "NFT is not on hold");
        require(tokenIdToProduct[_tokenId].owner == msg.sender, "Not original owner of NFT");
        require(
            tokenIdToProduct[_tokenId].period > block.timestamp - tokenIdToProduct[_tokenId].lendingDay, 
            "The loan is overdue. NFT will be transfered to new owner."
        );

        // Second to day
        uint256 loan = tokenIdToProduct[_tokenId].price * ((block.timestamp - tokenIdToProduct[_tokenId].lendingDay) / 86400) * tokenIdToProduct[_tokenId].interest;
        require(
            IERC20(erc20Address).allowance(msg.sender, tokenIdToProduct[_tokenId].tmpOwner) >= loan,
            "Insufficient approval"
        );
        IERC20(erc20Address).transferFrom(
            msg.sender,
            tokenIdToProduct[_tokenId].owner,
            loan
        );
    }

    function claim(uint256 _tokenId) public {
        // Temporary Owner will call this function to claim the ownership of NFT
        require(tokenIdToProduct[_tokenId].tmpOwner == msg.sender, "Not temporary owner");
        require(
            tokenIdToProduct[_tokenId].period < block.timestamp - tokenIdToProduct[_tokenId].lendingDay, 
            "The lending process is still in the middle of the period. Can't claim yet"
        );

        // Set ownership to new owner
        tokenIdToProduct[_tokenId].owner = msg.sender;
        tokenIdToProduct[_tokenId].tmpOwner = address(0);
        tokenIdToProduct[_tokenId].lendingDay = 0;
        tokenIdToProduct[_tokenId].interest = 0;
    }

    function getAllNFT() public view returns (Product[] memory) {
        return products;
    }
}
