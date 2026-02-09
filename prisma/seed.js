const prisma = require('../src/models/prismaClient');

// Seed Persons
const persons = [
  { email: 'alice@example.com', name: 'Alice' },
  { email: 'bob@example.com', name: 'Bob' },
  { email: 'carol@example.com', name: 'Carol' },
  { email: 'dave@example.com', name: 'Dave' },
  { email: 'eve@example.com', name: 'Eve' },
  { email: 'frank@example.com', name: 'Frank' },
  { email: 'grace@example.com', name: 'Grace' },
  { email: 'heidi@example.com', name: 'Heidi' },
  { email: 'ivan@example.com', name: 'Ivan' },
  { email: 'judy@example.com', name: 'Judy' },
  { email: 'mallory@example.com', name: 'Mallory' },
  { email: 'oscar@example.com', name: 'Oscar' },
  { email: 'peggy@example.com', name: 'Peggy' },
  { email: 'trent@example.com', name: 'Trent' },
  { email: 'victor@example.com', name: 'Victor' },
  { email: 'walter@example.com', name: 'Walter' },
  { email: 'xavier@example.com', name: 'Xavier' },
  { email: 'yvonne@example.com', name: 'Yvonne' },
  { email: 'zara@example.com', name: 'Zara' },
  { email: 'leo@example.com', name: 'Leo' },
];



  //categories and subcategories
  

//  CATEGORIES
const categoriesData = [
  { name: "Fresh Produce" },
  { name: "Dairy & Eggs" },
  { name: "Meat & Seafood" },
  { name: "Frozen Meat & Seafood" },
  { name: "Snacks" },
  { name: "Beverages" },
  { name: "Pantry Staples" },
  { name: "Household Essentials" },
];

//  SUBCATEGORIES (meta with categoryName for mapping)
const subcategoriesMeta = [
  // Fresh Produce
  { name: "Fruits", categoryName: "Fresh Produce" },
  { name: "Vegetables", categoryName: "Fresh Produce" },
  { name: "Herbs", categoryName: "Fresh Produce" },

  // Dairy & Eggs
  { name: "Milk", categoryName: "Dairy & Eggs" },
  { name: "Cheese", categoryName: "Dairy & Eggs" },
  { name: "Yogurt", categoryName: "Dairy & Eggs" },
  { name: "Eggs", categoryName: "Dairy & Eggs" },

  // Meat & Seafood
  { name: "Chicken", categoryName: "Meat & Seafood" },
  { name: "Beef", categoryName: "Meat & Seafood" },
  { name: "Pork", categoryName: "Meat & Seafood" },
  { name: "Fish", categoryName: "Meat & Seafood" },
  { name: "Shellfish", categoryName: "Meat & Seafood" },

  // Frozen Meat & Seafood
  { name: "Frozen Chicken", categoryName: "Frozen Meat & Seafood" },
  { name: "Frozen Fish", categoryName: "Frozen Meat & Seafood" },
  { name: "Frozen Seafood", categoryName: "Frozen Meat & Seafood" },

  // Snacks
  { name: "Chips", categoryName: "Snacks" },
  { name: "Biscuits", categoryName: "Snacks" },
  { name: "Nuts", categoryName: "Snacks" },
  { name: "Chocolate", categoryName: "Snacks" },

  // Beverages
  { name: "Soft Drinks", categoryName: "Beverages" },
  { name: "Juices", categoryName: "Beverages" },
  { name: "Coffee", categoryName: "Beverages" },
  { name: "Tea", categoryName: "Beverages" },

  // Pantry Staples
  { name: "Rice", categoryName: "Pantry Staples" },
  { name: "Pasta", categoryName: "Pantry Staples" },
  { name: "Cooking Oil", categoryName: "Pantry Staples" },
  { name: "Sauces", categoryName: "Pantry Staples" },

  // Household Essentials
  { name: "Cleaning Supplies", categoryName: "Household Essentials" },
  { name: "Laundry", categoryName: "Household Essentials" },
  { name: "Paper Products", categoryName: "Household Essentials" },
];

