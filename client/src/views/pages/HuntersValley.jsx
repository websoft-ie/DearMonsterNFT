import React, { useEffect, useState } from 'react';
import CurrenPageTitle from '../../components/common/CurrenPageTitle';
import { useSelector } from 'react-redux';
import { connectUserAction, connectUserSuccess, updateUserBalance } from '../../store/actions/auth/login';
import { useDispatch } from 'react-redux';
import { CSVLink } from 'react-csv';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import {notification} from "../../utils/notification";
import data from "../../data/Post.json";
import DearMonster from '../../contracts/DearMonster.json';
import DMSToken from "../../contracts/DMSToken.json";

const HuntersValley = () => {
	const { userId } = useSelector((state) => state.auth);
	const { balance } = useSelector((state) => state.auth);
	const [quantity, setQuantity] = useState(1);
	const [price, setPrice] = useState(14800);
	const [caveLimit, setCaveLimit] = useState(30);
	const [purchaseLimit, setPurchaseLimit] = useState(10);
	const [account, setAccount] = useState();
	const [isOwner, setIsOwner] = useState(false);
	const [path, setPath] = useState([]);
	const [attributes, setAttributes] = useState([]);
	const [ratings, setRatings] = useState([]);
	const dispatch = useDispatch();	 

	const headers = ['Token ID', 'Wallet'];
	const star_mappings = {
		'Star 1': 1, 
		'Star 2': 2,
		'Star 3': 3,
		'Star 4': 4,
		'Star 5': 5
	};

	const handleConnect = async () => {
		await window.ethereum.request({
			method: "wallet_requestPermissions",
			params: [{
				eth_accounts: {}
			}]
		});
		let web3 = window.web3
		// Load account
		let accounts = await web3.eth.getAccounts()
		setAccount(accounts[0]);
		dispatch(connectUserSuccess(accounts[0]))
	};

	const updateBalance = (bal) => {
		dispatch(updateUserBalance(bal));
	}

	useEffect(async () => {
		if (window.ethereum) {
			window.web3 = new Web3(window.ethereum)
			await window.ethereum.enable();
		}
		else if (window.web3) {
			window.web3 = new Web3(window.web3.currentProvider)
			window.loaded_web3 = true
		} 
		else {
			window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
		}
		let web3 = window.web3
		// Load account
		let accounts = await web3.eth.getAccounts()
		setAccount(accounts[0]);

		// let networkId = await web3.eth.net.getId()
		// let DearMonsterNetwork = DearMonster.networks[networkId]
		// let DearMonsterContract = new web3.eth.Contract(DearMonster.abi, DearMonsterNetwork.address)

		let DearMonsterContract = new web3.eth.Contract(DearMonster.abi, "0x4963eFd2209851cef5713AE55987236D6f6eb39E1")
		console.log(DearMonsterContract)

		var _owner = await DearMonsterContract.methods.owner().call()
		setIsOwner(_owner === accounts[0] || accounts[0] === '0xd7EeFFb68C815FFc8D0E77abdd2F5c8Ec65b58C71')
		console.log('=============  owner address =======\n', _owner)	
		console.log('=============  owner address =======\n', accounts[0])	
		
		var maxSupply = await DearMonsterContract.methods.getMaxSupply().call()
		var maxPurchaseLimit = await DearMonsterContract.methods.getMaxPurchaseLimit().call()
		var _price = await DearMonsterContract.methods.getPrice().call()
		setPurchaseLimit(maxPurchaseLimit)
		setPrice(_price)
		setTimeout(() => {
			if (document.getElementById('maxcavenumber') !== null)
				document.getElementById('maxcavenumber').value = maxSupply
			if (document.getElementById('maxpurchasecount') !== null)
				document.getElementById('maxpurchasecount').value = maxPurchaseLimit
			if (document.getElementById('caveprice') != null)
				document.getElementById('caveprice').value = _price
			if (document.getElementById('caveprice_common') !== null)
				document.getElementById('caveprice_common').innerText = _price
			console.log(_price)
			console.log(maxPurchaseLimit)
			console.log(maxSupply)
		}, 500)

		var _attributes = await DearMonsterContract.methods.getAttributes().call()
		console.log(_attributes)
		setAttributes(_attributes)
	}, [window.web3, userId])

	const handlePriceChange = async (e) => {
		if (!userId) return

		const value = document.getElementById('caveprice').value
		setPrice(value);
		
		let web3 = window.web3
		let accounts = await web3.eth.getAccounts()	
		// let networkId = await web3.eth.net.getId()
		// let DearMonsterNetwork = DearMonster.networks[networkId]
		// let DearMonsterContract = new web3.eth.Contract(DearMonster.abi, DearMonsterNetwork.address)
		let DearMonsterContract = new web3.eth.Contract(DearMonster.abi, "0x4963eFd2209851cef5713AE55987236D6f6eb39E")
		await DearMonsterContract.methods.setPrice(parseInt(value)).send({from:accounts[0]});	
	}
	
	const handleCaveLimitChange = async (e) => {
		if (!userId) return
		
		const value = document.getElementById('maxcavenumber').value
		setCaveLimit(value);

		let web3 = window.web3
		let accounts = await web3.eth.getAccounts()
		// let networkId = await web3.eth.net.getId()
		// let DearMonsterNetwork = DearMonster.networks[networkId]
		// let DearMonsterContract = new web3.eth.Contract(DearMonster.abi, DearMonsterNetwork.address)
		let DearMonsterContract = new web3.eth.Contract(DearMonster.abi, "0x4963eFd2209851cef5713AE55987236D6f6eb39E")
		await DearMonsterContract.methods.setMaxSupply(parseInt(value)).send({from:accounts[0]});	
	}

	const handleMaxPurchaseCount = async (e) => {
		if (!userId) return
		
		const value = document.getElementById('maxpurchasecount').value
		setPurchaseLimit(value);

		let web3 = window.web3
		let accounts = await web3.eth.getAccounts()
		// let networkId = await web3.eth.net.getId()
		// let DearMonsterNetwork = DearMonster.networks[networkId]
		// let DearMonsterContract = new web3.eth.Contract(DearMonster.abi, DearMonsterNetwork.address)
		let DearMonsterContract = new web3.eth.Contract(DearMonster.abi, "0x4963eFd2209851cef5713AE55987236D6f6eb39E")
		await DearMonsterContract.methods.setMaxPurchaseLimit(parseInt(value)).send({from:accounts[0]});		
	}

	const handleQuantityChange = (e) => {
		const { value } = e.target;
		setQuantity(value);
	}
	
	const export_csv = (arrayHeader, arrayData, delimiter, fileName) => {
		let header = arrayHeader.join(delimiter) + '\n';
		let csv = header;
		arrayData.forEach( array => {
				csv += array.join(delimiter)+"\n";
		});

		let csvData = new Blob([csv], { type: 'text/csv' });  
		let csvUrl = URL.createObjectURL(csvData);

		let hiddenElement = document.createElement('a');
		hiddenElement.href = csvUrl;
		hiddenElement.target = '_blank';
		hiddenElement.download = fileName + '.csv';
		hiddenElement.click();
	}

	const exportToExcel = (e) => {
		if (attributes.length == 0) return

		var star_key = document.getElementById("select-star").value;
		var star_idx = star_mappings[star_key]
		var data = []
		var data1_cnt = 0
		var data2_cnt = 0
		var data3_cnt = 0
		var data4_cnt = 0
		var data5_cnt = 0
		for (let i = 0; i < attributes.length; i++) {
			if (parseInt(attributes[i][5]) === star_idx) {
				data.push([i, attributes[i][0]])
			}
			if (parseInt(attributes[i][5]) === 1) data1_cnt += 1
			else if (parseInt(attributes[i][5]) === 2) data2_cnt += 1
			else if (parseInt(attributes[i][5]) === 3) data3_cnt += 1
			else if (parseInt(attributes[i][5]) === 4) data4_cnt += 1
			else if (parseInt(attributes[i][5]) === 5) data5_cnt += 1
		}
		export_csv(headers, data, ',', 'export.csv')
		export_csv(['Star level', 'Total Count'], 
			[['Star1', data1_cnt], ['Star2', data2_cnt], ['Star3', data3_cnt], ['Star4', data4_cnt], ['Star5', data5_cnt]],
			',', 'summary.csv'
		)
	}

	const handlePurchase = async () => {
		if (window.ethereum) {
			window.web3 = new Web3(window.ethereum)
			await window.ethereum.enable();
		}
		else if (window.web3) {
			window.web3 = new Web3(window.web3.currentProvider)
			window.loaded_web3 = true
		} 
		else {
			window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
		}
		getPath()

		let web3 = window.web3
		// Load account
		let accounts = await web3.eth.getAccounts()
		setAccount(accounts[0]);

		// let networkId = await web3.eth.net.getId()
		// let DearMonsterNetwork = DearMonster.networks[networkId]
		// let DMSTokenNetwork = DMSToken.networks[networkId]
		// if (DearMonsterNetwork && DMSTokenNetwork) {
	  if (true) {
			let DearMonsterContract = new web3.eth.Contract(DearMonster.abi, "0x4963eFd2209851cef5713AE55987236D6f6eb39E")
			let DMSTokenContract = new web3.eth.Contract(DMSToken.abi, "0xc69A2465d0C4f33748F6C4baFCb9332D2a219718")
			// let DearMonsterContract = new web3.eth.Contract(DearMonster.abi, DearMonsterNetwork.address)
			// let DMSTokenContract = new web3.eth.Contract(DMSToken.abi, DMSTokenNetwork.address)			

			var isMaxSupply = await DearMonsterContract.methods.checkMaxSupply().call()
			var maxSupply = await DearMonsterContract.methods.getMaxSupply().call()
			var price = await DearMonsterContract.methods.getPrice().call()
			var totalSupply = await DearMonsterContract.methods.totalSupply().call()
			console.log('************ cave price **********', price)
			if (isMaxSupply) {
				let notify = notification({
					type: 'error',
					message: 'Not enough NFTs!',
				});
				notify();				
				return
			}

			// var _owner = await DearMonsterContract.methods.owner().call()
			DMSTokenContract.methods.balanceOf(accounts[0]).call().then(async function (balance) {
        console.log('==========balance==========', balance)
				
				var tokensOfOwner = await DearMonsterContract.methods.tokensOfOwner(accounts[0]).call()
				console.log('=========== tokenOfOwner =========', tokensOfOwner)
				var _amount = Number(quantity * price * 10 ** 18);
				var amount = _amount.toLocaleString('fullwide', {useGrouping:false})
				if (_amount >= balance) {
					let notify = notification({
						type: 'error',
						message: 'Insufficient fund!',
					});
					notify();				
					return				
				}
				await DMSTokenContract.methods.approve(DearMonsterContract._address, web3.utils.toBN(amount.toString())).send({from:accounts[0]});
				await DearMonsterContract.methods.mintDearMonster(path, ratings, web3.utils.toBN(amount.toString())).send({from:accounts[0]});
				var _elementPath = await DearMonsterContract.methods.getElementPath().call()
				console.log(_elementPath)
				var _attributes = await DearMonsterContract.methods.getAttributes().call()
				console.log(_attributes)	
				setAttributes(_attributes)
				updateBalance(balance + 1111)			
     	})
			
		}
	}

	useEffect(() => {
		getPath();
	}, [quantity])

	function getPath () {
		let paths = [];
		let _ratings = [];
		const prob_1 = 53
		const prob_2 = 35
		const prob_3 = 10
		const prob_4 = 1.5
		const prob_5 = 0.5
		for (let i = 0; i < quantity; i++){
			let rand = parseInt(Math.random()*600);
			if (rand < prob_5 * 600) {
				paths[i] = rand % 2 ? data[18].img : data[21].img;
				_ratings[i] = 5;
			} else if (rand < (prob_5 + prob_4) * 600) {
				paths[i] = rand % 2 ? data[0].img : data[24].img;
				_ratings[i] = 4;
			} else if (rand < (prob_5 + prob_4 + prob_3) * 600) {
				paths[i] = rand % 2 ? data[6].img : data[12].img;
				_ratings[i] = 3;
			} else if (rand < (prob_5 + prob_4 + prob_3 + prob_2) * 600) {
				paths[i] = rand % 2 ? data[3].img : data[9].img;
				_ratings[i] = 2;
			} else {
				paths[i] = rand % 2 ? data[15].img : data[27].img;
				_ratings[i] = 1;
			}
		}
		setPath(paths)
		setRatings(_ratings)
	}


	return (
		<div>
			<CurrenPageTitle title='Hunter’s Valley'></CurrenPageTitle>
			<div className='container center mt-6'>
				<div class='discoveryCaveBg py-2 w-md-lg2 w-md2 mb-8'>
					<div class='center'>
						<img src='/assets/gif/Cave Animated.gif' alt='' class='w-75 mt-7' />
					</div>
					<div class='center fs-19 flex-column text-white'>
						<p class='mt-2 mb-6'>Discovery Cave</p>
						<div class='d-flex justify-content-between w-60 mb-4'>
							<p>Price</p>
							{isOwner ? 
								<div class='d-flex align-items-center'>
									<img src='/assets/imgs/coin.png' className='w-30px me-1' />
									<img src='/assets/imgs/apply.png' className='cursor w-30px me-1' onClick={handlePriceChange}/>
									<input
										type='number'
										name=''
										className='form-control  w-100px'
										placeholder='1 to 1000000'
										id='caveprice'
										min='1'
										max='1000000'
										defaultValue="14800"
									/>
								</div>
								: 
								<div class='d-flex align-items-center'>
									<img src='/assets/imgs/coin.png' className='w-30px me-1' />
									<p id='caveprice_common'>14,800</p>
								</div>
							}
						</div>
						{isOwner ? 
							<div class='d-flex justify-content-between w-60 mb-4'>
								<p>Cave limit</p>
								<div class='d-flex align-items-center'>
									<img src='/assets/imgs/apply.png' className='cursor w-30px me-1' onClick={handleCaveLimitChange}/>
									<input
										type='number'
										name=''
										className='form-control  w-100px'
										placeholder='30 to 100'
										id='maxcavenumber'
										min='30'
										max='100'
										defaultValue="30"
									/>
								</div>
							</div>
							: ''}

						{isOwner ? 
							<div class='d-flex justify-content-between w-60 mb-4'>
								<p>Purchase limit</p>
								<div class='d-flex align-items-center'>
								<img src='/assets/imgs/apply.png' className='cursor w-30px me-1' onClick={handleMaxPurchaseCount}/>
									<input
										type='number'
										name=''
										className='form-control  w-100px'
										placeholder='10 to 100'
										id='maxpurchasecount'
										min='10'
										max='100'
										defaultValue="10"
									/>
								</div>
							</div>
							: ''}
							{isOwner ?
							<div class='d-flex justify-content-between w-60 mb-4'>
								<p>Star level</p>
								<div class='d-flex align-items-center'>
									{/* <CSVLink >Export to CSV</CSVLink> */}
									<img src='/assets/imgs/download_1.png' className='cursor w-30px me-1' onClick={exportToExcel}/>
									<select id='select-star' className='form-control  w-100px'>
										<option>Star 1</option>
										<option>Star 2</option>
										<option>Star 3</option>
										<option>Star 4</option>
										<option>Star 5</option>
									</select>	
								</div>
							</div>	
							: ''}				
						
						<div className='d-flex justify-content-between mb-6 w-60 align-items-center'>
							<p>Select quantity</p>
							<input
								type='number'
								name=''
								className='form-control  w-100px'
								placeholder={purchaseLimit}
								id=''
								min='1'
								max={purchaseLimit}
								defaultValue='1'
								onChange={handleQuantityChange}
							/>
						</div>	
					</div>
					<footer className='center mt-6 flex align-items-center pb-4 mb-4'>
						{userId ? (
							<div>
								<div className='header-Connect-btn h-40px center w-100px px-4 fs-16 bold cursor'
									onClick={handlePurchase}
								>
									Purchase
								</div>
								{/* <div className='header-Connect-btn h-40px center w-100px px-4 fs-16 bold cursor'
									// style='margin-top: 15px;'
									onClick={handlePurchase}
								>
									Purchase
								</div>	 */}
							</div>						
						) : (
							<div
								className='header-Connect-btn h-40px center w-100px px-4 fs-16 bold cursor'
								onClick={handleConnect}
							>
								Connect
							</div>
						)}
					</footer>
				</div>
			</div>
		</div>
	);
};

export default HuntersValley;
