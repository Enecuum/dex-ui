module.exports = {
    apps : [
        {
            name : "prod",
            script : "server.js",
            cwd : "./server",
            args : "--run --filter error",
            exec_mode : "fork",
            merge_logs: true,
            log_file : '../logs/prod.log',
            watch : false
        },
        {
            name : "test_prod",
            script : "server.js",
            cwd : "./server",
            args : "--run --filter full",
            exec_mode : "fork",
            merge_logs: true,
            log_file : '../logs/test_prod.log',
            watch : false
        },
        {
            name : "dev",
            script : "./node_modules/webpack/bin/webpack.js",
            args : "serve --host 0.0.0.0 --config webpack.config.js",
            exec_mode : "fork",
            merge_logs: true,
            log_file : 'logs/dev.log',
            watch : false
        }
    ]
};