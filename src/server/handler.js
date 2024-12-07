// File ini bertanggung jawab menangani seluruh request dan response yang masuk, seluruh fungsi atau logika aplikasi akan disimpan pada folder services
const predictClassification = require("../services/inferenceService");
const storeData = require('../services/storeData');
const crypto = require('crypto');

/* 
     extension onPreResponse, extension adalah fitur untuk menambahkan fungsionalitas tertentu. Pada konteks 
     kali ini, kita akan menambahkan fungsionalitas onPreResponse. Extension onPreResponse pada Hapi bertujuan 
     untuk melakukan manipulasi atau tindakan tertentu sebelum respons dikirimkan kembali ke klien.
     extension ini untuk menangani jika terjadi response error. 
*/
async function postPredictHandler(request, h) {
    // mengambil data gambar dari payload dan model dari server.app
    const { image } = request.payload;
    const { model } = request.server.app;

    // menjalankan fungsi predictClassification yang sebelumnya telah dibuat
    const { label, suggestion } = await predictClassification(model, image);

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // Menyimpan seluruh data pada objek bernama 'data'
    const data = {
        "id": id,
        "result": label,
        "suggestion": suggestion,
        "createdAt": createdAt
    }

    await storeData(id, data);

    const response = h.response({
        status: 'success',
        message: 'Model is predicted successfully',
        data
    });
    response.code(201);
    return response;
};

module.exports = postPredictHandler;