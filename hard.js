const HARD_DATA_URL = "https://lucid-snyder-df4e9f.netlify.app/.netlify/functions/hard";


function setDisplayValueById(cssId, value){
    const element = document.getElementById(cssId)
    if (element) { element.innerHTML = value; }
};

function formatCssId(value, denom){
    return `${value}-${denom}`.toUpperCase();
};

function mapCssIds(denoms){
    let ids = {}
    // total asset value
    ids['TAV'] = 'TAV';
    // total HARD Distributed
    ids['total-hard-dist'] = 'TOTAL-HARD-DISTRIBUTED';
    // for the market overview table
    for (const denom of denoms) {
      ids[denom] = {};
      ids[denom].totalBorrowed = formatCssId('tb', denom);
      ids[denom].totalSupplied = formatCssId('tl', denom);
      ids[denom].rewardApy = formatCssId('rapy', denom);
      ids[denom].supplyApy = formatCssId('sapy', denom);
    };
    return ids;
};

async function getHardData(){
    const resp = await fetch(HARD_DATA_URL);
    const hardData = await resp.json();
    return hardData;
}; 


function guardedAssign(object, key, fallbackValue, objectDescriptor, keyWhenFound = null){
    if (object[key] !== undefined){
        // use this when you have an object and want to exract a key to get a value which is very common with coin object with amount property
        if (keyWhenFound){
            return object[key][keyWhenFound];
        }
        return object[key];
    } else {
        console.warn(`${key} not found in ${objectDescriptor}, falling back to ${fallbackValue}`);
        return fallbackValue; 
    };
};

function setAssetDisplayValues(denoms, totalSuppliedUsdPerDenoms,totalBorrowedUsdPerDenoms, rewardsAPY, supplyAPY, cssIds){
    denoms.forEach(denom => {
        const cssIdSupplied = cssIds[denom]['totalSupplied'];
        const cssIdBorrowed = cssIds[denom]['totalBorrowed']; 
        const cssIdRewardApy = cssIds[denom]['rewardApy'];
        const cssIdSupplyApy = cssIds[denom]['supplyApy'];
        
        // set supplied and guard against undefined 
        const totalSuppliedForDenom = guardedAssign(totalSuppliedUsdPerDenoms, denom, 0, "totalSupplied", "amount");
        // set borrowed and guard against undefined 
        const totalBorrowedForDenom = guardedAssign(totalBorrowedUsdPerDenoms, denom, 0, "totalBorrowed", "amount");
        
        // set rewards and guard against undefined  atom is currently not there so we should see a warning in the console 
        const rewardsAPYForDenom = guardedAssign(rewardsAPY, denom, "0.00%", "rewardsAPY");

        // set supply and guard against undefined 
        const supplyAPYForDenom  = guardedAssign(supplyAPY, denom, "0.00%", "supplyAPY");

        // this log should match the lend page 
        // console.log(denom, totalSuppliedForDenom, totalBorrowedForDenom, rewardsAPYForDenom, supplyAPYForDenom);

        setDisplayValueById(cssIdSupplied,  totalSuppliedForDenom); 
        setDisplayValueById(cssIdBorrowed,  totalBorrowedForDenom);
        setDisplayValueById(cssIdRewardApy, rewardsAPYForDenom);
        setDisplayValueById(cssIdSupplyApy, supplyAPYForDenom);
    }); 
}; 

function setTotalAssetsValueDisplayValue(totalAssetValue, cssIds){
  const cssId = cssIds['TAV'];
  setDisplayValueById(cssId, totalAssetValue);
};


function updateUI(cssIds, hardData){
    const { totalHardDepositedByDenomUSD, totalHardBorrowedByDenomUSD, rewardsAPY, interestRates, denomsToShow} = hardData;
    setAssetDisplayValues(denomsToShow, totalHardDepositedByDenomUSD, totalHardBorrowedByDenomUSD,  rewardsAPY, interestRates, cssIds);

    setTotalAssetsValueDisplayValue(hardData.totalHardAssetsUSD, cssIds);
    $(".metric-blur").css("background-color", "transparent");
    $(".metric-blur").addClass('without-after');
    $(".api-metric").css({ "display": "block", "text-align": "center" });
};

async function hardPageInit(){
    const hardData = await getHardData();
    const cssIds = mapCssIds(hardData.denomsToShow);  
 
    updateUI(cssIds, hardData);
    await sleep(30000);

    hardPageInit();
}; 

function sleep(ms = 10000){
    return new Promise(resolve => setTimeout(resolve, ms));
}; 

hardPageInit(); 
// new 2982a6985dcb12e9ae3552c9c6e3c47378464e2f 
// old 4386b824a78114d5b014d5699f3f62546e8c17cb