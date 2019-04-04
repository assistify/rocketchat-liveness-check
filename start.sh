npm run liveness

if [ $? -ne 1 ]; then # The liveness check return 1 in case of functional errors - the rest are technical issues
    echo OK
    exit 0
else
    echo FAIL
    exit $?
fi