const {Pool} = require('pg');

const dbPool = new Pool ({
    database : 'personal-web',
    port : 5432,
    user : 'postgres',
    password : 'kubik'
});


// untuk mengirim konfigurasi
module.exports = dbPool;