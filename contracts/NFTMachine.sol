// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MyNFTToken.sol";

contract NFTMachine is MyNFTToken {
    address public erc20Address;
    uint8 public interest; // 1 to 100 per day
    event Number(uint256 amount);

    struct Product {
        uint256 tokenId;
        uint256 price;
        string uri;
        address owner;
        address tmpOwner;
        uint256 lending;
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
        uint256 tokenId = safeMint(msg.sender, uri);
        _transfer(msg.sender, owner(), tokenId);
        Product memory newProduct;
        newProduct.tokenId = tokenId;
        newProduct.uri = uri;
        newProduct.price = price;
        newProduct.period = period;
        newProduct.owner = msg.sender;
        tokenIdToProduct[tokenId] = newProduct;
        products.push(newProduct);
    }

    function approve_to_spend(uint256 _tokenId) public {
        require(
            IERC20(erc20Address).balanceOf(msg.sender) >=
                tokenIdToProduct[_tokenId].price,
            "ERROR: Insufficient balance"
        );

        IERC20(erc20Address).approve(msg.sender, tokenIdToProduct[_tokenId].price);
    }

    function lend(uint256 _tokenId) public {
        // require(
        //     IERC20(erc20Address).allowance(msg.sender, address(this)) >=
        //         tokenIdToProduct[_tokenId].price,
        //     "ERROR: Insufficient approval"
        // );

        IERC20(erc20Address).transferFrom(
            address(this),
            address(tokenIdToProduct[_tokenId].owner),
            tokenIdToProduct[_tokenId].price
        );

        // Put NFT on hold
        tokenIdToProduct[_tokenId].tmpOwner = msg.sender;
        tokenIdToProduct[_tokenId].lending = block.timestamp; // second, not day
        tokenIdToProduct[_tokenId].interest = interest;
    }

    function repay(uint256 _tokenId) public {
        // Owner will call this function to get back their NFT
        require(tokenIdToProduct[_tokenId].tmpOwner != address(0), "NFT is not on hold");
        require(tokenIdToProduct[_tokenId].owner == msg.sender, "Not original owner of NFT");
        require(
            tokenIdToProduct[_tokenId].period > (block.timestamp - tokenIdToProduct[_tokenId].lending) / 86400, 
            "The loan is overdue. NFT will be transfered to new owner"
        );

        uint256 loan = tokenIdToProduct[_tokenId].price * ((block.timestamp - tokenIdToProduct[_tokenId].lending) / 86400) * tokenIdToProduct[_tokenId].interest / 100;
        require(
            IERC20(erc20Address).allowance(msg.sender, tokenIdToProduct[_tokenId].tmpOwner) >= loan,
            "Insufficient approval"
        );
        IERC20(erc20Address).transferFrom(
            msg.sender,
            tokenIdToProduct[_tokenId].owner,
            loan
        );
    
        // Return NFT to owner
        _transfer(owner(), tokenIdToProduct[_tokenId].owner, _tokenId);
    }

    function claim(uint256 _tokenId) public {
        // Temporary Owner will call this function to claim the ownership of NFT
        require(tokenIdToProduct[_tokenId].tmpOwner == msg.sender, "Not temporary owner");
        require(
            tokenIdToProduct[_tokenId].period < (block.timestamp - tokenIdToProduct[_tokenId].lending) / 86400, 
            "The lending process is still in the middle of the period. Can't claim yet"
        );
        // Return NFT to new owner
        _transfer(owner(), tokenIdToProduct[_tokenId].tmpOwner, _tokenId);

        // Set ownership to new owner
        tokenIdToProduct[_tokenId].owner = msg.sender;
        tokenIdToProduct[_tokenId].tmpOwner = address(0);
        tokenIdToProduct[_tokenId].lending = 0;
        tokenIdToProduct[_tokenId].interest = 0;

    }

    function getAllNFT() public view returns (Product[] memory) {
        return products;
    }
}
