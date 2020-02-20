pragma solidity ^0.5.0;

contract MinhaMoeda {
	string public nome = 'Minha Moeda';
	string public simbolo = 'MM';
	string public padrao = 'Minha Moeda v1.0';
	address administrador;

	// lista com o balanço de cada endereço
	mapping(address => uint256) public balanco;
	// lista do quanto posso tranferir para cada endereço

	event Transferencia(address de, address para, uint256 quantidade);

	// ao construir o dono do contrato recebe todos os tokens
	constructor (uint256 suprimentoInicial) public {
		balanco[msg.sender] = suprimentoInicial;
		administrador = msg.sender;
	}

	function moedasRestantes() public returns (uint256) {
		return balanco[administrador];
	}

	function transferir(address de, address para, uint256 quantidade) public returns (bool success) {
		// valida que o emissor tenha os tokens
		require(quantidade <= balanco[de], 'Sem balanço');
		// removendo os tokens do emissor
		balanco[de] -= quantidade;
		// adicionando os tokens ao novo endereço
		balanco[para] += quantidade;

		emit Transferencia(de, para, quantidade);

		// retorno caso haja sucesso
		return true;
	}

}
