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
            name : "fl",
            script : path.join(__dirname, "server/scripts/fl.js"),
            exec_mode : "fork",
            merge_logs: true,
            log_file : path.join(logDir, "fl.log"),
            watch : false
        },
        {
            name : "rd",
            script : path.join(__dirname, "server/scripts/rd.js"),
            exec_mode : "fork",
            merge_logs: true,
            log_file : path.join(logDir, "rd.log"),
            watch : false
        },
        {
            name : "ddl",
            script : path.join(__dirname, "server/scripts/ddl.js"),
            exec_mode : "fork",
            merge_logs: true,
            log_file : path.join(logDir, "ddl.log"),
            watch : false
        }
    ]
};