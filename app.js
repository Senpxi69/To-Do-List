const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const _= require("lodash")
const env=require(".env");

const app = express();

mongoose.connect("mongodb+srv://kartikvyas02:Karv9028@cluster0.cnajdzf.mongodb.net/todoList");

var itemsSchema={
  name:String
}

var Item=mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"press the add button to add the task"
})

const item2 = new Item({
  name:"use any endpoint for eg:`/work` to create a new todolist for yourself"
})

const item3 = new Item({
  name:"click on the checkox to delete the task"
})

const defaultItem=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("list",listSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.get("/", function(req, res) {
// below code checks if there is data in our database or not and then adds the data if it 
// is empty or redirect if it has some data
  Item.find().then((data)=>{
if (data.length === 0){
  Item.insertMany(defaultItem).then(function(doc){
    console.log(doc);
  }).catch(function(err){
    console.log(err);
  });
  res.redirect("/");
}else{
  res.render("list", {
    listTitle: "Today",
    listItems: data
  });
}
    
  })

  
});

app.post("/", function(req, res){

  const itemName = req.body.newTodo
  const listName = req.body.listSubmit

  const item=new Item({
    name:itemName
  })

if(listName === "Today"){
  item.save();
  res.redirect("/")
}else{
  List.findOne({name:listName}).then((data)=>{
    data.items.push(item)
    data.save();
    res.redirect("/"+listName)
  })
}

});

app.post("/delete",(req,res)=>{
  var checkboxId=req.body.checkbox;
  var listName=req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove(checkboxId).then(()=>{
    console.log("Successfully removed")
  }).catch((err)=>{
    console.log(err)
  })
  res.redirect("/")  
}else{
  console.log(checkboxId)
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkboxId}}}).then(()=>{
    res.redirect("/"+listName)
  }).catch((err)=>{
    console.log(err)
  })
}
})

app.get("/:id", function(req, res){
  var customName=_.capitalize(req.params.id);
  
  List.findOne({name:customName}).then((data)=>{
    if(!data){
      const list = new List({
        name:customName,
        items:defaultItem,
        
      })
      list.save();
      res.redirect("/"+customName)
    }else{
      res.render("list", {
        listTitle: data.name,
        listItems: data.items
      });
    }
  })
})

app.listen(3000, function() {
  console.log("Server running on port 3000.");
});