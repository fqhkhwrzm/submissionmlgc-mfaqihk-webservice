// File ini bertanggung jawab untuk memuat kode, membuat konfigurasi, serta menjalankan HTTP server menggunakan Hapi
require('dotenv').config(); // untuk mengambil environment variable

const Hapi = require('@hapi/hapi');
const loadModel = require('../services/loadModel');
const routes = require('../server/routes');
const InputError = require('../exceptions/InputError');

(async () => {
    const server = Hapi.server({
        port: 8080,
        host: '0.0.0.0',
        routes: {
            // Pakai cors untuk mengizinkan permintaan dari semua origin untuk dapat mengakses sumber daya dalam server
            cors: {
                origin: ['*'],
            },
        },
    })

    // untuk menjalankan fungsi loadModel dan menyimpannya pada variabel model
    const model = await loadModel();
    // server.app untuk menyimpan hasil load model ke aplikasi
    /*
        kita menggunakan server.app.model untuk menyimpan hasil load model sehingga server hanya perlu 
        melakukan load model ke Cloud Storage bucket sekali dan menyimpan hasilnya pada properti tersebut.
    */
    server.app.model = model;

    server.route(routes);

    // server.ext() adalah fungsi yang bertugas untuk menangani extension dalam Hapi
    // extension yang digunakan adalah onPreResponse. server.ext() disimpan setelah server.route()
    /*  
         server akan menjalankan seluruh konfigurasi routes terlebih dahulu. Setelah routes, extension 
         akan memeriksa response yang dihasilkan. Jika terjadi kesalahan, extension ini akan menerima 
         informasi tersebut.
    */
   // server.ext() menerima dua parameter yang wajib dipenuhi, yaitu event dan method.
   // parameter event yang diberikan adalah onPreResponse
   // memiliki beberapa method di bawahnya, salah satunya .isBoom, Method ini akan menghasilkan boolean true jika terjadi error pada response dan akan menghasilkan false jika tidak terjadi
   // Parameter kedua adalah method, yaitu fungsi yang menangani permintaan server dengan menerima dua parameter, yakni request dan h
   // menangani error dengan dua cara. Pertama adalah jika response-nya adalah Input Error atau terjadi kesalahan input.
   server.ext('onPreResponse', function (request, h) {
        const response = request.response;

        console.log(response.statusCode, response.code)
        if (response instanceof InputError) {
            // InputError ini berasal dari file InputError.js
            const newResponse = h.response({
                status: 'fail',
                message: `${response.message}`
            })
            newResponse.code(response.statusCode)
            return newResponse;
        }

        // Penanganan kedua adalah jika terjadi kesalahan atau error server
        if (response.isBoom) {
            const newResponse = h.response({
                status: 'fail',
                message: response.message
            })
            newResponse.code(response.output.statusCode)
            return newResponse;
        }

        // sintaks berikut untuk melanjutkan proses server tanpa mengubah response apa pun jika tidak terjadi error.
        return h.continue;
    })

    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();