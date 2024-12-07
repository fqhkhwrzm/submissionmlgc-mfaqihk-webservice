const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

/*
    membuat fungsi predictClassification yang akan menerima dua parameter. Pertama adalah model yang akan digunakan, 
    kedua adalah image sebagai input data baru dari pengguna ketika mengirimkan request ke server
*/
 
async function predictClassification(model, image) {
    try {
        // membangun kode untuk mengonversi data gambar (image) menjadi tensor.
        const tensor = tf.node // .node untuk menangani proses inferensi data.
            .decodeJpeg(image) // untuk melakukan decode terhadap input data baru
            .resizeNearestNeighbor([224, 224]) // untuk melakukan resize gambar menggunakan algoritma Nearest Neighbor
            .expandDims() // untuk menambah dimensi gambar
            .toFloat() // untuk mengubah seluruh data yang diproses menjadi float
        // Setelah tensor didapat, gunakan tensor untuk mendapatkan prediksi, score, dan confidenceScore
 
        //  urutan kelas ini tidak boleh tertukar, diakses dengan indeks
        const classes = ['Cancer', 'Non-cancer'];
        const suggestionArr = ['Segera periksa ke dokter!', 'Penyakit kanker tidak terdeteksi.'];
 
        const prediction = model.predict(tensor); // menampung hasil prediksi berdasarkan data baru berupa tensor (gambar yang sudah diproses sebelumnya)
        const score = await prediction.data(); // untuk mendapatkan seluruh skor yang didapatkan
        /*
            Maksudnya seperti ini, dengan menjalankan perintah prediction.data() akan menghasilkan score
            berdasarkan kelas yang ada ('Melanocytic nevus', 'Squamous cell carcinoma', 'Vascular lesion').  
            Skor yang dihasilkan akan bervariasi dan dimulai dari 0 hingga 1. Contohnya, kode tersebut akan 
            menghasilkan [0.2, 0.7, 0.1] yang menandakan bahwa prediksi tersebut menghasilkan skor yang tinggi 
            pada kelas kedua atau Squamous cell carcinoma
        */
        const confidenceScore = Math.max(...score) * 100; // untuk mendapatkan skor tertinggi dari prediksi sebelumnya
 
        // const classResult = tf.argMax(prediction, 1).dataSync()[0];
        // // tf.argMax(prediction, 1) untuk menghitung indeks dengan nilai maksimum untuk setiap baris dari tensor
        // // .dataSync() untuk mengambil data dari tensor, output dari metode ini adalah array yang berurutan dari terbesar hingga terkecil.
        // // [0] untuk mengambil elemen pertama dari array tersebut (nilai terbesar)
        const label = confidenceScore > 99 ? classes[0] : classes[1];

        let suggestion;
 
        if(label === classes[0]) {
            suggestion = suggestionArr[0];
        }
 
        if(label === classes[1]) {
            suggestion = suggestionArr[1];
        }
 
        return { confidenceScore, label, suggestion };
    } catch (error) {
        // memberikan pesan Terjadi kesalahan input: ${error.message} jika program menangkap terjadinya kesalahan.
        throw new InputError('Terjadi kesalahan dalam melakukan prediksi');
    }
}
 
module.exports = predictClassification;