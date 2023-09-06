import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose";  
import _ from "lodash";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const toDoItemSchema = {
    taskText:String,
    date:Date
}

const ToDo= mongoose.model("ToDo",toDoItemSchema);

const toDo1=new ToDo({
    taskText:"Study Unity",
    date:new Date()
})
const toDo2=new ToDo({
    taskText:"No Fap",
    date:new Date()
})
const toDo3=new ToDo({
    taskText:"Study bootcamp",
    date:new Date()
})

const listD=[toDo1,toDo2,toDo3];

const listSchema = {
    name:String,
    items:[toDoItemSchema]
}

const List = mongoose.model("List",listSchema);
// ToDo.insertMany(listD).then(()=>{
//     console.log("Succesfully insterted!!!");
// }).catch((err)=>{
//     console.error(err);
// });

app.get("/",async (req,res)=>{
    var lists= await List.find({});
    var listT=await ToDo.find({});
    res.render("index.ejs",{names:lists,toDoListD:listT});
});

app.get("/:customListName",async(req,res)=>{
    const customListName= _.capitalize(req.params.customListName);
    const temp= await List.findOne({name:customListName});
    var lists= await List.find({});
    if(!temp){
        const list=new List({
            name:customListName,
            items:listD
        });
        list.save();
        res.redirect("/"+customListName)
    }
    else{
        res.render("index.ejs",{names:lists,title:temp.name,toDoListD:temp.items})
    }
});

app.post("/",(req,res)=>{
    var task =new ToDo({
        taskText:req.body["taskD"],
        date:new Date()
    });
    var listName=req.body["list"];

    if(listName==="Today"){
    task.save();
    res.redirect("/");
    }else{
        List.findOne({name:listName}).then((foundList)=>{
        foundList.items.push(task);
        foundList.save();
        res.redirect("/"+listName);
        }); 
    }
})

app.post("/delete", async(req,res)=>{

    const listName=req.body.listName;
    const itemChecked=req.body.checkbox;
    if(listName==="Today"){
        ToDo.findByIdAndDelete(itemChecked).then(()=>{
            console.log("Succesfully Deleted")
        }).catch((err)=>{
            console.error(err)
        })
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemChecked}}}).then(()=>{
            res.redirect("/"+listName);
        }).catch((err)=>{
            console.error(err);
        });
    }

}); 

app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})