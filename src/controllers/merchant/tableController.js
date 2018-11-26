const knex = require('../../knexfile');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');
const {checkStoreOwnership} = require('./utils');
const {encrypt} = require('../../utils/encryption');

const api = process.env.SERVINGGO_REMOTE_API || process.env.SERVINGGO_LOCAL_API;

exports.addTable = (req, res, next) => {
    const TAG = 'addTable';

    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;
    const {storeId, tableNum} = req.body;

    console.log(`${TAG}:`, storeId, tableNum);

    checkStoreOwnership(storeId, merchantId, (error) => {
        if (error) {
            console.log(`${TAG}, error:`, error);
            res.status(400).json({
                success: false,
                errorMessage: "허가되지 않은 접근입니다.",
                error
            });
            return;
        }
        console.log(`${TAG}: checkStoreOwnership passed`);

        const protocol = req.protocol;
        const host = req.get('host');

        // Text to be decrypted, containing storeId and tableNum
        const textEncoded = encrypt(`servinggo-s-${storeId}-t-${tableNum}`);
        // Text included in QR code, containing URL to access client-side menu
        const urlEncoded = `${api}/scan/${textEncoded}`;

        // Relative path where QR image is saved
        const relativePath = `/images/qr/s_${storeId}_t_${tableNum}.png`;
        // Absolute path where QR image is saved
        const filePath = path.join(__dirname, `../../../public${relativePath}`);
        // Path for user to see image via static access
        const staticPath = `${protocol}://${host}${relativePath}`;

        console.log('api:', api);
        console.log('urlEncoded:', urlEncoded);
        console.log('__dirname:', __dirname);
        console.log('filePath:', filePath);
        console.log('staticPath:', staticPath);
        console.log('protocol:', protocol);
        console.log('host:', host);

        qrcode.toFile(filePath, urlEncoded, {
            type: 'png',
            errorConnectionLevel: 'H',
            width: 300,
            maskPattern: 6,
            color: {
                dark: '#000000',  // Dots
                light: '#ffffff' // Background (transparent: #0000)
            }
        }, (error) => {
            if (error) {
                res.status(400).json({
                    success: false,
                    errorMessage: "에러가 발생했습니다. 다시 시도해주세요!",
                    error
                });
                return;
            }

            knex.insert({
                store_id: storeId,
                table_num: tableNum,
                qr_url: staticPath
            })
                .into('table')
                .then(() => {
                    res.status(200).json({
                        url: staticPath
                    });
                })
                .catch((error) => {
                    res.status(400).json({
                        success: false,
                        errorMessage: "에러가 발생했습니다. 다시 시도해주세요!",
                        error
                    });
                });
        });
    });
};

exports.removeTable = (req, res, next) => {
    const TAG = 'removeTable';

    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;
    const {storeId, tableNum} = req.body;

    console.log(`${TAG}:`, storeId, tableNum);

    checkStoreOwnership(storeId, merchantId, (error) => {
        if (error) {
            console.log(`${TAG}, error:`, error);
            res.status(400).json({
                success: false,
                errorMessage: "허가되지 않은 접근입니다.",
                error
            });
            return;
        }
        console.log(`${TAG}: checkStoreOwnership passed`);

        knex('table')
            .delete()
            .where({
                store_id: storeId,
                table_num: tableNum
            })
            .then(() => {

                const relativePath = `/images/qr/s_${storeId}_t_${tableNum}.png`;
                const filePath = path.join(__dirname, `../../../public${relativePath}`);

                // Delete QR file
                fs.unlink(filePath, (error) => {
                    if(error && error.code === 'ENOENT') {
                        // file doesn't exist
                        console.info("File doesn't exist, won't remove it.");
                    } else if (error) {
                        // other errors, e.g. maybe we don't have enough permission
                        console.error("Error occurred while trying to remove file");
                    } else {
                        console.info(`removed`);
                    }
                });

                res.status(200).json({
                    success: true
                });
            })
            .catch((error) => {
                res.status(400).json({
                    success: false,
                    errorMessage: "에러가 발생했습니다. 다시 시도해주세요!",
                    error
                });
            });
    });
};

exports.getTables = (req, res, next) => {
    const TAG = 'getTables';

    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;
    const {storeId} = req.body;

    console.log(`${TAG}:`, storeId);

    checkStoreOwnership(storeId, merchantId, (error) => {
        if (error) {
            console.log(`${TAG}, error:`, error);
            res.status(400).json({
                success: false,
                errorMessage: "허가되지 않은 접근입니다.",
                error
            });
            return;
        }
        console.log(`${TAG}: checkStoreOwnership passed`);

        knex.select('*')
            .from('table')
            .where({store_id: storeId})
            .orderBy('table_num', 'asc')
            .then((tables) => {
                console.log('tables:', tables);
                res.status(200).json({
                    success: true,
                    tables
                });
            })
            .catch((error) => {
                res.status(400).json({
                    success: false,
                    errorMessage: "에러가 발생했습니다. 다시 시도해주세요!",
                    error
                });
            })
    });
};

exports.downloadQR = (req, res, next) => {
    const TAG = 'downloadQR';

    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;
    const {storeId, tableNum} = req.body;

    console.log(`${TAG}:`, storeId);

    checkStoreOwnership(storeId, merchantId, (error) => {
        if (error) {
            console.log(`${TAG}, error:`, error);
            res.status(400).json({
                success: false,
                errorMessage: "허가되지 않은 접근입니다.",
                error
            });
            return;
        }
        console.log(`${TAG}: checkStoreOwnership passed`);

        try {
            // Relative path where QR image is saved
            const relativePath = `/images/qr/s_${storeId}_t_${tableNum}.png`;
            // Absolute path where QR image is saved
            const filePath = path.join(__dirname, `../../../public${relativePath}`);

            res.status(200).download(filePath);

        } catch(error) {
            res.status(400).json({
                success: false,
                errorMessage: "에러가 발생했습니다. 다시 시도해주세요!",
                error
            });
        }
    });
};