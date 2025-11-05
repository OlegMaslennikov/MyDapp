window.addEventListener("DOMContentLoaded", async () => {
  // ---------- Contract config ----------
  const contractAddress = "0xYOUR_CONTRACT_ADDRESS"; // Замените на адрес контракта Sepolia
  const contractABI = [
    {
      "inputs": [{"internalType": "string","name": "_message","type": "string"}],
      "stateMutability": "nonpayable","type": "constructor"
    },
    {
      "inputs": [],
      "name": "message",
      "outputs": [{"internalType": "string","name": "","type": "string"}],
      "stateMutability": "view","type": "function"
    },
    {
      "inputs": [{"internalType": "string","name": "_message","type": "string"}],
      "name": "addMessage",
      "outputs": [],
      "stateMutability": "nonpayable","type": "function"
    },
    {
      "inputs": [],
      "name": "getMessages",
      "outputs": [
        {
          "components": [
            {"internalType": "address","name": "sender","type": "address"},
            {"internalType": "string","name": "content","type": "string"}
          ],
          "internalType": "struct MyContract.Message[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view","type": "function"
    }
  ];

  // ---------- Elements ----------
  const connectButton = document.getElementById("connectButton");
  const accountLabel = document.getElementById("account");
  const sendButton = document.getElementById("sendButton");
  const contractMessage = document.getElementById("contractMessage");
  const messagesList = document.getElementById("messages");
  const refreshButton = document.getElementById("refreshButton");

  let provider, signer, contract;

  // ---------- Connect wallet ----------
  connectButton.onclick = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = await provider.getSigner();
      const address = await signer.getAddress();
      accountLabel.textContent = `Connected: ${address}`;
      contract = new ethers.Contract(contractAddress, contractABI, signer);
      await loadContractData();
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  };

  // ---------- Load contract data ----------
  async function loadContractData() {
    if (!contract) return;
    try {
      const msg = await contract.message();
      contractMessage.textContent = msg;

      const messages = await contract.getMessages();
      messagesList.innerHTML = "";
      messages.forEach(m => {
        const li = document.createElement("li");
        li.textContent = `${m.sender}: ${m.content}`;
        messagesList.appendChild(li);
      });
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }

  // ---------- Send new message ----------
  sendButton.onclick = async () => {
    if (!contract) {
      alert("Connect wallet first!");
      return;
    }
    const newMsg = document.getElementById("newMessage").value.trim();
    if (!newMsg) return alert("Message cannot be empty");

    try {
      const tx = await contract.addMessage(newMsg);
      await tx.wait();
      document.getElementById("newMessage").value = "";
      await loadContractData();
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  // ---------- Refresh messages button ----------
  refreshButton.onclick = loadContractData;
});
