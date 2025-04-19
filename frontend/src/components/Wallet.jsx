import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

// Standard ERC-20 ABI (minimum needed for balanceOf function)
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  }
];

const MetaMaskIntegration = () => {
  // State variables to hold wallet information
  const [isConnected, setIsConnected] = useState(false);
  const [userAccount, setUserAccount] = useState('');
  const [currentChain, setCurrentChain] = useState('');
  const [balances, setBalances] = useState({});
  const [tokenBalances, setTokenBalances] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  // Define network configurations
  const networks = [
    {
      name: 'Sepolia Testnet',
      chainId: '0xaa36a7',
      rpcUrl: 'https://sepolia.infura.io/v3/589879756e3f4ff78b2a6afbe87e1569',
      currency: 'SepoliaETH',
      explorer: 'https://sepolia.etherscan.io'
    }
  ];

  // Define tokens to track
  const tokens = [
    {
      name: 'INRC',
      symbol: 'INRC',
      address: '0x1234567890123456789012345678901234567890', // Replace with your actual INRC token contract address
      network: 'Sepolia Testnet',
      decimals: 18 // Standard ERC-20 decimals, adjust if needed
    }
  ];

  // Check if MetaMask is installed
  const checkIfMetaMaskIsInstalled = () => {
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
  };

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!checkIfMetaMaskIsInstalled()) {
        setError('MetaMask is not installed. Please install MetaMask and try again.');
        setIsLoading(false);
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setUserAccount(account);
      
      // Get current chain
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setCurrentChain(chainId);
      
      // Get all balances
      await fetchAllBalances(account);

      // Get token balances
      await fetchTokenBalances(account);

      // Get recent transactions for current network
      await fetchTransactions(account);

      setIsConnected(true);
      setIsLoading(false);

      // Set up listeners for account changes
      setupEventListeners();
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      setError(`Failed to connect: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Fetch balances from all networks
  const fetchAllBalances = async (address) => {
    setIsLoadingBalances(true);
    const newBalances = {};
    
    try {
      // Get current chain ID first
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // Get balance on current network directly from MetaMask
      const web3 = new Web3(window.ethereum);
      const balanceWei = await web3.eth.getBalance(address);
      const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
      
      // Find current network in our list
      const currentNetwork = networks.find(net => net.chainId === currentChainId);
      if (currentNetwork) {
        newBalances[currentNetwork.name] = {
          balance: parseFloat(balanceEth).toFixed(4),
          currency: currentNetwork.currency
        };
      }
      
      // For other networks, create separate web3 instances with RPC URLs
      for (const network of networks) {
        if (network.chainId !== currentChainId) {
          try {
            const networkWeb3 = new Web3(new Web3.providers.HttpProvider(network.rpcUrl));
            const networkBalanceWei = await networkWeb3.eth.getBalance(address);
            const networkBalanceEth = networkWeb3.utils.fromWei(networkBalanceWei, 'ether');
            
            newBalances[network.name] = {
              balance: parseFloat(networkBalanceEth).toFixed(4),
              currency: network.currency
            };
          } catch (err) {
            console.error(`Error fetching balance for ${network.name}:`, err);
            newBalances[network.name] = {
              balance: 'Error',
              currency: network.currency
            };
          }
        }
      }
      
      setBalances(newBalances);
    } catch (error) {
      console.error('Error fetching balances:', error);
      setError('Failed to fetch balances from all networks');
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Fetch token balances
  const fetchTokenBalances = async (address) => {
    try {
      const newTokenBalances = {};
      
      // Get current chain ID
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentNetwork = networks.find(net => net.chainId === currentChainId);
      
      if (!currentNetwork) return;
      
      const web3 = new Web3(window.ethereum);
      
      // Find tokens for current network
      const networkTokens = tokens.filter(token => token.network === currentNetwork.name);
      
      for (const token of networkTokens) {
        try {
          const tokenContract = new web3.eth.Contract(ERC20_ABI, token.address);
          
          // Get token balance
          const tokenBalanceWei = await tokenContract.methods.balanceOf(address).call();
          
          // Get actual decimals from contract if possible
          let decimals = token.decimals;
          try {
            decimals = parseInt(await tokenContract.methods.decimals().call());
          } catch (err) {
            console.log(`Using default decimals (${decimals}) for ${token.symbol}`);
          }
          
          // Convert to token units based on decimals - using standard JavaScript calculations
          // instead of BN
          const balanceInToken = tokenBalanceWei / Math.pow(10, decimals);
          const formattedBalance = parseFloat(balanceInToken).toFixed(4);
          
          newTokenBalances[token.symbol] = {
            balance: formattedBalance,
            name: token.name,
            address: token.address
          };
        } catch (err) {
          console.error(`Error fetching balance for token ${token.symbol}:`, err);
          newTokenBalances[token.symbol] = {
            balance: 'Error',
            name: token.name,
            address: token.address
          };
        }
      }
      
      setTokenBalances(newTokenBalances);
    } catch (error) {
      console.error('Error fetching token balances:', error);
      setError('Failed to fetch token balances');
    }
  };

  // Fetch transactions using Etherscan API (placeholder)
  const fetchTransactions = async (address) => {
    try {
      // For demonstration purposes - in a real app, you would use an API like Etherscan or Alchemy
      // This is a placeholder that simulates getting transactions
      const web3 = new Web3(window.ethereum);
      
      // Demo transactions
      const demoTransactions = [
        {
          hash: '0x123...abc',
          from: '0x111...222',
          to: address,
          value: web3.utils.fromWei('1000000000000000000', 'ether'),
          timeStamp: Date.now() - 86400000, // 1 day ago
          isIncoming: true
        },
        {
          hash: '0x456...def',
          from: address,
          to: '0x333...444',
          value: web3.utils.fromWei('500000000000000000', 'ether'),
          timeStamp: Date.now() - 172800000, // 2 days ago
          isIncoming: false
        },
        {
          hash: '0x789...ghi',
          from: '0x555...666',
          to: address,
          tokenSymbol: 'INRC',
          tokenValue: '100.0000',
          timeStamp: Date.now() - 43200000, // 12 hours ago
          isIncoming: true,
          isToken: true
        }
      ];
      
      setTransactions(demoTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transaction history');
    }
  };

  // Set up event listeners for MetaMask
  const setupEventListeners = () => {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          // User disconnected their account
          setIsConnected(false);
          setUserAccount('');
          setBalances({});
          setTokenBalances({});
          setTransactions([]);
        } else {
          // User switched accounts
          setUserAccount(accounts[0]);
          fetchAllBalances(accounts[0]);
          fetchTokenBalances(accounts[0]);
          fetchTransactions(accounts[0]);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId) => {
        setCurrentChain(chainId);
        if (userAccount) {
          fetchAllBalances(userAccount);
          fetchTokenBalances(userAccount);
          fetchTransactions(userAccount);
        }
      });
    }
  };

  // Add token to MetaMask
  const addTokenToMetaMask = async (token) => {
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
          },
        },
      });
    } catch (error) {
      console.error('Error adding token to MetaMask:', error);
      setError(`Failed to add token to MetaMask: ${error.message}`);
    }
  };

  // Switch network
  const switchNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        const network = networks.find(net => net.chainId === chainId);
        if (network) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: network.chainId,
                  chainName: network.name,
                  rpcUrls: [network.rpcUrl],
                  nativeCurrency: {
                    name: network.currency,
                    symbol: network.currency,
                    decimals: 18,
                  },
                  blockExplorerUrls: [network.explorer],
                },
              ],
            });
          } catch (addError) {
            console.error('Error adding network:', addError);
            setError(`Failed to add network: ${addError.message}`);
          }
        }
      } else {
        console.error('Error switching network:', switchError);
        setError(`Failed to switch network: ${switchError.message}`);
      }
    }
  };

  // Format date from timestamp
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Format address to be more readable
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setUserAccount('');
    setBalances({});
    setTokenBalances({});
    setTransactions([]);
  };

  // Get network name from chain ID
  const getNetworkName = (chainId) => {
    const network = networks.find(net => net.chainId === chainId);
    return network ? network.name : 'Unknown Network';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-black">
      <h1 className="text-3xl font-bold text-center mb-8">MetaMask Wallet Integration</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex justify-center mb-8">
        {!isConnected ? (
          <button 
            onClick={connectWallet}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded flex items-center"
          >
            {isLoading ? (
              <span>Connecting...</span>
            ) : (
              <>
                <span>Connect to MetaMask</span>
              </>
            )}
          </button>
        ) : (
          <button 
            onClick={disconnectWallet}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded"
          >
            Disconnect Wallet
          </button>
        )}
      </div>
      
      {isConnected && (
        <div className="space-y-8">
          <div className="bg-gray-100 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row md:justify-between">
                <span className="font-medium">Address:</span>
                <span className="break-all md:text-right">{userAccount}</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between">
                <span className="font-medium">Current Network:</span>
                <span className="md:text-right">{getNetworkName(currentChain)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Balances Across Networks</h2>
            {isLoadingBalances ? (
              <p className="text-center py-4">Loading balances...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Network</th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(balances).map(([network, data], index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">{network}</td>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">
                          {data.balance} {data.currency}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">
                          {network !== getNetworkName(currentChain) && (
                            <button 
                              onClick={() => switchNetwork(networks.find(net => net.name === network)?.chainId)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Switch to this network
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* New section for token balances */}
          <div className="bg-gray-100 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Token Balances</h2>
            {isLoadingBalances ? (
              <p className="text-center py-4">Loading token balances...</p>
            ) : (
              <div className="overflow-x-auto">
                {Object.keys(tokenBalances).length > 0 ? (
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Token</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(tokenBalances).map(([symbol, data], index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{data.name} ({symbol})</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">
                            {data.balance} {symbol}
                          </td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">
                            <button 
                              onClick={() => addTokenToMetaMask(tokens.find(t => t.symbol === symbol))}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Add to MetaMask
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">No token balances found for the current network.</p>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-gray-100 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Hash</th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">From/To</th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tx.isIncoming ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {tx.isIncoming ? 'Received' : 'Sent'}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">{tx.hash}</td>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">
                          {tx.isIncoming ? formatAddress(tx.from) : formatAddress(tx.to)}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">
                          {tx.isToken ? 
                            `${tx.tokenValue} ${tx.tokenSymbol}` : 
                            `${tx.value} ETH`}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">{formatDate(tx.timeStamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No transactions found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaMaskIntegration;