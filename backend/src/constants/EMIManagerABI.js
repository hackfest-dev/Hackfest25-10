export const EMIMANAGER_ABI = 
[
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "agreementId",
          "type": "uint256"
        }
      ],
      "name": "AgreementCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "agreementId",
          "type": "uint256"
        }
      ],
      "name": "AgreementCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "agreementId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "PaymentExecuted",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "agreementCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "agreements",
      "outputs": [
        {
          "internalType": "address",
          "name": "lender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "totalAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "emiAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "interestRate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "months",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "nextPaymentDue",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "paymentsMade",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "principal",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "annualInterestRate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "months",
          "type": "uint256"
        }
      ],
      "name": "calculateEMI",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "checkUpkeep",
      "outputs": [
        {
          "internalType": "bool",
          "name": "upkeepNeeded",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "lender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "totalAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "interestRate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "months",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        }
      ],
      "name": "createAgreement",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "agreementId",
          "type": "uint256"
        }
      ],
      "name": "getAgreementDetails",
      "outputs": [
        {
          "internalType": "address",
          "name": "lender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "totalAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "emiAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "interestRate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "months",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "nextPaymentDue",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "paymentsMade",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "agreementId",
          "type": "uint256"
        }
      ],
      "name": "getCurrentEMIAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "agreementId",
          "type": "uint256"
        }
      ],
      "name": "getLenderRemainingMonths",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "agreementId",
          "type": "uint256"
        }
      ],
      "name": "getLenderTotalAmountPaid",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "agreementId",
          "type": "uint256"
        }
      ],
      "name": "getLenderTotalAmountRemaining",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "agreementId",
          "type": "uint256"
        }
      ],
      "name": "getNextDueDate",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "agreementId",
          "type": "uint256"
        }
      ],
      "name": "getRemainingEMIs",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "agreementId",
          "type": "uint256"
        }
      ],
      "name": "getTotalAmountPaid",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "agreementId",
          "type": "uint256"
        }
      ],
      "name": "getTotalAmountRemaining",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "performData",
          "type": "bytes"
        }
      ],
      "name": "performUpkeep",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "agreementId",
          "type": "uint256"
        }
      ],
      "name": "updatePaymentStatus",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
  