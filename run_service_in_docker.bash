if [ "$S_TYPE" = "rd" ] ; then \
    pm2 start ecosystem.config.js --only rd -- --peer ${ADDRESS}:${P_PORT} --port ${C_PORT} --p ${PASSW} ;\
elif [ "$S_TYPE" = "fl" ] ; then \
    pm2 start ecosystem.config.js --only fl -- --peer ${ADDRESS}:${P_PORT} --port ${C_PORT} --p ${PASSW} ;\
elif [ "$S_TYPE" = "ddl" ] ; then \
    pm2 start ecosystem.config.js --only ddl -- --peer ${ADDRESS}:${P_PORT} --port ${C_PORT} --p ${PASSW} ;\
fi