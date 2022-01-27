const MINT_DATA_URL = "http://localhost:8888/.netlify/functions/mint";

function formatElementId(value, pool) {
    return `${value}-${pool}`.toUpperCase();
};
  
  function setDisplayValueById(elementId, value) {
    const element = document.getElementById(elementId)
    if (element) { element.innerHTML = value; }
};

function mapElementIds(){
    return {
        "totalAssetValue": "TOTAL-VALUE-LOCKED",
        "totalRewardsDistributed": "TOTAL-REWARDS-DISTRIBUTED",
        "BNB": {
            "totalBorrowed": "TB-BNB",
            "totalLocked": "TL-BNB",
            "apy": "APY-BNB",
            "cdpInterestRate": "BAPY-BNB",
            "hardRewardApy": "HRAPY-BNB"
        },
        "BTCB": {
            "totalBorrowed": "TB-BTCB",
            "totalLocked": "TL-BTCB",
            "apy": "APY-BTCB",
            "cdpInterestRate": "BAPY-BTCB",
            "hardRewardApy": "HRAPY-BTCB"
        },
        "BUSD": {
            "totalBorrowed": "TB-BUSD",
            "totalLocked": "TL-BUSD",
            "apy": "APY-BUSD",
            "cdpInterestRate": "BAPY-BUSD",
            "hardRewardApy": "HRAPY-BUSD"
        },
        "HBTC": {
            "totalBorrowed": "TB-HBTC",
            "totalLocked": "TL-HBTC",
            "apy": "APY-HBTC",
            "cdpInterestRate": "BAPY-HBTC",
            "hardRewardApy": "HRAPY-HBTC"
        },
        "XRP": {
            "totalBorrowed": "TB-XRP",
            "totalLocked": "TL-XRP",
            "apy": "APY-XRP",
            "cdpInterestRate": "BAPY-XRP",
            "hardRewardApy": "HRAPY-XRP"
        },
        "HARD": {
            "totalBorrowed": "TB-HARD",
            "totalLocked": "TL-HARD",
            "apy": "APY-HARD",
            "cdpInterestRate": "BAPY-HARD",
            "hardRewardApy": "HRAPY-HARD"
        },
        "KAVA": {
            "totalBorrowed": "TB-KAVA",
            "totalLocked": "TL-KAVA",
            "apy": "APY-KAVA",
            "cdpInterestRate": "BAPY-KAVA",
            "hardRewardApy": "HRAPY-KAVA"
        },
        "USDX": {
            "totalBorrowed": "TB-USDX",
            "totalLocked": "TL-USDX",
            "apy": "APY-USDX",
            "cdpInterestRate": "BAPY-USDX",
            "hardRewardApy": "HRAPY-USDX"
        },
        "SWP": {
            "totalBorrowed": "TB-SWP",
            "totalLocked": "TL-SWP",
            "apy": "APY-SWP",
            "cdpInterestRate": "BAPY-SWP",
            "hardRewardApy": "HRAPY-SWP"
        },
        "ATOM": {
            "totalBorrowed": "TB-ATOM",
            "totalLocked": "TL-ATOM",
            "apy": "APY-ATOM",
            "cdpInterestRate": "BAPY-ATOM",
            "hardRewardApy": "HRAPY-ATOM"
        },
        "AKT": {
            "totalBorrowed": "TB-AKT",
            "totalLocked": "TL-AKT",
            "apy": "APY-AKT",
            "cdpInterestRate": "BAPY-AKT",
            "hardRewardApy": "HRAPY-AKT"
        },
        "LUNA": {
            "totalBorrowed": "TB-LUNA",
            "totalLocked": "TL-LUNA",
            "apy": "APY-LUNA",
            "cdpInterestRate": "BAPY-LUNA",
            "hardRewardApy": "HRAPY-LUNA"
        },
        "OSMO": {
            "totalBorrowed": "TB-OSMO",
            "totalLocked": "TL-OSMO",
            "apy": "APY-OSMO",
            "cdpInterestRate": "BAPY-OSMO",
            "hardRewardApy": "HRAPY-OSMO"
        }
    };
};


function setRewardsAPYDisplayValues(elementIds, rewardsAPY){

}; 

function setTotalBorrowedDisplayValues(elementIds, totalBorrowed){

}; 

function setTotalLockedDisplayValues(elementIds, totalLocked){

};

function setTotalAssetUsdDisplayValue(elementIds, totalAssetUsd){
    const elementId = elementIds['totalAssetValue'];
    setDisplayValueById(elementId, totalAssetUsd.replace("$", ""));
};

function updateUI(elementIds, totalLocked, totalBorrowed, rewardsAPY, totalAsset) {
    setTotalAssetUsdDisplayValue(elementIds, totalAsset);
    setTotalBorrowedDisplayValues(elementIds, totalBorrowed);
    setTotalLockedDisplayValues(elementIds, totalLocked);
    setRewardsAPYDisplayValues(elementIds, rewardsAPY);
};
  
  
async function getMintData() {
    const resp = await fetch(MINT_DATA_URL);
    const swapDataJson = await resp.json();
    return swapDataJson;
};
  
async function mintPageInit() {
    const mintData = await getMintData();
    console.log(mintData);
    const elementIds = mapElementIds();
    updateUI(elementIds, mintData.totalLocked, mintData.totalBorrowed, mintData.rewardsAPY, mintData.totalAssetValues);
    await sleep(30000);
    mintPageInit();
};
  
function sleep(ms = 10000) {
    return new Promise(resolve => setTimeout(resolve, ms));
};
  
mintPageInit(); 