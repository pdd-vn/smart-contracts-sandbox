// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LendingMachineBase.sol";

contract LendingMachine is LendingMachineBase {
    // owner is operator :)
    address public ERC20_ADDRESS;
    uint8 public INTEREST; // 1 to 100 percent per day
    uint16 public NUM_NFTS;
    mapping(uint256 => NFT) public nft_id_mapping;
    event MintNewNFT(uint256 token_id);

    struct NFT {
        uint256 token_id;
        address owner;
        uint256 price;
        address tmp_owner;
        uint256 lending_at;
        uint256 interest;
        uint8 lend_duration;
        bool is_deposited;
    }

    constructor(
        address erc20_address,
        uint8 base_interest
    ) LendingMachineBase() {
        ERC20_ADDRESS = erc20_address;
        INTEREST = base_interest;
    }

    function mint_new_nft(string memory uri) public {
        NFT memory _nft;
        _nft.token_id = safeMint(msg.sender, uri);
        _nft.owner = msg.sender;
        _nft.is_deposited = false;
        nft_id_mapping[_nft.token_id] = _nft;

        emit MintNewNFT(_nft.token_id);
        NUM_NFTS += 1;
    }

    function deposit(uint256 token_id, uint256 price, uint8 lend_duration) public {
        require(
            nft_id_mapping[token_id].is_deposited == false,
            "ERROR: Token is not deposited or does not exist"
        );

        require(
            nft_id_mapping[token_id].owner == msg.sender,
            "ERROR: Insufficient ownership"
        );
        nft_id_mapping[token_id].price = price;
        nft_id_mapping[token_id].is_deposited = true;
        nft_id_mapping[token_id].lend_duration = lend_duration;

        transferFrom(msg.sender, owner(), token_id);
    }

    function lend(uint256 token_id) public {
        NFT memory token = nft_id_mapping[token_id];

        require(token.owner != msg.sender, "ERROR: Owners can't lend themself");

        require(token.is_deposited, "ERROR: NFT is not deposited");

        require(
            IERC20(ERC20_ADDRESS).allowance(msg.sender, address(this)) >=
                token.price,
            "ERROR: Insufficient allowance"
        );

        require(
            IERC20(ERC20_ADDRESS).balanceOf(msg.sender) >= token.price,
            "ERROR: Insufficient balance"
        );

        IERC20(ERC20_ADDRESS).transferFrom(
            msg.sender,
            token.owner,
            token.price
        );
        nft_id_mapping[token_id].tmp_owner = msg.sender;
        nft_id_mapping[token_id].interest = INTEREST;
        nft_id_mapping[token_id].lending_at = block.timestamp;
        nft_id_mapping[token_id].is_deposited = false;
    }

    function repay(uint256 token_id) public {
        NFT memory token = nft_id_mapping[token_id];
        require(msg.sender == token.owner, "ERROR: Not token's owner");

        require(token.tmp_owner != address(0), "ERROR: Token is not lended");

        uint256 current_lend_duration = (block.timestamp - token.lending_at) /
            86400;
        require(
            current_lend_duration <= token.lend_duration,
            "ERROR: Lend duration exceeded. NFT will be transfered to new owner"
        );

        uint256 debt = token.price + current_lend_duration * token.interest;
        require(
            IERC20(ERC20_ADDRESS).allowance(msg.sender, address(this)) >= debt,
            "ERROR: Insufficient allowance"
        );
        require(
            IERC20(ERC20_ADDRESS).balanceOf(token.owner) >= debt,
            "ERROR: Insufficient balance"
        );
        IERC20(ERC20_ADDRESS).transferFrom(msg.sender, token.tmp_owner, debt);
        nft_id_mapping[token_id].tmp_owner = address(0);
        nft_id_mapping[token_id].interest = 0;
        nft_id_mapping[token_id].lending_at = 0;
        transferFrom(owner(), msg.sender, token_id);
    }

    function claim(uint256 token_id) public {
        NFT memory token = nft_id_mapping[token_id];
        require(msg.sender == token.tmp_owner, "ERROR: Not token's temporary owner");
        
        // uint256 current_lend_duration = (block.timestamp - token.lending_at) /
        //     86400;
        // require(
        //     current_lend_duration > token.lend_duration,
        //     "ERROR: Item is still in lending duration. Please wait until lend duration exceeded"
        // );

        // uint256 lending_at;
        // uint256 interest;
        // uint8 lend_duration;
        // bool is_deposited;

        transferFrom(owner(), msg.sender, token_id);
        nft_id_mapping[token_id].owner = msg.sender;
        nft_id_mapping[token_id].price = 0;
        nft_id_mapping[token_id].tmp_owner = address(0);
        nft_id_mapping[token_id].lending_at = 0;
        nft_id_mapping[token_id].interest = 0;
        nft_id_mapping[token_id].lend_duration = 0;
        nft_id_mapping[token_id].is_deposited = false;
    }

    function get_num_nfts() public view returns (uint16) {
        return NUM_NFTS;
    }

    function list_nfts() public view returns (NFT[] memory) {
        NFT[] memory nfts = new NFT[](NUM_NFTS);
        for (uint i = 0; i < NUM_NFTS; i++) {
            nfts[i] = nft_id_mapping[i];
        }
        return nfts;
    }
}
