import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import Home from "./components/Home";

// ABIs
import RealEstate from "./abis/RealEstate.json";
import Escrow from "./abis/Escrow.json";

// Config
import config from "./config.json";

function App() {
  //states
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [homes, setHomes] = useState([]);

  const loadblockchainData = async () => {
    //provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    const network = await provider.getNetwork();
    console.log(provider);
    //realestates
    const realEstate = new ethers.Contract(
      config[network.chainId].realEstate.address,
      RealEstate,
      provider
    );
    const totalSupply = await realEstate.totalSupply();
    console.log(realEstate);
    console.log(totalSupply);

    const homes = [];
    for (var i = 0; i <= totalSupply; i++) {
      const tokenUrl = await realEstate.TokenURI(i);
      const response = await fetch(tokenUrl);
      const metaData = await response.json();
      homes.push(metaData);
    }
    setHomes(homes);
    console.log(homes);
    //escrowcontract
    const escrow = new ethers.Contract(
      config[network.chainId].realEstate.address,
      Escrow,
      provider
    );
    setEscrow(escrow);

    //on account change on the metamask
    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };
  //useeffect to keeep rnning the fuction on reload
  useEffect(() => {
    loadblockchainData();
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />
      <div className="cards__section">
        <h3>Welcome to Millow</h3>
        <h2>Places for you</h2>
        <hr />
        <div className="cards">
          <div className="card">
            <div className="card__image">
              <img src="" alt="Home" />
            </div>
            <div className="card__info">
              <h2>1 ETH</h2>
              <p>
                <strong>1</strong>bds
                <strong>2</strong>bq
                <strong>3</strong>br
              </p>
              <p>1234 Elm st</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
