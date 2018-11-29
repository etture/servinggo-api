const express = require('express');
const path = require('path');
const qrcode = require('qrcode');
const knex = require('../../../utils/knexfile');
const {encrypt, decrypt} = require('../../../utils/encryption');

// Endpoint: /api/merchant/qr
const router = express.Router();

// Encryption Test용 endpoint
router.get('/crypto', (req, res) => {
    const text = req.query.text;
    const encrypted = encrypt(text);
    const encrypted2 = encrypt(text);
    console.log('Encrypted text:', encrypted);
    console.log('Encrypted2 text:', encrypted2);
    const decrypted = decrypt(encrypted);
    console.log('Decrypted text:', decrypted);
    res.send(decrypted);
});


// QR 생성 모듈 이용한 방법
// Post request body에 상점 번호 (store_id), 테이블 번호 (table_num)을 받아서 QR 코드 생성
// Static resource로 serve 하도록 저장, URL 반환
// TODO turn response into JSON output
router.post('/generate', (req, res) => {
    const {store_id: storeId, table_num: tableNum} = req.body;
    const encodedStoreId = (storeId * 47 + 19) * 7 + 57;
    const encodedTableNum = (tableNum * 32 - 25) * 3 + 48;

    // Text to be encoded in QR code
    const textEncoded = 'servinggo.app';
    const relativePath = `/images/qr/store_${storeId}_table_${tableNum}.png`;
    const filePath = path.join(__dirname, `../../../../public${relativePath}`);

    const protocol = req.protocol;
    const host = req.get('host');

    console.log('__dirname:', __dirname);
    console.log('protocol:', protocol);
    console.log('host:', host);

    qrcode.toFile(filePath, textEncoded, {
        type: 'png',
        errorConnectionLevel: 'H',
        width: 300,
        maskPattern: 6,
        color: {
            dark: '#ffffff',  // Dots
            light: '#0000' // Background (transparent: #0000)
        }
    }, (err) => {
        if (err) return res.send(err);

        // knex.insert({store_id: storeId, table_num: tableNum, relative_url: relativePath})
        //     .into('qr')
        //     .then(() => {
        //         res.send(`${protocol}://${host}${relativePath}`);
        //     })
        //     .catch((err) => {
        //         res.status(400).json(err);
        //     });
    });
});

// 외부 QR API 이용한 방법
// router.post('/get_qr', (req, res) => {
//     const id = 'service-merchant-' + req.body.store_id;
//     axios({
//         method: 'get',
//         url: 'http://api.qrserver.com/v1/create-qr-code/?data=' + id,
//         responseType: 'stream'
//     }).then(response => {
//         const file_path = path.join(__dirname, `../../public/images/merchant_qr${req.body.store_id}.png`);
//         console.log(file_path);
//         response.data.pipe(fs.createWriteStream(file_path));
//         res.send(`localhost:3012/images/merchant_qr`);
//     })
//         .catch(err => {
//             res.send(err);
//         });
// });

module.exports = router;