// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;
import "./LendingMachineBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LendingMachine is LendingMachineBase {
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
        uint8 interest;
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

    function deposit(uint256 token_id, uint256 price) public {
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
        transferFrom(msg.sender, address(this), token_id);
    }

    function lend(uint256 token_id) public {
        require(
            nft_id_mapping[token_id].owner != msg.sender,
            "ERROR: Owners can't lend themself"
        );

        require(
            nft_id_mapping[token_id].is_deposited,
            "ERROR: NFT is not deposited"
        );

        require(
            IERC20(ERC20_ADDRESS).allowance(msg.sender, address(this)) >=
                nft_id_mapping[token_id].price,
            "ERROR: Insufficient allowance"
        );

        require(
            IERC20(ERC20_ADDRESS).balanceOf(msg.sender) >=
                nft_id_mapping[token_id].price,
            "ERROR: Insufficient balance"
        );

        IERC20(ERC20_ADDRESS).transferFrom(
            msg.sender,
            nft_id_mapping[token_id].owner,
            nft_id_mapping[token_id].price
        );
        nft_id_mapping[token_id].tmp_owner = msg.sender;
        nft_id_mapping[token_id].interest = INTEREST;
        nft_id_mapping[token_id].lending_at = block.timestamp;
        nft_id_mapping[token_id].is_deposited = false;
    }

    function get_num_nfts() public view returns (uint16) {
        return NUM_NFTS;
    }
}
