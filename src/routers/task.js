const express = require("express");
const router = new express.Router()
const Task = require("../models/task");
const auth = require("../middeware/auth")


router.post("/tasks",auth, async (req,res) => {

    const task =  new Task({
        ...req.body,
        owner : req.user._id
    })

    try {
        await task.save();      
        res.status(201).send(task)  
    } catch (error) {
        res.status(400).send(error)
    }
}); 

router.get("/tasks",auth,async (req,res)=>{
    try {
        const match = {}
        const sort = {}
        if(req.query.completed){
            match.completed = req.query.completed === "true"
        }
        if(req.query.sortBy){
            const parts = req.query.sortBy.split(":");
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        }
        await req.user.populate({
            path : "tasks",
            match,
            options : {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort 
            }
        }).execPopulate()
        res.status(200).send(req.user.tasks)  
    } catch (error) {
        res.status(400).send(error)
    }
});


router.get("/task/:id",auth,async (req,res)=>{
    try {
        const _id = req.params.id;
        const task = await Task.findOne({_id,owner : req.user._id})      
        if(!task){
            return res.status(404).send("no task")
        }
        res.status(201).send(task)  
    } catch (error) {
        res.status(400).send(error)
    }
});

router.patch("/tasks/:id",async (req,res) => {

    try {
        const updates = Object.keys(req.body)
        const allowUpdates = ["description","completed"];
        const isvalidOpration = updates.every((update) => allowUpdates.includes(update))
    
        if(!isvalidOpration){
            return res.status(400).send("Error : no extra value");
        }

        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();

        res.status(200).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
})

router.delete("/tasks/:id",async (req,res) => {
    try{
        const task = await Task.findOneAndDelete({_id : req.params.id,owner: req.user._id })
        if (!task){
            return res.status(404).send();
        }
        res.status(200).send(task);
    }catch(error){
        res.status(400).send(error);
    }
})

module.exports = router