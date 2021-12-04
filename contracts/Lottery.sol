pragma solidity ^0.4.17;

contract Lottery{
    address public manager;
    address[] public players;

    function Lottery() public{
        manager = msg.sender;
    } 

    function takePart() public payable {
        require(msg.value > 10);

        players.push(msg.sender);
    }

    //Not truely random
    function random() private view returns (uint) {
        return uint(sha3(block.difficulty, now, players));
    }

    function pickWinner() public onlyManagerCanCall{
    
        uint index = random() % players.length;
        //transfer all money in this instance to the winner
        players[index].transfer(this.balance);
        //New dynamic array of initial size 0
        players = new address[](0);
    }

    //Any function which will use this modifies; solidity will replace the _ with the code of that function
    //This way we do not have to repeat the code
    modifier onlyManagerCanCall(){
        require(msg.sender == manager);
        _;
    }

    function getPlayers() public view returns (address[]) {
        return players;
    }
}