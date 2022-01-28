const MINT_DATA_URL = "https://app.kava.io/.netlify/functions/mint";


function setDisplayValueById(elementId, value) {
    const element = document.getElementById(elementId)
    if (element) { element.innerHTML = value; }
};

function formatElementId(value, denom){
    return `${value}-${denom}`.toUpperCase();
};

function mapElementIds(denoms){
    let ids = {}
  // total asset value
  ids['totalAssetValue'] = 'TOTAL-VALUE-LOCKED'

  // total rewards Distributed
  ids['totalRewardsDistributed'] = 'TOTAL-REWARDS-DISTRIBUTED'

  // for the market overview table
  for (const denom of denoms) {
    ids[denom] = {};
    ids[denom].totalBorrowed = formatElementId('tb', denom)
    ids[denom].totalLocked = formatElementId('tl', denom)
    ids[denom].apy = formatElementId('apy', denom)
    ids[denom].cdpInterestRate = formatElementId('bapy', denom)
    ids[denom].hardRewardApy = formatElementId('hrapy', denom)
  }
  return ids
};


function setRewardsAPYDisplayValues(elementIds, rewardsAPY){
    for (const denom in rewardsAPY){
        const elementId = elementIds[denom]['apy'];
        setDisplayValueById(elementId, rewardsAPY[denom] + "%");
    };
}; 

function setTotalBorrowedDisplayValues(elementIds, totalBorrowed){
    for (const denom in totalBorrowed){
        const elementId = elementIds[denom]["totalBorrowed"];
        setDisplayValueById(elementId, totalBorrowed[denom]);
    };
}; 

function setTotalLockedDisplayValues(elementIds, totalLocked){
    for (const denom in totalLocked){
        const elementId = elementIds[denom]["totalLocked"];
        setDisplayValueById(elementId, totalLocked[denom]);
    };
};

function setTotalAssetUsdDisplayValue(elementIds, totalAssetUsd){
    const elementId = elementIds['totalAssetValue'];
    setDisplayValueById(elementId, totalAssetUsd.replace("$", ""));
};

function updateMintUI(elementIds, totalLocked, totalBorrowed, rewardsAPY, totalAsset) {
    setTotalAssetUsdDisplayValue(elementIds, totalAsset);
    setTotalBorrowedDisplayValues(elementIds, totalBorrowed);
    setTotalLockedDisplayValues(elementIds, totalLocked);
    setRewardsAPYDisplayValues(elementIds, rewardsAPY);

    $(".metric-blur").css("background-color", "transparent")
    $(".metric-blur").addClass('without-after');
    $(".api-metric").css({"display": "block", "text-align": "center"})

};
  
  
async function getMintData() {
    const resp = await fetch(MINT_DATA_URL);
    const swapDataJson = await resp.json();
    return swapDataJson;
};
  
async function mintPageInit() {
    const mintData = await getMintData();
    const elementIds = mapElementIds(mintData.denomsToShow);
    updateMintUI(elementIds, mintData.totalLocked, mintData.totalBorrowed, mintData.rewardsAPY, mintData.totalAssetValues);
    await sleep(30000);
    mintPageInit();
};
  
function sleep(ms = 10000) {
    return new Promise(resolve => setTimeout(resolve, ms));
};
  
mintPageInit(); 