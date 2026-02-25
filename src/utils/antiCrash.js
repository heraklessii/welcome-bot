module.exports = () => {
    process.on('unhandledRejection', (reason, p) => {
        console.log(' [Anti-Crash] :: Unhandled Rejection/Catch');
        console.log(reason, p);
    });

    process.on('uncaughtException', (err, origin) => {
        console.log(' [Anti-Crash] :: Uncaught Exception/Catch');
        console.log(err, origin);
    });

    process.on('uncaughtExceptionMonitor', (err, origin) => {
        console.log(' [Anti-Crash] :: Uncaught Exception/Catch (MONITOR)');
        console.log(err, origin);
    });
};