// 3️⃣ IMAGE URLS (mixed: lifestyle for fresh, pack shots for others)
const images = {
  apples:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13244700_XL1_20250731.jpg?w=400&q=70",
    bananas:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13137901_LXL1.jpg?w=400&q=70",
    grapes:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13184458_BXL1_20251010.jpg?w=400&q=70",
    oranges:
    "https://media.nedigital.sg/fairprice/90074778_XL1_20251127164937_4777b6cb6109d5095e92d8b0913afa0b.jpg?w=400&q=70",
    strawberries:
    "https://media.nedigital.sg/fairprice/90152460_XL1_20251113120818_3ab70b190958dce81928b35e8fb7023a.jpg?w=400&q=70",
    carrots:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/10733611_LXL1_20210715.jpg?w=400&q=70",
    broccoli:
    "https://media.nedigital.sg/fairprice/90171305_XL1_20251127170125_027b081b8d09308aac36e32419b0a7e5.jpg?w=400&q=70",
    cherryTomatoes:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/10762156_XL1_20250627.jpg?w=400&q=70",
    babySpinach:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13167900_XL1_20250808.jpg?w=400&q=70",
    brownOnions:
    "https://media.nedigital.sg/fairprice/90187566_BXL1_20251127163214_5e67a778cea50ee14d23fbb84df48113.jpg?w=400&q=70",
    basil:
    "https://media.nedigital.sg/fairprice/90216615_XL1_20251127161728_982b6d6a06ff21d205c61d36f233046a.jpg?w=400&q=70",
    coriander:
    "https://media.nedigital.sg/fairprice/90126043_XL1_20251127154845_bd14f907dff55d215e56bbf4747b0fc9.jpg?w=400&q=70",
    parsley:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/10682666_XL1_20250530.jpg?w=400&q=70",
    mint:
    "https://media.nedigital.sg/fairprice/90169294_XL1_20251127161723_0691931f56d275730f9fa27eaf0474f7.jpg?w=400&q=70",
    rosemary:
    "https://media.nedigital.sg/fairprice/90216672_XL1_20251127161728_8f525d9974d0b8bb55412e2cb4f6d8c3.jpg?w=400&q=70",
    fullCreamMilk:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/12529008_XL1_20240301.jpg?w=400&q=70",
    lowFatMilk:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/331546_XL1_20221027.jpg?w=400&q=70",
    chocolateMilk:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/12337233_XL1_20240912.jpg?w=400&q=70",
    organicFullCreamMilk:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13081538_XL1_20250911.jpg?w=400&q=70",
    lactoseFreeMilk:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13178222_XL1_20250911.jpg?w=400&q=70",
    cheddarCheeseBlock:
    "https://media.nedigital.sg/fairprice/90231472_XL1_20251124192111_c8cc1e77c5002aafc15e8864de849038.jpg?w=400&q=70",
    shreddedMozarellaCheese:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13248358_XL1_20250911.jpg?w=400&q=70",
    parmesanCheese:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13242910_XL1_20250911.jpg?w=400&q=70",
    creamCheese:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13261310_XL1_20251023.jpg?w=400&q=70",
    goudaCheese:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13275929_XL1_20251016.jpg?w=400&q=70",
    greekYogurt:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13050067_XL1_20250209.jpg?w=400&q=70",
    strawberryYogurt:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13025595_XL1_20250604.jpg?w=400&q=70",
    mangoYogurt:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13025578_XL1_20250529.jpg?w=400&q=70",
    lowFatYogurt:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13025593_XL1_20210927.jpg?w=400&q=70",
    vanillaYogurt:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13266559_XL1_20250327.jpg?w=400&q=70",
    freshEggs:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/283672_XL1_20250801.jpg?w=400&q=70",
    thirtyFreshEggs:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13197730_XL1_20210608.jpg?w=400&q=70",
    omegaEggs:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/495350_XL1_20250801.jpg?w=400&q=70",
    organicEggs:
    "https://media.nedigital.sg/fairprice/90218997_XL1_20251127103220_e4443a2ef78f771b73433f221d0af642.jpg?w=400&q=70",
    liquidEggs:
    "https://media.nedigital.sg/fairprice/90036932_XL1_20251127172731_5473bf980b4997c78949a775087756af.jpg?w=400&q=70",
    wholeChicken:
    "https://media.nedigital.sg/fairprice/90199920_XL1_20251127180216_368aa49d99b6524356bb9b6bfc3b83ae.jpg?w=400&q=70",
    chickenBreasts:
    "https://media.nedigital.sg/fairprice/90084459_XL1_20251126115217_321356c3152ad10560db3791740fe6b6.jpg?w=400&q=70",
    chickenDrumsticks:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13145818_XL1_20230221.jpg?w=400&q=70",
    chickenThigh:
    "https://media.nedigital.sg/fairprice/90084457_XL1_20251127095223_c1961ae030e920b393a29ba3cb822a03.jpg?w=400&q=70",
    chickenMince:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13097678_XL1_20230221.jpg?w=400&q=70",
    beefSteak:
    "https://media.nedigital.sg/fairprice/90155414_XL1_20251127172734_705e37bb144632fc67c9769ba0e90000.jpg?w=400&q=70",
    beefMince:
    "https://media.nedigital.sg/fairprice/90020492_XL1_20251127174813_d6d7bffb0d47128e4c40715306e156da.jpg?w=400&q=70",
    beefCube:
    "https://media.nedigital.sg/fairprice/90099091_XL1_20251110110231_bbad930008c79dd0714081de2e788910.jpg?w=400&q=70",
    beefShabu:
    "https://media.nedigital.sg/fairprice/90128438_XL1_20251127171304_7a28042ce156b063786864e061a9a331.jpg?w=400&q=70",
    beefPatties:
    "https://media.nedigital.sg/fairprice/90112009_XL1_20251127124723_449340f15927820133f63b56a80f770b.jpg?w=400&q=70",
    porkBellySlices:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13091176_XL1_20210902.jpg?w=400&q=70",
    porkLoinChops:
    "https://media.nedigital.sg/fairprice/90018604_XL1_20251127170947_2df09ddfc360dca8ee4e44be57f6d8d6.jpg?w=400&q=70",
    mincedPork:
    "https://media.nedigital.sg/fairprice/90110508_XL1_20251127174023_df763d12adde6722d96e31f5647c110f.jpg?w=400&q=70",
    porkRibs:
    "https://media.nedigital.sg/fairprice/90110551_XL1_20251128145534_f7437d45f5baaee4e990568b648d10ef.jpg?w=400&q=70",
    porkShoulders:
    "https://media.nedigital.sg/fairprice/90018613_XL1_20251128131212_7836a912810e549b35461bf714316f3a.jpg?w=400&q=70",
    salmonFillet:
    "https://media.nedigital.sg/fairprice/90018615_XL1_20251128093225_ed869094c2ee90979cde387cf4753588.jpg?w=400&q=70",
    whiteFishFillet:
    "https://media.nedigital.sg/fairprice/90018630_XL1_20251128131214_486056a15003df680ec3d7c3f08e3033.jpg?w=400&q=70",
    mackerelWhole:
    "https://media.nedigital.sg/fairprice/90196226_XL1_20251128013319_b5dd3f50f41bba00a6b0a7763ca38a07.jpg?w=400&q=70",
    tilapiaFillet:
    "https://media.nedigital.sg/fairprice/90160631_XL1_20251127154845_e27da71234c27e2340c0b3a96dbdbc0a.jpg?w=400&q=70",
    slicedFish:
    "https://media.nedigital.sg/fairprice/90025530_XL1_20251128125138_90805e0a942156367212c1c829271c63.jpg?w=400&q=70",
    tigerPrawns:
    "https://media.nedigital.sg/fairprice/90018581_XL1_20251128134631_09e3168d1facc86dba281bfa01351d39.jpg?w=400&q=70",
    mussels:
    "https://media.nedigital.sg/fairprice/90198873_XL1_20251127141314_4bbbb86ead2a5ccef40fb798ee03409d.jpg?w=400&q=70",
    clams:
    "https://media.nedigital.sg/fairprice/90024031_XL1_20251128114539_129fd28f7f0c4466c586b28b59a0d301.jpg?w=400&q=70",
    scallops:
    "https://media.nedigital.sg/fairprice/90007382_XL1_20251128015128_f1c7ebd7a0a56c24c42ed8d2b9757ab9.jpg?w=400&q=70",
    squidRings:
    "https://media.nedigital.sg/fairprice/90196579_XL1_20251128094026_2fd8ccf943cf69e678ea2ff02873290e.jpg?w=400&q=70",
    frozenChickenNuggets:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/11948112_XL1_20251018.jpg?w=400&q=70",
    frozenChickenWings:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13191327_XL1_20231213.jpg?w=400&q=70",
    chickenPatties:
    "https://media.nedigital.sg/fairprice/90112024_XL1_20251127000145_cdbfab20bb10003fe8f329fa26e5823c.jpg?w=400&q=70",
    frozenChickenPopcorn:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13245084_XL1_20250911.jpg?w=400&q=70",
    frozenChickenKaraage:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13035334_XL1_20221109.jpg?w=400&q=70",
    frozenFishFingers:
    "https://media.nedigital.sg/fairprice/90215778_XL1_20251128150850_41f17fbb6efd98233b88cf2b72b67da0.jpg?w=400&q=70",
    frozenBreadedFishFillets:
    "https://media.nedigital.sg/fairprice/90035042_XL1_20251128105829_132e1b7bea55d895be693f5c63784174.jpg?w=400&q=70",
    frozenFishNuggets:
    "https://media.nedigital.sg/fairprice/90232822_XL1_20251127154017_708cd6102b7a1a82c7ac036f5e1429a8.jpg?w=400&q=70",
    frozenSalmonPortions:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13106181_XL1_20210210.jpg?w=400&q=70",
    frozenFishFilletMix:
    "https://media.nedigital.sg/fairprice/90011455_XL1_20251127210422_abdd3c5acbeb87400cad9ff2d7a699ea.jpg?w=400&q=70",
    frozenPrawnMeat:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13047093_XL1_20240328.jpg?w=400&q=70",
    frozenCalamariRings:
    "https://media.nedigital.sg/fairprice/90011422_XL1_20251128103214_8ac3293e3e3a5e99854a05cc2dce8741.jpg?w=400&q=70",
    frozenMixedSeafood:
    "https://tse2.mm.bing.net/th/id/OIP.KVGHT5j6eCUwuvLoFSfvLwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
    frozenCrabSticks:
    "https://media.nedigital.sg/fairprice/90171386_XL1_20251128105829_a49b52d4f85d37deba72bed715938ab8.jpg?w=400&q=70",
    frozenMusselMeat:
    "https://media.nedigital.sg/fairprice/90035541_XL1_20251125184738_fbf1710fd4b7c805730d9a8d3170e5d9.jpg?w=400&q=70",
    potatoChips:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13207660_XL1_20211103.jpg?w=400&q=70",
    sourCreamChips:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13207659_XL1_20211103.jpg?w=400&q=70",
    tortillaChips:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/10729188_XL1_20251023.jpg?w=400&q=70",
    BBQChips:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13219218_XL1_20251127.jpg?w=400&q=70",
    saltAndVinegarChips:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13219217_XL1_20230117.jpg?w=400&q=70",
    butterCookiesTin:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/48886_XL1_20250731.jpg?w=400&q=70",
    chocChipCookies:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13247951_XL1_20240418.jpg?w=400&q=70",
    disgestiveBiscuits:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13231916_XL1_20230615.jpg?w=400&q=70",
    creamBiscuits:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13198785_XL1_20250911.jpg?w=400&q=70",
    cheeseCrackers:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13013276_XL1_20250911.jpg?w=400&q=70",
    roastedPeanuts:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13010730_XL1_20250710.jpg?w=400&q=70",
    almondsRoasted:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13266141_XL1_20250428.jpg?w=400&q=70",
    roastedCashews:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/457540_XL1_20250526.jpg?w=400&q=70",
    mixedNuts:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/11961907_XL1_20241130.jpg?w=400&q=70",
    saltedPistachios:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13080699_XL1_20220909.jpg?w=400&q=70",
    milkChoco:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/12170437_XL1_20220811.jpg?w=400&q=70",
    darkChoco:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13151362_XL1_20250911.jpg?w=400&q=70",
    hazelnutChoco:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13153001_XL1_20230713.jpg?w=400&q=70",
    assortedChoco:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13142371_XL1.jpg?w=400&q=70",
    whiteChoco:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13230620_XL1_20230710.jpg?w=400&q=70",
    colaDrink:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13134976_XL1_20250606.jpg?w=400&q=70",
    lemonLime:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/448268_XL1_20240717.jpg?w=400&q=70",
    orangeDrink:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/454330_XL1_20221012.jpg?w=400&q=70",
    cola6Drink:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13083570_XL1_20251002.jpg?w=400&q=70",
    sodaWater:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/454322_XL1_20250220.jpg?w=400&q=70",
    orangeJuice:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/11114310_XL1_20230130.jpg?w=400&q=70",
    appleJuice:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/11114337_XL1_20250327.jpg?w=400&q=70",
    mixedFruitJuice:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/11655272_XL1_20230713.jpg?w=400&q=70",
    cranberryJuice:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13073423_XL1_20250911.jpg?w=400&q=70",
    mangoJuice:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/443052_XL1_20230614.jpg?w=400&q=70",
    instantCoffee:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13039640_XL1_20251031.jpg?w=400&q=70",
    groundCoffee:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/160979_XL1.jpg?w=400&q=70",
    coffeeBeans:
    "https://media.nedigital.sg/fairprice/90077242_XL1_20251126161336_02a622eeee471b7d0abfdecad474ee0d.jpg?w=400&q=70",
    threeInOneCoffee:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13215144_XL1_20250319.jpg?w=400&q=70",
    espressoCapsules:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13273657_XL1_20250917.jpg?w=400&q=70",
    englishBreakfastTea:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13062076_XL1_20240912.jpg?w=400&q=70",
    greenTeaBags:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/114273_XL1_20250911.jpg?w=400&q=70",
    chamomileHerbalTea:
    "https://media.nedigital.sg/fairprice/90015764_XL1_20251128005851_96c693f6c149ec755ca7eab14f9b78e5.jpg?w=400&q=70",
    earlGreyTea:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13062073_XL1_20240912.jpg?w=400&q=70",
    lemongrassTea:
    "https://media.nedigital.sg/fairprice/90014521_XL1_20251125175617_21fdd3f7dc6d84df459d7f7fffea1d70.jpg?w=400&q=70",
    jasmineRice:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13086205_XL1_20210705.jpg?w=400&q=70",
    basmatiRice:
    "https://media.nedigital.sg/fairprice/90043385_XL1_20251128192114_080e7e7200bf6c0c16cb167d9db38869.jpg?w=400&q=70",
    shortGrainRice:
    "https://media.nedigital.sg/fairprice/90213537_XL1_20251128190614_5ea9ebf9c1e4c6025ede9cc044626c1e.jpg?w=400&q=70",
    brownRice:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13181370_XL1_20251114.jpg?w=400&q=70",
    glutinousRice:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13087646_XL1_20211201.jpg?w=400&q=70",
    spaghetti:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13026152_XL1_20241219.jpg?w=400&q=70",
    pennePasta:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/123414_XL1_20241219.jpg?w=400&q=70",
    fusilliPasta:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13072777_XL1_20241219.jpg?w=400&q=70",
    macaroni:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/337700_XL1_20241219.jpg?w=400&q=70",
    lasagnaSheets:
    "https://media.nedigital.sg/fairprice/90023199_XL1_20251128174439_023915104d4f4bca01c1b9fd354bbf0d.jpg?w=400&q=70",
    vegetableOil:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/12616320_XL1_20250801.jpg?w=400&q=70",
    oliveOil:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/10173079_XL1_20250923.jpg?w=400&q=70",
    canolaOil:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/12176177_XL1_20251031.jpg?w=400&q=70",
    sesameOil:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/278615_XL1_20210607.jpg?w=400&q=70",
    sunflowerOil:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/12634991_XL1_20211214.jpg?w=400&q=70",
    tomatoKetchup:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13259472_XL1_20241010.jpg?w=400&q=70",
    soySauce:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/60608_XL1_20210608.jpg?w=400&q=70",
    chilliSauce:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/11219622_XL1_20220629.jpg?w=400&q=70",
    pastaSauce:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/11502815_XL1_20250731.jpg?w=400&q=70",
    oysterSauce:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/10709179_XL1_20250724.jpg?w=400&q=70",
    multiPurposeCleaner:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/10497962_XL1_20211115.jpg?w=400&q=70",
    floorCleaner:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/10735801_XL1_20250925.jpg?w=400&q=70",
    glassCleaner:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13188192_XL1_20210322.jpg?w=400&q=70",
    bathroomCleaner:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13262076_XL1_20250911.jpg?w=400&q=70",
    disinfectantWipes:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13214826_XL1_20240912.jpg?w=400&q=70",
    laundryDetergentLiquid:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13198789_XL1_20210512.jpg?w=400&q=70",
    laundryDetergentPowder:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/11084203_XL1_20220825.jpg?w=400&q=70",
    fabricSoftener:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13214813_XL1_20250423.jpg?w=400&q=70",
    laundryPods:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13239694_XL1_20251120.jpg?w=400&q=70",
    stainRemoverSpray:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13091472_XL1_20230803.jpg?w=400&q=70",
    toiletPaper:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13088911_XL1_20250801.jpg?w=400&q=70",
    kitchenTowels:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13232188_XL1_20250801.jpg?w=400&q=70",
    facialTissue:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13260251_XL1_20251113.jpg?w=400&q=70",
    paperNapkins:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/475063_XL1_20220217.jpg?w=400&q=70",
    toiletPaper20:
    "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13093697_XL1_20250801.jpg?w=400&q=70"

}

 

