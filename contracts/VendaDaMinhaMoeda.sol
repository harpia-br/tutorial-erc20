pragma solidity ^0.5.0;

import "./MinhaMoeda.sol";

contract VendaDaMinhaMoeda {
	address payable administrador;
	MinhaMoeda public contratoMoeda;
	uint256 public tokenPreco;
	uint256 public tokensVendidos;

	constructor (MinhaMoeda contrato, uint256 preco) public {
		administrador = msg.sender;
		contratoMoeda = contrato;
		tokenPreco = preco;
	}

	event Venda(address para, uint256 quantidade);

	function comprarTokens(uint256 numeroDeTokens) public payable {
		// valido se o Ether bate com o valor d compra
		require(msg.value == (numeroDeTokens * tokenPreco), 'Sem valor de Ether');
		// valido se o contrato tem o número de tokens
		require(contratoMoeda.balanco(administrador) >= numeroDeTokens, 'Contrato sem Tokens');
		// transfiro os tokens para o comprador
		require(contratoMoeda.transferir(administrador, msg.sender, numeroDeTokens), 'Error ao transferir');

		// acumulo o tokens vendidos
		tokensVendidos += numeroDeTokens;

		emit Venda(msg.sender, numeroDeTokens);
	}

	function encerraVenda() public payable {
		// valido se é o administrador
		require(msg.sender == administrador);
		// transfiro o Ether arrecadado para o administrador
		// address(this) é o endereço do contrato
		// balance é o Ether que o contrato recebeu
		administrador.transfer(address(this).balance);
	}
}
