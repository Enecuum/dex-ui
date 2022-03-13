const path = require("path")

const logDir = path.join(__dirname, "logs")

module.exports = {
    apps : [
        {
            name : "hot_dev",
            script : path.join(__dirname, "server/scripts/hotDev.js"),
            exec_mode : "fork",
            merge_logs: true,
            log_file : path.join(logDir, "dev.log"),
            watch : false
        },
        {
            name : "test_plug",
            script : path.join(__dirname, "server/scripts/tp.js"),
            exec_mode : "fork",
            merge_logs: true,
            log_file : path.join(logDir, "dev.log"),
            watch : false
        }
    ]
};