//  PRODUCTS META (150 items = 5 per subcategory)
// Use subcategoryName so we can safely map to subcategoryId later.
const productsMeta = [
  // ─────────────── FRESH PRODUCE ───────────────
  // Fruits
  {
    name: "Fresh Red Apples (Pack of 6)",
    price: 3.99,
    stock: 800,
    imageUrl: images.apples,
    subcategoryName: "Fruits",
  },
  {
    name: "Bananas (1kg)",
    price: 2.30,
    stock: 1000,
    imageUrl: images.bananas,
    subcategoryName: "Fruits",
  },
  {
    name: "Seedless Green Grapes (500g)",
    price: 4.50,
    stock: 600,
    imageUrl: images.grapes,
    subcategoryName: "Fruits",
  },
  {
    name: "Navel Oranges (Pack of 4)",
    price: 4.20,
    stock: 700,
    imageUrl: images.oranges,
    subcategoryName: "Fruits",
  },
  {
    name: "Strawberries (250g punnet)",
    price: 5.10,
    stock: 450,
    imageUrl: images.strawberries,
    subcategoryName: "Fruits",
  },

  // Vegetables
  {
    name: "Fresh Carrots (500g)",
    price: 1.20,
    stock: 1200,
    imageUrl: images.carrots,
    subcategoryName: "Vegetables",
  },
  {
    name: "Broccoli Crown",
    price: 2.10,
    stock: 800,
    imageUrl: images.broccoli,
    subcategoryName: "Vegetables",
  },
  {
    name: "Cherry Tomatoes (300g)",
    price: 2.90,
    stock: 900,
    imageUrl: images.cherryTomatoes,
    subcategoryName: "Vegetables",
  },
  {
    name: "Baby Spinach (200g)",
    price: 3.30,
    stock: 700,
    imageUrl: images.babySpinach,
    subcategoryName: "Vegetables",
  },
  {
    name: "Brown Onions (1kg)",
    price: 2.00,
    stock: 1100,
    imageUrl: images.brownOnions,
    subcategoryName: "Vegetables",
  },

  // Herbs
  {
    name: "Fresh Basil (bunch)",
    price: 1.80,
    stock: 500,
    imageUrl: images.basil,
    subcategoryName: "Herbs",
  },
  {
    name: "Fresh Coriander (bunch)",
    price: 1.60,
    stock: 550,
    imageUrl: images.coriander,
    subcategoryName: "Herbs",
  },
  {
    name: "Fresh Parsley (bunch)",
    price: 1.70,
    stock: 600,
    imageUrl: images.parsley,
    subcategoryName: "Herbs",
  },
  {
    name: "Fresh Mint (bunch)",
    price: 1.90,
    stock: 450,
    imageUrl: images.mint,
    subcategoryName: "Herbs",
  },
  {
    name: "Fresh Rosemary (pack)",
    price: 2.20,
    stock: 400,
    imageUrl: images.rosemary,
    subcategoryName: "Herbs",
  },

  // ─────────────── DAIRY & EGGS ───────────────
  // Milk
  {
    name: "Full Cream Milk 1L",
    price: 2.50,
    stock: 900,
    imageUrl: images.fullCreamMilk,
    subcategoryName: "Milk",
  },
  {
    name: "Low Fat Milk 1L",
    price: 2.60,
    stock: 800,
    imageUrl: images.lowFatMilk,
    subcategoryName: "Milk",
  },
  {
    name: "Fresh Chocolate Milk 1L",
    price: 3.10,
    stock: 600,
    imageUrl: images.chocolateMilk,
    subcategoryName: "Milk",
  },
  {
    name: "Organic Full Cream Milk 1L",
    price: 3.80,
    stock: 400,
    imageUrl: images.organicFullCreamMilk,
    subcategoryName: "Milk",
  },
  {
    name: "Lactose-Free Milk 1L",
    price: 3.50,
    stock: 350,
    imageUrl: images.lactoseFreeMilk,
    subcategoryName: "Milk",
  },

  // Cheese
  {
    name: "Cheddar Cheese Block 500g",
    price: 7.50,
    stock: 500,
    imageUrl: images.cheddarCheeseBlock,
    subcategoryName: "Cheese",
  },
  {
    name: "Mozzarella Shredded 250g",
    price: 4.90,
    stock: 550,
    imageUrl: images.shreddedMozarellaCheese,
    subcategoryName: "Cheese",
  },
  {
    name: "Parmesan Cheese Grated 200g",
    price: 6.30,
    stock: 400,
    imageUrl: images.parmesanCheese,
    subcategoryName: "Cheese",
  },
  {
    name: "Cream Cheese Tub 250g",
    price: 3.90,
    stock: 600,
    imageUrl: images.creamCheese,
    subcategoryName: "Cheese",
  },
  {
    name: "Gouda Cheese Slices 200g",
    price: 5.40,
    stock: 450,
    imageUrl: images.goudaCheese,
    subcategoryName: "Cheese",
  },

  // Yogurt
  {
    name: "Greek Yogurt Plain 500g",
    price: 4.20,
    stock: 500,
    imageUrl: images.greekYogurt,
    subcategoryName: "Yogurt",
  },
  {
    name: "Strawberry Yogurt 4 x 100g",
    price: 3.50,
    stock: 650,
    imageUrl: images.strawberryYogurt,
    subcategoryName: "Yogurt",
  },
  {
    name: "Mango Yogurt 4 x 100g",
    price: 3.50,
    stock: 600,
    imageUrl: images.mangoYogurt,
    subcategoryName: "Yogurt",
  },
  {
    name: "Low Fat Natural Yogurt 500g",
    price: 3.90,
    stock: 550,
    imageUrl: images.lowFatYogurt,
    subcategoryName: "Yogurt",
  },
  {
    name: "Vanilla Yogurt Tub 1kg",
    price: 5.80,
    stock: 350,
    imageUrl: images.vanillaYogurt,
    subcategoryName: "Yogurt",
  },

  // Eggs
  {
    name: "Fresh Eggs (10 pcs)",
    price: 3.20,
    stock: 1000,
    imageUrl: images.freshEggs,
    subcategoryName: "Eggs",
  },
  {
    name: "Fresh Eggs (30 pcs Tray)",
    price: 8.50,
    stock: 600,
    imageUrl: images.thirtyFreshEggs,
    subcategoryName: "Eggs",
  },
  {
    name: "Omega-3 Eggs (10 pcs)",
    price: 4.20,
    stock: 500,
    imageUrl: images.omegaEggs,
    subcategoryName: "Eggs",
  },
  {
    name: "Organic Free-Range Eggs (10 pcs)",
    price: 5.30,
    stock: 400,
    imageUrl: images.organicEggs,
    subcategoryName: "Eggs",
  },
  {
    name: "Pasteurized Liquid Eggs 500ml",
    price: 3.90,
    stock: 300,
    imageUrl: images.liquidEggs,
    subcategoryName: "Eggs",
  },

  // ─────────────── MEAT & SEAFOOD ───────────────
  // Chicken
  {
    name: "Fresh Whole Chicken (1.2kg)",
    price: 8.90,
    stock: 400,
    imageUrl: images.wholeChicken,
    subcategoryName: "Chicken",
  },
  {
    name: "Chicken Breast Fillets 500g",
    price: 6.20,
    stock: 600,
    imageUrl: images.chickenBreasts,
    subcategoryName: "Chicken",
  },
  {
    name: "Chicken Drumsticks 1kg",
    price: 7.50,
    stock: 500,
    imageUrl: images.chickenDrumsticks,
    subcategoryName: "Chicken",
  },
  {
    name: "Chicken Thigh Fillets 500g",
    price: 6.80,
    stock: 450,
    imageUrl: images.chickenThigh,
    subcategoryName: "Chicken",
  },
  {
    name: "Minced Chicken 500g",
    price: 5.90,
    stock: 550,
    imageUrl: images.chickenMince,
    subcategoryName: "Chicken",
  },

  // Beef
  {
    name: "Beef Striploin Steak 300g",
    price: 12.50,
    stock: 300,
    imageUrl: images.beefSteak,
    subcategoryName: "Beef",
  },
  {
    name: "Beef Mince 500g",
    price: 8.30,
    stock: 500,
    imageUrl: images.beefMince,
    subcategoryName: "Beef",
  },
  {
    name: "Beef Stew Cubes 500g",
    price: 9.90,
    stock: 400,
    imageUrl: images.beefCube,
    subcategoryName: "Beef",
  },
  {
    name: "Beef Shabu Slices 300g",
    price: 10.80,
    stock: 350,
    imageUrl: images.beefShabu,
    subcategoryName: "Beef",
  },
  {
    name: "Beef Burger Patties 4 pcs",
    price: 8.70,
    stock: 450,
    imageUrl: images.beefPatties,
    subcategoryName: "Beef",
  },

  // Pork
  {
    name: "Pork Belly Slices 500g",
    price: 7.80,
    stock: 450,
    imageUrl: images.porkBellySlices,
    subcategoryName: "Pork",
  },
  {
    name: "Pork Loin Chops 500g",
    price: 7.20,
    stock: 500,
    imageUrl: images.porkLoinChops,
    subcategoryName: "Pork",
  },
  {
    name: "Minced Pork 500g",
    price: 6.50,
    stock: 600,
    imageUrl: images.mincedPork,
    subcategoryName: "Pork",
  },
  {
    name: "Pork Ribs 1kg",
    price: 11.40,
    stock: 350,
    imageUrl: images.porkRibs,
    subcategoryName: "Pork",
  },
  {
    name: "Pork Shoulder Slices 500g",
    price: 7.90,
    stock: 400,
    imageUrl: images.porkShoulders,
    subcategoryName: "Pork",
  },

  // Fish
  {
    name: "Salmon Fillet 200g",
    price: 9.90,
    stock: 300,
    imageUrl: images.salmonFillet,
    subcategoryName: "Fish",
  },
  {
    name: "White Fish Fillet 500g",
    price: 8.40,
    stock: 400,
    imageUrl: images.whiteFishFillet,
    subcategoryName: "Fish",
  },
  {
    name: "Mackerel Whole (cleaned)",
    price: 6.90,
    stock: 350,
    imageUrl: images.mackerelWhole,
    subcategoryName: "Fish",
  },
  {
    name: "Tilapia Fillet 500g",
    price: 7.30,
    stock: 450,
    imageUrl: images.tilapiaFillet,
    subcategoryName: "Fish",
  },
  {
    name: "Sliced Fish for Soup 300g",
    price: 6.50,
    stock: 500,
    imageUrl: images.slicedFish,
    subcategoryName: "Fish",
  },

  // Shellfish
  {
    name: "Tiger Prawns 500g",
    price: 11.90,
    stock: 350,
    imageUrl: images.tigerPrawns,
    subcategoryName: "Shellfish",
  },
  {
    name: "Half Shell Mussels 500g",
    price: 9.20,
    stock: 300,
    imageUrl: images.mussels,
    subcategoryName: "Shellfish",
  },
  {
    name: "Clams 1kg",
    price: 8.30,
    stock: 400,
    imageUrl: images.clams,
    subcategoryName: "Shellfish",
  },
  {
    name: "Scallops 300g",
    price: 12.70,
    stock: 250,
    imageUrl: images.scallops,
    subcategoryName: "Shellfish",
  },
  {
    name: "Squid Rings 500g",
    price: 9.10,
    stock: 350,
    imageUrl: images.squidRings,
    subcategoryName: "Shellfish",
  },

  // ─────────────── FROZEN MEAT & SEAFOOD ───────────────
  // Frozen Chicken
  {
    name: "Frozen Chicken Nuggets 1kg",
    price: 7.90,
    stock: 600,
    imageUrl: images.frozenChickenNuggets,
    subcategoryName: "Frozen Chicken",
  },
  {
    name: "Frozen Chicken Wings 1kg",
    price: 8.50,
    stock: 500,
    imageUrl: images.frozenChickenWings,
    subcategoryName: "Frozen Chicken",
  },
  {
    name: "Frozen Breaded Chicken Patties 600g",
    price: 6.90,
    stock: 550,
    imageUrl: images.chickenPatties,
    subcategoryName: "Frozen Chicken",
  },
  {
    name: "Frozen Chicken Popcorn 750g",
    price: 7.40,
    stock: 450,
    imageUrl: images.frozenChickenPopcorn,
    subcategoryName: "Frozen Chicken",
  },
  {
    name: "Frozen Chicken Karaage 500g",
    price: 7.20,
    stock: 400,
    imageUrl: images.frozenChickenKaraage,
    subcategoryName: "Frozen Chicken",
  },

  // Frozen Fish
  {
    name: "Frozen Fish Fingers 500g",
    price: 5.90,
    stock: 700,
    imageUrl: images.frozenFishFingers,
    subcategoryName: "Frozen Fish",
  },
  {
    name: "Frozen Breaded Fish Fillets 600g",
    price: 7.50,
    stock: 550,
    imageUrl: images.frozenBreadedFishFillets,
    subcategoryName: "Frozen Fish",
  },
  {
    name: "Frozen Fish Nuggets 500g",
    price: 6.80,
    stock: 500,
    imageUrl: images.frozenFishNuggets,
    subcategoryName: "Frozen Fish",
  },
  {
    name: "Frozen Salmon Portions 4 pcs",
    price: 13.50,
    stock: 300,
    imageUrl: images.frozenSalmonPortions,
    subcategoryName: "Frozen Fish",
  },
  {
    name: "Frozen Fish Fillet Mix 1kg",
    price: 10.90,
    stock: 400,
    imageUrl: images.frozenFishFilletMix,
    subcategoryName: "Frozen Fish",
  },

  // Frozen Seafood
  {
    name: "Frozen Prawn Meat 500g",
    price: 11.40,
    stock: 350,
    imageUrl: images.frozenPrawnMeat,
    subcategoryName: "Frozen Seafood",
  },
  {
    name: "Frozen Calamari Rings 500g",
    price: 9.30,
    stock: 400,
    imageUrl: images.frozenCalamariRings,
    subcategoryName: "Frozen Seafood",
  },
  {
    name: "Frozen Mixed Seafood 500g",
    price: 10.20,
    stock: 450,
    imageUrl: images.frozenMixedSeafood,
    subcategoryName: "Frozen Seafood",
  },
  {
    name: "Frozen Crab Sticks 500g",
    price: 5.40,
    stock: 600,
    imageUrl: images.frozenCrabSticks,
    subcategoryName: "Frozen Seafood",
  },
  {
    name: "Frozen Mussel Meat 500g",
    price: 8.80,
    stock: 300,
    imageUrl: images.frozenMusselMeat,
    subcategoryName: "Frozen Seafood",
  },

  // ─────────────── SNACKS ───────────────
  // Chips
  {
    name: "Potato Chips Original 150g",
    price: 2.50,
    stock: 900,
    imageUrl: images.potatoChips,
    subcategoryName: "Chips",
  },
  {
    name: "Potato Chips Sour Cream 150g",
    price: 2.60,
    stock: 850,
    imageUrl: images.sourCreamChips,
    subcategoryName: "Chips",
  },
  {
    name: "Tortilla Chips 200g",
    price: 3.10,
    stock: 700,
    imageUrl: images.tortillaChips,
    subcategoryName: "Chips",
  },
  {
    name: "Barbecue Potato Chips 150g",
    price: 2.70,
    stock: 800,
    imageUrl: images.BBQChips,
    subcategoryName: "Chips",
  },
  {
    name: "Salt & Vinegar Potato Chips 150g",
    price: 2.70,
    stock: 750,
    imageUrl: images.saltAndVinegarChips,
    subcategoryName: "Chips",
  },

  // Biscuits
  {
    name: "Butter Cookies Tin 400g",
    price: 5.90,
    stock: 600,
    imageUrl: images.butterCookiesTin,
    subcategoryName: "Biscuits",
  },
  {
    name: "Chocolate Chip Cookies 200g",
    price: 3.40,
    stock: 800,
    imageUrl: images.chocChipCookies,
    subcategoryName: "Biscuits",
  },
  {
    name: "Digestive Biscuits 250g",
    price: 2.80,
    stock: 700,
    imageUrl: images.disgestiveBiscuits,
    subcategoryName: "Biscuits",
  },
  {
    name: "Cream Sandwich Biscuits 300g",
    price: 3.20,
    stock: 650,
    imageUrl: images.creamBiscuits,
    subcategoryName: "Biscuits",
  },
  {
    name: "Cheese Crackers 200g",
    price: 2.90,
    stock: 750,
    imageUrl: images.cheeseCrackers,
    subcategoryName: "Biscuits",
  },

  // Nuts
  {
    name: "Roasted Peanuts 200g",
    price: 3.10,
    stock: 700,
    imageUrl: images.roastedPeanuts,
    subcategoryName: "Nuts",
  },
  {
    name: "Almonds Roasted 200g",
    price: 5.40,
    stock: 600,
    imageUrl: images.almondsRoasted,
    subcategoryName: "Nuts",
  },
  {
    name: "Cashew Nuts Roasted 200g",
    price: 5.80,
    stock: 550,
    imageUrl: images.roastedCashews,
    subcategoryName: "Nuts",
  },
  {
    name: "Mixed Nuts 300g",
    price: 6.50,
    stock: 500,
    imageUrl: images.mixedNuts,
    subcategoryName: "Nuts",
  },
  {
    name: "Pistachios Salted 200g",
    price: 6.90,
    stock: 450,
    imageUrl: images.saltedPistachios,
    subcategoryName: "Nuts",
  },

  // Chocolate
  {
    name: "Milk Chocolate Bar 100g",
    price: 2.20,
    stock: 800,
    imageUrl: images.milkChoco,
    subcategoryName: "Chocolate",
  },
  {
    name: "Dark Chocolate 70% 100g",
    price: 2.80,
    stock: 700,
    imageUrl: images.darkChoco,
    subcategoryName: "Chocolate",
  },
  {
    name: "Hazelnut Chocolate Bar 100g",
    price: 2.90,
    stock: 650,
    imageUrl: images.hazelnutChoco,
    subcategoryName: "Chocolate",
  },
  {
    name: "Assorted Chocolates Box 300g",
    price: 9.90,
    stock: 400,
    imageUrl: images.assortedChoco,
    subcategoryName: "Chocolate",
  },
  {
    name: "White Chocolate Bar 100g",
    price: 2.50,
    stock: 600,
    imageUrl: images.whiteChoco,
    subcategoryName: "Chocolate",
  },

  // ─────────────── BEVERAGES ───────────────
  // Soft Drinks
  {
    name: "Cola Soft Drink 1.5L",
    price: 2.70,
    stock: 900,
    imageUrl: images.colaDrink,
    subcategoryName: "Soft Drinks",
  },
  {
    name: "Lemon Lime Soft Drink 1.5L",
    price: 2.70,
    stock: 800,
    imageUrl: images.lemonLime,
    subcategoryName: "Soft Drinks",
  },
  {
    name: "Orange Flavoured Soft Drink 1.5L",
    price: 2.70,
    stock: 750,
    imageUrl: images.orangeDrink,
    subcategoryName: "Soft Drinks",
  },
  {
    name: "Cola Soft Drink Can 330ml (6-pack)",
    price: 5.50,
    stock: 600,
    imageUrl: images.cola6Drink,
    subcategoryName: "Soft Drinks",
  },
  {
    name: "Soda Water 1L",
    price: 1.80,
    stock: 700,
    imageUrl: images.sodaWater,
    subcategoryName: "Soft Drinks",
  },

  // Juices
  {
    name: "Orange Juice 1L",
    price: 3.20,
    stock: 700,
    imageUrl: images.orangeJuice,
    subcategoryName: "Juices",
  },
  {
    name: "Apple Juice 1L",
    price: 3.20,
    stock: 650,
    imageUrl: images.appleJuice,
    subcategoryName: "Juices",
  },
  {
    name: "Mixed Fruit Juice 1L",
    price: 3.40,
    stock: 600,
    imageUrl: images.mixedFruitJuice,
    subcategoryName: "Juices",
  },
  {
    name: "Cranberry Juice 1L",
    price: 3.90,
    stock: 500,
    imageUrl: images.cranberryJuice,
    subcategoryName: "Juices",
  },
  {
    name: "Mango Juice 1L",
    price: 3.60,
    stock: 550,
    imageUrl: images.mangoJuice,
    subcategoryName: "Juices",
  },

  // Coffee
  {
    name: "Instant Coffee Powder 200g",
    price: 7.20,
    stock: 500,
    imageUrl: images.instantCoffee,
    subcategoryName: "Coffee",
  },
  {
    name: "Ground Coffee Dark Roast 250g",
    price: 9.50,
    stock: 400,
    imageUrl: images.groundCoffee,
    subcategoryName: "Coffee",
  },
  {
    name: "Coffee Beans Medium Roast 500g",
    price: 14.20,
    stock: 350,
    imageUrl: images.coffeeBeans,
    subcategoryName: "Coffee",
  },
  {
    name: "3-in-1 Coffee Sachets (20 pack)",
    price: 6.90,
    stock: 600,
    imageUrl: images.threeInOneCoffee,
    subcategoryName: "Coffee",
  },
  {
    name: "Espresso Capsules (10 pack)",
    price: 7.80,
    stock: 300,
    imageUrl: images.espressoCapsules,
    subcategoryName: "Coffee",
  },

  // Tea
  {
    name: "English Breakfast Tea Bags (50 pack)",
    price: 4.90,
    stock: 600,
    imageUrl: images.englishBreakfastTea,
    subcategoryName: "Tea",
  },
  {
    name: "Green Tea Bags (50 pack)",
    price: 4.90,
    stock: 550,
    imageUrl: images.greenTeaBags,
    subcategoryName: "Tea",
  },
  {
    name: "Chamomile Herbal Tea (25 pack)",
    price: 3.80,
    stock: 450,
    imageUrl: images.chamomileHerbalTea,
    subcategoryName: "Tea",
  },
  {
    name: "Earl Grey Tea Bags (25 pack)",
    price: 3.90,
    stock: 500,
    imageUrl: images.earlGreyTea,
    subcategoryName: "Tea",
  },
  {
    name: "Lemongrass & Ginger Tea (20 pack)",
    price: 4.20,
    stock: 400,
    imageUrl: images.lemongrassTea,
    subcategoryName: "Tea",
  },

  // ─────────────── PANTRY STAPLES ───────────────
  // Rice
  {
    name: "Jasmine Rice 5kg",
    price: 12.50,
    stock: 400,
    imageUrl: images.jasmineRice,
    subcategoryName: "Rice",
  },
  {
    name: "Basmati Rice 5kg",
    price: 15.20,
    stock: 350,
    imageUrl: images.basmatiRice,
    subcategoryName: "Rice",
  },
  {
    name: "Short Grain Rice 2kg",
    price: 7.90,
    stock: 450,
    imageUrl: images.shortGrainRice,
    subcategoryName: "Rice",
  },
  {
    name: "Brown Rice 2kg",
    price: 8.60,
    stock: 400,
    imageUrl: images.brownRice,
    subcategoryName: "Rice",
  },
  {
    name: "Glutinous Rice 1kg",
    price: 4.90,
    stock: 500,
    imageUrl: images.glutinousRice,
    subcategoryName: "Rice",
  },

  // Pasta
  {
    name: "Spaghetti 500g",
    price: 2.10,
    stock: 700,
    imageUrl: images.spaghetti,
    subcategoryName: "Pasta",
  },
  {
    name: "Penne Pasta 500g",
    price: 2.20,
    stock: 650,
    imageUrl: images.pennePasta,
    subcategoryName: "Pasta",
  },
  {
    name: "Fusilli Pasta 500g",
    price: 2.30,
    stock: 600,
    imageUrl: images.fusilliPasta,
    subcategoryName: "Pasta",
  },
  {
    name: "Macaroni 500g",
    price: 2.10,
    stock: 700,
    imageUrl: images.macaroni,
    subcategoryName: "Pasta",
  },
  {
    name: "Lasagne Sheets 250g",
    price: 3.40,
    stock: 400,
    imageUrl: images.lasagnaSheets,
    subcategoryName: "Pasta",
  },

  // Cooking Oil
  {
    name: "Vegetable Oil 2L",
    price: 7.50,
    stock: 500,
    imageUrl: images.vegetableOil,
    subcategoryName: "Cooking Oil",
  },
  {
    name: "Olive Oil Extra Virgin 1L",
    price: 12.90,
    stock: 350,
    imageUrl: images.oliveOil,
    subcategoryName: "Cooking Oil",
  },
  {
    name: "Canola Oil 2L",
    price: 7.80,
    stock: 450,
    imageUrl: images.canolaOil,
    subcategoryName: "Cooking Oil",
  },
  {
    name: "Sesame Oil 500ml",
    price: 6.50,
    stock: 400,
    imageUrl: images.sesameOil,
    subcategoryName: "Cooking Oil",
  },
  {
    name: "Sunflower Oil 1L",
    price: 5.90,
    stock: 450,
    imageUrl: images.sunflowerOil,
    subcategoryName: "Cooking Oil",
  },

  // Sauces
  {
    name: "Tomato Ketchup 500g",
    price: 2.50,
    stock: 700,
    imageUrl: images.tomatoKetchup,
    subcategoryName: "Sauces",
  },
  {
    name: "Soy Sauce 750ml",
    price: 3.20,
    stock: 650,
    imageUrl: images.soySauce,
    subcategoryName: "Sauces",
  },
  {
    name: "Chili Sauce 500g",
    price: 2.70,
    stock: 600,
    imageUrl: images.chilliSauce,
    subcategoryName: "Sauces",
  },
  {
    name: "Pasta Sauce Basil 680g",
    price: 4.60,
    stock: 550,
    imageUrl: images.pastaSauce,
    subcategoryName: "Sauces",
  },
  {
    name: "Oyster Sauce 510g",
    price: 3.90,
    stock: 500,
    imageUrl: images.oysterSauce,
    subcategoryName: "Sauces",
  },

  // ─────────────── HOUSEHOLD ESSENTIALS ───────────────
  // Cleaning Supplies
  {
    name: "Multi-Purpose Cleaner 1L",
    price: 4.90,
    stock: 400,
    imageUrl: images.multiPurposeCleaner,
    subcategoryName: "Cleaning Supplies",
  },
  {
    name: "Floor Cleaner 1.5L",
    price: 5.40,
    stock: 350,
    imageUrl: images.floorCleaner,
    subcategoryName: "Cleaning Supplies",
  },
  {
    name: "Glass Cleaner Spray 500ml",
    price: 3.80,
    stock: 450,
    imageUrl: images.glassCleaner,
    subcategoryName: "Cleaning Supplies",
  },
  {
    name: "Bathroom Cleaner 1L",
    price: 4.50,
    stock: 400,
    imageUrl: images.bathroomCleaner,
    subcategoryName: "Cleaning Supplies",
  },
  {
    name: "Disinfectant Wipes (80 pcs)",
    price: 5.90,
    stock: 500,
    imageUrl: images.disinfectantWipes,
    subcategoryName: "Cleaning Supplies",
  },

  // Laundry
  {
    name: "Laundry Detergent Liquid 2L",
    price: 9.20,
    stock: 400,
    imageUrl: images.laundryDetergentLiquid,
    subcategoryName: "Laundry",
  },
  {
    name: "Laundry Powder Detergent 3kg",
    price: 10.50,
    stock: 350,
    imageUrl: images.laundryDetergentPowder,
    subcategoryName: "Laundry",
  },
  {
    name: "Fabric Softener 2L",
    price: 7.30,
    stock: 400,
    imageUrl: images.fabricSoftener,
    subcategoryName: "Laundry",
  },
  {
    name: "Laundry Pods (30 pack)",
    price: 11.40,
    stock: 300,
    imageUrl: images.laundryPods,
    subcategoryName: "Laundry",
  },
  {
    name: "Stain Remover Spray 500ml",
    price: 6.10,
    stock: 350,
    imageUrl: images.stainRemoverSpray,
    subcategoryName: "Laundry",
  },

  // Paper Products
  {
    name: "Toilet Paper 10 Rolls",
    price: 7.50,
    stock: 500,
    imageUrl: images.toiletPaper,
    subcategoryName: "Paper Products",
  },
  {
    name: "Kitchen Towels 6 Rolls",
    price: 6.90,
    stock: 450,
    imageUrl: images.kitchenTowels,
    subcategoryName: "Paper Products",
  },
  {
    name: "Facial Tissue Box (4 pack)",
    price: 5.40,
    stock: 500,
    imageUrl: images.facialTissue,
    subcategoryName: "Paper Products",
  },
  {
    name: "Paper Napkins (100 pcs)",
    price: 2.30,
    stock: 600,
    imageUrl: images.paperNapkins,
    subcategoryName: "Paper Products",
  },
  {
    name: "Toilet Paper 20 Rolls Family Pack",
    price: 13.90,
    stock: 400,
    imageUrl: images.toiletPaper20,
    subcategoryName: "Paper Products",
  },
];



