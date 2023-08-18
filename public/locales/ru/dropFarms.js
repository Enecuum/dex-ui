module.exports = {
    "subscriptDrops" : "Размещайте non-LP токены",
    "subscriptHarvestFarms" : "Размещайте LP и получайте в награду токены",
    "subscriptVoting" : "Vote, vote, vote! Not voting is not a protest. It is a surrender. Vote all around!",
    "stakeNamedToken"              : "Стейк {{tokenName}}",
    "unstakeNamedToken"            : "Отозвать {{tokenName}}",
    "stakeLPTokens"                : "Стейк LP токенов",
    "unstakeLPTokens"              : "Отзыв LP токенов",
    "stake"                        : "Стейк",
    "myStake"                      : "Мой стейк",
    "unstake"                      : "Отозвать",
    "getLPToken"                   : "Получить {{tokenName}} LP",
    "getNamedToken"                : "Получить {{tokenName}}",
    "nBlocksLeft"                  : "Осталось блоков: {{blocksLeft}}",
    "nDaysLeft"                    : "Осталось: {{days}}д {{hours}}ч {{minutes}}м",
    "nHoursLeft"                   : "Осталось: {{hours}}ч {{minutes}}м left",
    "nMinutesLeft"                 : "Осталось: {{minutes}}м left",
    "approximateDeadline"          : "Время завершения: {{datetime}}",
    "finished"                     : "Работа завершена",
    "pausedFarmStatusDescription"  : "Пауза. Для возобновления работы сделайте стейк {{stakeTokenName}}",
    "liquidity"                    : "Ликвидность",
    "earn"                         : "Доход",
    "earned"                       : "Доход",
    "apy"                          : "APY",
    "rewardPerBlock"               : "Награда за блок",
    "details"                      : "Подробнее",
    "harvest"                      : "Собрать урожай",
    "totalStaked"                  : "Общий стейк",
    "stakeShare"                   : "Доля в стейке",
    "finishedFilter"               : "Завершённый",
    "pausedFilter"                 : "Приостановленный",
    "activeFilter"                 : "Активный",

    "voting" : {
        "header" : "Governance",
        "description" : "ENEX.SPACE offers a decentralized governance system that allows users to participate in decision-making processes through voting. By taking part in decentralized voting, users can contribute to making the network better together. This governance system is designed to ensure that all users have an equal say in the decision-making process, regardless of their stake or position within the network. Through this system, users can vote on proposals related to network upgrades, changes to consensus algorithms, and other important decisions that impact the ENEX.SPACE and Enecuum ecosystem. With a focus on decentralization and community-driven decision-making, ENEX governance system is designed to ensure transparency, fairness, and inclusivity in all decision-making processes. Whether you are a developer, miner, or enthusiast, we invites you to participate in governance and help shape the future of the network.",
        "activeVotes" : "Active votes",
        "pastVotes" : "Past votes",
        "noVotes" : "No votes found",

        "votes" : {
            "nextSteps" : {
                "header" : "Voting about Enecuum security incident - {{status}}",
                "description" : "Voting Description: A vote of the ENQ holders is necessary to choose a way forward to resolve the existing issue of 79,723,426.95 ENQ. Proposals from the team, proposals from the community were collected. The option with the highest ENQ steak will be chosen for further implementation in the protocol."
            },
            "miningSlots" : {
                "header" : "Voting about reduction the lower threshold for participation in the distribution of mining slots - {{status}}",
                "description" : "Voting Description: Enecuum network is offering a voting opportunity for a proposal to change the minimum stake required for obtaining a mining slot for user tokens. The aim is to reduce the lower threshold to enable more token owners to participate in the process. Currently, the minimum stake required is 500,000 enq on the token issuer's account. The voting process will begin on April 13 and last for two weeks, and members of the community are encouraged to participate. The mining slot mechanism is crucial for mining user tokens on the Enecuum network, and further information can be found on the Enecuum blog and documentation."
            },
            "tickerPrefix" : {
                "header" : "Voting about the ticker generation algorithm for tokens issued by the bridge - {{status}}",
                "description" : "We have a proposal from the community regarding the ticker generation algorithm for a token issued by a bridge in the destination network. The current process involves adding the prefix \"sb\" to the ticker when creating a token in the destination network. For instance, if a user wants to transfer tokens from network A to network B, and the token does not yet exist in network B, the bridge will issue it in network B with the ticker prefixed as \"sbTST\" (for example, if the original token ticker is TST). However, @anaks77 suggests a modification to this logic. The proposal is to refrain from adding the \"sb\" prefix to the token being created on the destination network."
            },
            "tuneTokenomics" : {
                "header" : "Voting about tokenomics tuning - {{status}}",
                "description" : "We have a proposal to tune the tokenomics for the future project development."
            },
        },

        "votingTill" : "Voting till: {{block}} block in Enecuum Network (approx.: {{timeStr}})",
        "currentBlock" : "Current block: {{block}}",
        "readMore1" : "Article",
        "readMore2" : "Read more",
        "readMore3" : "Voting results",
        "proposalsTitle" : "Proposals",
        "totalVotes" : "Total votes",
        "myVotes" : "My votes",
        "readTheProposal" : "read the proposal"
    }
}
