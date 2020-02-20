/* Biblioteca para criar nossos componentes */
import React from 'react';
/* Biblioteca para acessar contratos na rede Ethereum */
import Web3 from 'web3';
/* Importando o contrato */
import MinhaMoeda from './abis/MinhaMoeda.json'
import VendaDaMinhaMoeda from './abis/VendaDaMinhaMoeda.json'
/* Componentes para nossa aplicação web */
import {
	Container,
	Form,
	Button,
	InputGroup,
	FormControl,
} from 'react-bootstrap'

/* Declaração do nosso componente */
class App extends React.Component {

	/* Alguns componentes React tem um 'estado', com dados, 
	 * para controlar a renderização do componente */
	state = {
		/* Variável para manejar o processamento dos dados */
		carregando: true,
		/* Variável para guardar a quantidade de moedas */
		tokens: 0,
		/* Variável para guardar a conta que está selecionada no Metamask */
		conta: null,
		/* Variável para receber a quantidade de moedas para comprar */
		quantidade: '',
		/* Variável para guardar o contrato que vamos utilizar */
		contratoMoeda: null,
		contratoVenda: null,
		/* Variável para guardar o valor da moeda */
		preco: 0,
		meusTokens: 0,
	}

	/* Função que participa do ciclo de vida do componente com estado,
	 * ela é chamada quando o componente está montado, essa no caso é
	 * ideal para fazer solicitações assíncronas, palavra chave 'async' 
	 * facilita o trabalho com funções assíncronas, fazendo parte da ES7
	 * do JavaScript */
	async componentDidMount() {
		/* Todas as solicitações Web3 são assíncronas e o uso do ES7 async await
		 * ajuda muito a reduzir o código e facilita a manutenção */

		/* Criando uma instância do Web3 */
		let web3 = null
		/* Browser novos já tem acesso a rede Ethereum, como Mist ou Metamask */
		if(window.ethereum){
			web3 = new Web3(window.ethereum)
			await window.ethereum.enable()
		}else{
			/* Acessando a extensão de acesso a rede Ethereum */
			if(window.web3){
				web3 = new Web3(Web3.givenProvider)
			}else{
				alert('Ethereum browser não detectado! Tente usar o Metamask')
				return false
			}
		}

		/* Pega as contas que estão no caso no Metamask e traz a selecionada */
		const contas = await web3.eth.getAccounts()
		const conta = contas[0]
		/* Dados da rede que estamo conecta no caso a rede Ganache */
		const rede_id = await web3.eth.net.getId()
		const redeMoeda = MinhaMoeda.networks[rede_id]
		const redeVenda = VendaDaMinhaMoeda.networks[rede_id]
		/* Pegando o contrato com o arquivo gerado pelo Truffle e o endereço da nossa rede */
		const contratoMoeda = new web3.eth.Contract(MinhaMoeda.abi, redeMoeda.address)
		const contratoVenda = new web3.eth.Contract(VendaDaMinhaMoeda.abi, redeVenda.address)
		/* buscando os tokens dentro do contrato */
		const tokens = await contratoMoeda.methods.moedasRestantes().call()
		const preco = await contratoVenda.methods.tokenPreco().call()
		const meusTokens = await contratoMoeda.methods.balanco(conta).call()

		/* Quando alterar uma conta no MetaMask mudar o estado */
		window.ethereum.on('accountsChanged', (accounts) => {
			this.setState({conta: accounts[0]})
		})

		/* A função setState() alterar o estado do objeto, quando o estado é diferente do atual 
		 * o algoritmo de reconciliciação do React avalia o que vai mudar na redenrização e altera
		 * apenas aquela informação, esse é o que faz O react tão diferente e poderoso */
		this.setState({
			carregando: false,
			tokens,
			contratoMoeda,
			contratoVenda,
			conta,
			preco,
			meusTokens,
		})
	}

	/* No React podemos controlar nosso formulário para não ter a necessidade de submeter o mesmo,
	 * além de poder filtrar os dados passado pela entrada de dados e quem altera o que é mostrado 
	 * é o algoritmo de reconciliação */
	alterarCampo = event => {
		/* Desestruturação do objeto para por os dados já em variáveis utilizad pelo ES6*/
		const {
			value,
			name,
		} = event.target
		this.setState({ [name]: value })
	}

	comprarMoeda = async () => {
		const {
			contratoVenda,
			contratoMoeda,
			conta,
			quantidade,
			preco,
		} = this.state
		try{
			this.setState({carregando: true})
			const valor = quantidade * preco
			await contratoVenda.methods.comprarTokens(quantidade).send({from: conta, value: valor})
			const tokens = await contratoMoeda.methods.moedasRestantes().call()
			const meusTokens = await contratoMoeda.methods.balanco(conta).call()
			this.setState({
				tokens,
				meusTokens,
			})
		} catch (error) {
			alert('Transação Rejeitada')
		}
		this.setState({
			carregando: false,
			quantidade: '',
		})
	}

	/* Função que informa ao React o que criar usando JSX, que facilita a criação
	 * de componentes que é justamente o uso de tags informa ao tradutor Babel para
	 * gerar um código Javascript ao executar a classe */
	render(){
		const {
			carregando,
			tokens,
			quantidade,
			contratoVenda,
			preco,
			meusTokens,
			conta,
		} = this.state
		return (
			<Container
				style={{
					textAlign: 'center',
					borderWidth: '.2rem .2rem 0',
					borderRadius: '8px 8px 0 0',
					sition: 'relative',
					padding: '1rem',
					border: '.2rem solid #ececec',
					color: '#212529',
					marginTop: 20,
				}}>
				<h1>Venda da Moeda - MM</h1>
				<h2>Valor: {preco}</h2>
				{
					contratoVenda && 
						!carregando && 
						<Form>
							<Form.Group>
								<InputGroup className="mb-3">
									<FormControl
										placeholder="Quantidade"
										id='quantidade'
										name='quantidade'
										value={quantidade}
										onChange={this.alterarCampo}
									/>
									<InputGroup.Append>
										<Button 
											onClick={this.comprarMoeda}
											variant="outline-secondary">
											Comprar Moeda
										</Button>
									</InputGroup.Append>
								</InputGroup>
							</Form.Group>
						</Form>
				}
				{
					carregando &&
						<h2>Carregando...</h2>
				}
				{
					!carregando &&
						tokens &&
						<h3>Restante: {tokens}</h3>
				}
				{
					meusTokens &&
						<>
							<hr />
							<h4>Meus Tokens: {meusTokens}</h4>
							<h5>Conta: {conta}</h5>
						</>
				}
			</Container>
		);
	}
}

export default App;
