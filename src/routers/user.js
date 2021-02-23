const express = require("express");
const router = new express.Router()
const User = require("../models/user");
const auth = require("../middeware/auth.js")
const multer = require("multer");
const sharp = require("sharp");
const { welcomeEmail, byeEmail } = require("../emails/account")

router.post("/users", async (req, res) => {

    const user = new User(req.body)

    try {
        await user.save()
        welcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
});

router.get("/users", auth, async (req, res) => {
    try {
        const users = await User.find({});

        res.status(200).send(users)
    } catch (error) {
        res.status(400).send(error)
    }
});

router.get("/users/me", auth, async (req, res) => {
    try {
        res.status(200).send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
});


router.delete("/users/me", auth, async (req, res) => {
    try {

        await req.user.remove();
        byeEmail(req.user.email, req.user.name)
        res.status(200).send("Good bye");
    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    }
})

router.patch("/users/me", auth, async (req, res) => {

    try {
        const updates = Object.keys(req.body)
        const allowUpdates = ["name", "email", "password", "age"];
        const isvalidOpration = updates.every((update) => allowUpdates.includes(update))
        if (!isvalidOpration) {
            return res.status(404).send("Error : no extra value");
        }
        updates.foreach((update) => { console.log(update) })
        await req.user.save();

        res.status(200).send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((tokens) => {
            return tokens.token !== req.token
        })
        await req.user.save();
        res.status(200).send("LogOut Successfull...!");
    }
    catch (error) {
        res.status(500).send(error);
    }

})

router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send("LogOut All Successfull...!");
    }
    catch (error) {
        res.status(500).send(error);
    }

})
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("plz upload image"))
        }
        cb(undefined, true);
    }
})

router.post("/users/me/avatar", auth, upload.single("avatar"), async (req, res, next) => {

    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set("Content-Type", "image/jpg")
        res.send(user.avatar)

    } catch (error) {

    }
})

module.exports = router