async function main() {
  // 1. CLEAR OLD DATA (SAFE)
  try { await prisma.orderItem.deleteMany(); } catch {}
  try { await prisma.order.deleteMany(); } catch {}
  try { await prisma.user.deleteMany(); } catch {}
  try { await prisma.product.deleteMany(); } catch {}
  try { await prisma.subcategory.deleteMany(); } catch {}
  try { await prisma.category.deleteMany(); } catch {}
  try { await prisma.deliveryOption.deleteMany(); } catch {}

  console.log("Old data cleared.");

  // 2. SEED CATEGORIES ✅ FIXED
  console.log("Seeding categories...");
  let insertedCategories = [];
  try {
    await prisma.category.createMany({
  data: categoriesData,
  skipDuplicates: true,
});


    insertedCategories = await prisma.category.findMany();
  } catch (e) {
    console.warn("Skipping Category seed:", e.message);
  }

  const categoryMap = new Map(insertedCategories.map(c => [c.name, c.id]));

  // 3. SEED SUBCATEGORIES ✅ FIXED
  console.log("Seeding subcategories...");
  let subcategoryMap = new Map();

  try {
    if (categoryMap.size === 0) throw new Error("No categories");

    const subcategoriesData = subcategoriesMeta
      .map(s => ({
        name: s.name,
        categoryId: categoryMap.get(s.categoryName),
      }))
      .filter(s => s.categoryId);

    await prisma.subcategory.createMany({
      data: subcategoriesData,
      skipDuplicates: true,
    });

    const insertedSubcategories = await prisma.subcategory.findMany();
    subcategoryMap = new Map(insertedSubcategories.map(s => [s.name, s.id]));
  } catch (e) {
    console.warn("Skipping Subcategories:", e.message);
  }

  // 4. SEED PRODUCTS (unchanged, now works)
  console.log("Seeding products...");
  try {
    if (subcategoryMap.size === 0) throw new Error("No subcategories");

    const productsData = productsMeta
      .map(p => ({
        name: p.name,
        price: p.price,
        stock: p.stock,
        imageUrl: p.imageUrl,
        subcategoryId: subcategoryMap.get(p.subcategoryName),
      }))
      .filter(p => p.subcategoryId);

    await prisma.product.createMany({
      data: productsData,
      skipDuplicates: true,
    });
  } catch (e) {
    console.warn("Skipping Products:", e.message);
  }

  // 5. SEED DELIVERY OPTIONS
  console.log("Seeding delivery options...");
  try {
    await prisma.deliveryOption.createMany({
      data: deliveryOptions,
      skipDuplicates: true,
    });
  } catch {
    console.warn("Skipping Delivery Options");
  }

  // 6. SEED TEST USER
  console.log("Seeding test user...");
  let testUser;
  try {
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash("password123", 10);
  
  const testUser = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'user@gmail.com',
      password: hashedPassword,
      // phone: '+1-234-567-8900',
      //address: '123 Main St, City, State 12345',
      bio: 'I love shopping for fresh groceries!'
    }
  });

    testUser = await prisma.user.create({
      data: {
        name: "Test User",
        email: "user@gmail.com",
        password: hashedPassword,
        phone: "+1-234-567-8900",
        address: "123 Main St, City, State 12345",
        bio: "I love shopping for fresh groceries!",
      },
    });
  } catch {
    console.warn("Skipping Test User");
  }

  // 7. SEED TEST ORDERS
  console.log("Seeding test orders...");
  try {
    if (!testUser) throw new Error("No user");

    const products = await prisma.product.findMany({ take: 10 });
    const deliveryOption = await prisma.deliveryOption.findFirst();

    if (products.length === 0) throw new Error("No products");

    const orders = [];
    for (let i = 0; i < 3; i++) {
      const orderItems = products.slice(i * 3, (i + 1) * 3).map(product => ({
        quantity: Math.floor(Math.random() * 3) + 1,
        price: product.price,
        productId: product.id,
      }));

      const total = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const order = await prisma.order.create({
        data: {
          userId: testUser.id,
          total,
          deliveryFee: deliveryOption ? deliveryOption.fee : 5.99,
          deliveryOptionId: deliveryOption ? deliveryOption.id : null,
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          items: { create: orderItems },
        },
      });

      orders.push(order);
    }

    console.log(`Created ${orders.length} test orders for user: ${testUser.email}`);
  } catch {
    console.warn("Skipping Orders (missing dependencies)");
  }

  console.log("All seed data inserted successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

// Seed Delivery Options
const deliveryOptions = [
  {
    name: "Standard Delivery",
    fee: 3.0,
    estimated: "3–5 working days",
    description: "Affordable delivery option with reasonable waiting time.",
  },
  {
    name: "Express Delivery",
    fee: 6.5,
    estimated: "1–2 working days",
    description: "Faster delivery for urgent grocery needs.",
  },
  {
    name: "Same-Day Delivery",
    fee: 9.9,
    estimated: "Same day",
    description: "Orders placed before 3PM will be delivered today.",
  },
];
