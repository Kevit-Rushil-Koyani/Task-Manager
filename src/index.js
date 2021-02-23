const express = require("express");
require("./db/mongoose.js")
const taskRouter = require("./routers/task");
const userRouter = require("./routers/user");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000
app.use(express.json());
app.use(taskRouter);
app.use(userRouter);


const multer = require("multer")
const upload = multer({
    dest: "images",
    limits: {
        fileSize: 100000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(doc | docx)$/)) {
            return cb(new Error("please upload a pdf"))
        }

        // cb(new Error("upload image"));
        cb(undefined, true);
        // cb(undefined,false);
    }
})
const errorMiddlewere = (req, res, next) => {
    throw new Error("middelwere");
}
app.post("/upload", upload.single("upload"), (req, res) => {
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


app.listen(port, () => {
    console.log("port :" + port)
}) 