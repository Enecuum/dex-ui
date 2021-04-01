const actionPack =  {
    root : {
        OPEN_ASIDE              : 0x00,
        CLOSE_ASIDE             : 0x01,
        CHANGE_NET              : 0x02,
        CHANGE_LANG             : 0x03,
        OPEN_CONNECTION_LIST    : 0x04,
        CLOSE_CONNECTION_LIST   : 0x05,
        CHANGE_CONN_STATUS      : 0x06,
        CHANGE_MENU_ITEM        : 0x07,
        ASSIGN_PUBKEY           : 0x08
    },
    swapCard : {
        SWAP_FIELDS             : 0x10,
        ASSIGN_WALLET_VALUE     : 0x11,
        OPEN_TOKEN_LIST         : 0x13,
        CLOSE_TOKEN_LIST        : 0x14,
        CHANGE_LIQUIDITY_MODE   : 0x15,
        OPEN_CONFIRM_CARD       : 0x16,
        CLOSE_CONFIRM_CARD      : 0x17,
        ASSIGN_COIN_VALUE       : 0x18,
        ASSIGN_TOKEN_VALUE      : 0x19,
        UPD_PAIRS               : 0x1A
    },
    wallet : {
        SET_PUBKEY : 0x20
    },
    tokenCard : {
        ASSIGN_TOKEN_LIST : 0x30,
        ASSIGN_ALL_TOKENS : 0x31,
        CHANGE_SORT_MODE : 0x32
    }
};

export default actionPack;