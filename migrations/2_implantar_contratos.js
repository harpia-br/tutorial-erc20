const MinhaMoeda = artifacts.require('./MinhaMoeda.sol');
const VendaDaMinhaMoeda = artifacts.require('./VendaDaMinhaMoeda.sol');

module.exports = function(implantador) {
	// implantando contrato da moeda com os dados do construtor
	 implantador.deploy(MinhaMoeda, 100000000)
		.then(() => {
			const preco = 10000000000000;
			return implantador.deploy(VendaDaMinhaMoeda, MinhaMoeda.address, preco)
		})
};
