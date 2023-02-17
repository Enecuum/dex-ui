const actionPack =  {
    root : {
        TOGGLE_ASIDE            : 'TOGGLE_ASIDE',
        UPD_BALANCES            : 'UPD_BALANCES',
        CHANGE_NET              : 'CHANGE_NET',
        UPD_NETWORK_INFO        : 'UPD_NETWORK_INFO',
        CHANGE_LANG             : 'CHANGE_LANG',
        CHANGE_CONN_STATUS      : 'CHANGE_CONN_STATUS',
        CHANGE_MENU_ITEM        : 'CHANGE_MENU_ITEM',
        ASSIGN_PUBKEY           : 'ASSIGN_PUBKEY',
        UPD_ACTIVE_LOCALE       : 'UPD_ACTIVE_LOCALE',
        UPD_PAIRS               : 'UPD_PAIRS',
        ASSIGN_ALL_TOKENS       : 'ASSIGN_ALL_TOKENS',
        UPD_CURRENT_TX_HASH     : 'UPD_CURRENT_TX_HASH',
        UPD_RECENT_TXS          : 'UPD_RECENT_TXS',
        UPD_MAIN_TOKEN_DATA     : 'UPD_MAIN_TOKEN_DATA',
        UPD_NATIVE_TOKEN_DATA   : 'UPD_NATIVE_TOKEN_DATA'
    },
    swapCard : {
        SWAP_FIELDS                         : 'SWAP_FIELDS',
        ASSIGN_WALLET_VALUE                 : 'ASSIGN_WALLET_VALUE',
        OPEN_TOKEN_LIST                     : 'OPEN_TOKEN_LIST',
        CLOSE_TOKEN_LIST                    : 'CLOSE_TOKEN_LIST',
        CHANGE_LIQUIDITY_MODE               : 'CHANGE_LIQUIDITY_MODE',
        ASSIGN_COIN_VALUE                   : 'ASSIGN_COIN_VALUE',
        ASSIGN_TOKEN_VALUE                  : 'ASSIGN_TOKEN_VALUE',
        UPD_ACTIVE_FIELD                    : 'UPD_ACTIVE_FIELD',
        TOGGLE_REMOVE_LIQUIDITY_VIEW        : 'TOGGLE_REMOVE_LIQUIDITY_VIEW',
        CHANGE_CREATE_POOL_STATE            : 'CHANGE_CREATE_POOL_STATE',
        CHANGE_REMOVE_LIQUDITY_VISIBILITY   : 'CHANGE_REMOVE_LIQUIDITY_VISIBILITY',
        CHANGE_SWAP_CALC_DIRECTION          : 'CHANGE_SWAP_CALC_DIRECTION',
        SET_ROUTE                           : 'SET_ROUTE'
    },
    tokenCard : {
        ASSIGN_TOKEN_LIST : 'ASSIGN_TOKEN_LIST',
        CHANGE_SORT_MODE  : 'CHANGE_SORT_MODE'
    },
    aside : {
        UPD_EXCH_RATE   : 'UPD_EXCH_RATE'
    },
    indicatorPanel : {
        UPD_COIN_AMOUNT             : 'UPD_COIN_AMOUNT',
        UPD_COIN_NAME               : 'UPD_COIN_NAME'
    },
    etm : {
        UPDATE_TOKEN_PROPERTY          : 'UPDATE_TOKEN_PROPERTY',
        UPDATE_TOKEN_BIGINT_DATA       : 'UPDATE_TOKEN_BIGINT_DATA',
        UPDATE_MSG_DATA                : 'UPDATE_MSG_DATA',
        UPDATE_SHOW_FORM               : 'UPDATE_SHOW_FORM',
        UPDATE_DATA_VALID              : 'UPDATE_DATA_VALID',
        UPDATE_POSSIBLE_TO_ISSUE_TOKEN : 'UPDATE_POSSIBLE_TO_ISSUE_TOKEN',
        OPEN_WAITING_CONFIRMATION      : 'OPEN_WAITING_CONFIRMATION',
        CHANGE_WAITING_STATE_TYPE      : 'CHANGE_WAITING_STATE_TYPE',
        CLOSE_WAITING_CONFIRMATION     : 'CLOSE_WAITING_CONFIRMATION',
        UPDATE_ISSUE_TOKEN_TX_AMOUNT   : 'UPDATE_ISSUE_TOKEN_TX_AMOUNT',
        UPDATE_MAIN_TOKEN_TICKER       : 'UPDATE_MAIN_TOKEN_TICKER',
        UPDATE_MAIN_TOKEN_DECIMALS     : 'UPDATE_MAIN_TOKEN_DECIMALS',
        RESET_STORE                    : 'RESET_STORE'
    },
    farms : {
        UPDATE_EXPANDED_ROW         : 'UPDATE_EXPANDED_ROW',
        UPDATE_MANAGED_FARM_DATA    : 'UPDATE_MANAGED_FARM_DATA',
        UPDATE_SORT_TYPE            : 'UPDATE_SORT_TYPE',
        UPDATE_SHOW_STAKE_MODAL     : 'UPDATE_SHOW_STAKE_MODAL',
        UPDATE_MAIN_TOKEN_AMOUNT    : 'UPDATE_MAIN_TOKEN_AMOUNT',
        UPDATE_MAIN_TOKEN_DECIMALS  : 'UPDATE_MAIN_TOKEN_DECIMALS',
        UPDATE_MAIN_TOKEN_FEE       : 'UPDATE_MAIN_TOKEN_FEE',
        UPDATE_PRICELIST            : 'UPDATE_PRICELIST',
        UPDATE_CURRENT_ACTION       : 'UPDATE_CURRENT_ACTION',
        UPDATE_STAKE_DATA           : 'UPDATE_STAKE_DATA',
        UPDATE_FARMS_LIST           : 'UPDATE_FARMS_LIST'
    },
    drops : {
        DROPS_UPDATE_EXPANDED_ROW         : 'DROPS_UPDATE_EXPANDED_ROW',
        DROPS_UPDATE_MANAGED_FARM_DATA    : 'DROPS_UPDATE_MANAGED_FARM_DATA',
        DROPS_UPDATE_SORT_TYPE            : 'DROPS_UPDATE_SORT_TYPE',
        DROPS_UPDATE_SHOW_STAKE_MODAL     : 'DROPS_UPDATE_SHOW_STAKE_MODAL',
        DROPS_UPDATE_MAIN_TOKEN_AMOUNT    : 'DROPS_UPDATE_MAIN_TOKEN_AMOUNT',
        DROPS_UPDATE_MAIN_TOKEN_DECIMALS  : 'DROPS_UPDATE_MAIN_TOKEN_DECIMALS',
        DROPS_UPDATE_MAIN_TOKEN_FEE       : 'DROPS_UPDATE_MAIN_TOKEN_FEE',
        DROPS_UPDATE_PRICELIST            : 'DROPS_UPDATE_PRICELIST',
        DROPS_UPDATE_CURRENT_ACTION       : 'DROPS_UPDATE_CURRENT_ACTION',
        DROPS_UPDATE_STAKE_DATA           : 'DROPS_UPDATE_STAKE_DATA',
        DROPS_UPDATE_FARMS_LIST           : 'DROPS_UPDATE_FARMS_LIST'
    },
    voting : {
        VOTING_UPDATE_EXPANDED_ROW         : 'VOTING_UPDATE_EXPANDED_ROW',
        VOTING_UPDATE_MANAGED_FARM_DATA    : 'VOTING_UPDATE_MANAGED_FARM_DATA',
        VOTING_UPDATE_SORT_TYPE            : 'VOTING_UPDATE_SORT_TYPE',
        VOTING_UPDATE_SHOW_STAKE_MODAL     : 'VOTING_UPDATE_SHOW_STAKE_MODAL',
        VOTING_UPDATE_MAIN_TOKEN_AMOUNT    : 'VOTING_UPDATE_MAIN_TOKEN_AMOUNT',
        VOTING_UPDATE_MAIN_TOKEN_DECIMALS  : 'VOTING_UPDATE_MAIN_TOKEN_DECIMALS',
        VOTING_UPDATE_MAIN_TOKEN_FEE       : 'VOTING_UPDATE_MAIN_TOKEN_FEE',
        VOTING_UPDATE_PRICELIST            : 'VOTING_UPDATE_PRICELIST',
        VOTING_UPDATE_CURRENT_ACTION       : 'VOTING_UPDATE_CURRENT_ACTION',
        VOTING_UPDATE_STAKE_DATA           : 'VOTING_UPDATE_STAKE_DATA',
        VOTING_UPDATE_FARMS_LIST           : 'VOTING_UPDATE_FARMS_LIST'
    },
    spaceStation : {
        SPACE_STATION_UPDATE_EXPANDED_ROW          : 'SPACE_STATION_UPDATE_EXPANDED_ROW',
        SPACE_STATION_UPDATE_MANAGED_FARM_DATA     : 'SPACE_STATION_UPDATE_MANAGED_FARM_DATA',
        SPACE_STATION_UPDATE_SORT_TYPE             : 'SPACE_STATION_UPDATE_SORT_TYPE',
        SPACE_STATION_UPDATE_SHOW_STAKE_MODAL      : 'SPACE_STATION_UPDATE_SHOW_STAKE_MODAL',
        SPACE_STATION_UPDATE_MAIN_TOKEN_AMOUNT     : 'SPACE_STATION_UPDATE_MAIN_TOKEN_AMOUNT',
        SPACE_STATION_UPDATE_MAIN_TOKEN_DECIMALS   : 'SPACE_STATION_UPDATE_MAIN_TOKEN_DECIMALS',
        SPACE_STATION_UPDATE_MAIN_TOKEN_FEE        : 'SPACE_STATION_UPDATE_MAIN_TOKEN_FEE',
        SPACE_STATION_UPDATE_PRICELIST             : 'SPACE_STATION_UPDATE_PRICELIST',
        SPACE_STATION_UPDATE_CURRENT_ACTION        : 'SPACE_STATION_UPDATE_CURRENT_ACTION',
        SPACE_STATION_UPDATE_STAKE_DATA            : 'SPACE_STATION_UPDATE_STAKE_DATA',
        SPACE_STATION_UPDATE_FARMS_LIST            : 'SPACE_STATION_UPDATE_FARMS_LIST',
        SPACE_STATION_UPDATE_POOLS_LIST            : 'SPACE_STATION_UPDATE_POOLS_LIST',
        SPACE_STATION_UPDATE_MANAGED_POOL          : 'SPACE_STATION_UPDATE_MANAGED_POOL',
        SPACE_STATION_UPDATE_SHOW_DISTRIBUTE_MODAL : 'SPACE_STATION_UPDATE_SHOW_DISTRIBUTE_MODAL'
    },
    nonNativeConnection : {       
        UPDATE_WALLET_CONNECT_IS_CONNECTED         : 'UPDATE_WALLET_CONNECT_IS_CONNECTED',
        UPDATE_WALLET_CONNECT                      : 'UPDATE_WALLET_CONNECT',
        UPDATE_WALLET_CONNECT_CHAIN                : 'UPDATE_WALLET_CONNECT_CHAIN',
        UPDATE_WALLET_CONNECT_WALLET_TITLE         : 'UPDATE_WALLET_CONNECT_WALLET_TITLE',
        UPDATE_WALLET_CONNECT_ACCOUNT_ID           : 'UPDATE_WALLET_CONNECT_ACCOUNT_ID',
        UPDATE_WEB3_EXTENSION_IS_CONNECTED         : 'UPDATE_WEB3_EXTENSION_IS_CONNECTED',
        UPDATE_WEB3_EXTENSION                      : 'UPDATE_WEB3_EXTENSION',
        UPDATE_WEB3_EXTENSION_CHAIN                : 'UPDATE_WEB3_EXTENSION_CHAIN',
        UPDATE_WEB3_EXTENSION_WALLET_TITLE         : 'UPDATE_WEB3_EXTENSION_WALLET_TITLE',
        UPDATE_WEB3_EXTENSION_ACCOUNT_ID           : 'UPDATE_WEB3_EXTENSION_ACCOUNT_ID'           
    },
    spaceBridge : {
        UPDATE_SRC_TOKEN_HASH             : 'UPDATE_SRC_TOKEN_HASH',
        UPDATE_SRC_TOKEN_ALLOWANCE        : 'UPDATE_SRC_TOKEN_ALLOWANCE',
        UPDATE_SRC_TOKEN_BALANCE          : 'UPDATE_SRC_TOKEN_BALANCE',
        UPDATE_SRC_TOKEN_DECIMALS         : 'UPDATE_SRC_TOKEN_DECIMALS',
        UPDATE_SRC_TOKEN_TICKER           : 'UPDATE_SRC_TOKEN_TICKER',
        UPDATE_SRC_TOKEN_AMOUNT_TO_SEND   : 'UPDATE_SRC_TOKEN_AMOUNT_TO_SEND',
        UPDATE_CURRENT_BRIDGE_TX          : 'UPDATE_CURRENT_BRIDGE_TX',
        UPDATE_BRIDGE_DIRECTION           : 'UPDATE_BRIDGE_DIRECTION',
        UPDATE_SHOW_TOKEN_LIST            : 'UPDATE_SHOW_TOKEN_LIST',
        UPDATE_DST_DECIMALS               : 'UPDATE_DST_DECIMALS',
        UPDATE_SHOW_HISTORY               : 'UPDATE_SHOW_HISTORY',
        UPDATE_FROM_BLOCKCHAIN            : 'UPDATE_FROM_BLOCKCHAINM',
        UPDATE_TO_BLOCKCHAIN              : 'UPDATE_TO_BLOCKCHAIN'
    }
};

export default actionPack;