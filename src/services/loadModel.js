const tf = require('@tensorflow/tfjs-node');

async function loadModel() {
    // .loadGraphModel() untuk melakukan load model yang diambil dari environment variabel
    return tf.loadGraphModel(process.env.MODEL_URL);
}

module.exports = loadModel;