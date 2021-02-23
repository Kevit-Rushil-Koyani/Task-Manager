const mongoose = require("mongoose");

mongoose.connect("mongodb://192.168.1.7:27017/Bookya",{
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology: true
});