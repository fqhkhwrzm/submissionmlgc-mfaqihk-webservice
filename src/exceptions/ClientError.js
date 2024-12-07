// File ini berisi penanganan error secara umum dan terjadi di sisi klien
class ClientError extends Error {
    // nilai default 400 yang menandakan adanya client erro
    constructor(message, statusCode = 400) {
        super(message); // super() untuk mengambil properti dari class Error
        this.statusCode = statusCode;
        this.name = 'ClientError';
    }
}

module.exports = ClientError;