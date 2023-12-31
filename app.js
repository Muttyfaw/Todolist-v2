//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Database Connection (mongoDB)
mongoose.connect("mongodb+srv://MuttyFaw:zee%402000@cluster0.dau9uhz.mongodb.net/todolistDB")

const itemsSchema = ({
   name : String
})

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to your todolist!"
})

const item2 = new Item({
  name: "Hit the + button to add a new item."
})

const item3 = new Item({
  name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {

  Item.find()
  .then((foundItems) =>{
    if(foundItems == 0){
      Item.insertMany(defaultItems)
        .then((defaultItems) => {
          console.log("Successfully saved default items into DB")
          console.log(defaultItems)
        })
        .catch((err) => {
          console.error(err)
        })
    }
    res.render("list", { listTitle: "Today", newListItems: foundItems });

  })

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName)
   

    List.findOne({name: customListName})
    .then ((foundList) => {
        if(!foundList){
          const list = new List({
            name: customListName,
            items: defaultItems
          })

          list.save()
          res.redirect("/" + customListName)
        }else{
        res.render("list",{ listTitle: foundList.name, newListItems: foundList.items });
        }
    })
    .catch((err) => {
      console.log(err)
    })

  })

const day = date.getDate();

 
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item ({
    name: itemName
  })

  if(listName == "Today"){
    item.save()
    res.redirect("/")
  }else{
    List.findOne({name: listName})
       .then((foundList) =>{
        foundList.items.push(item)
        foundList.save()
        res.redirect("/"+ listName)
       })
       .catch((err) =>{
        console.log(err)})
    }  
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  if(listName == "Today"){
    Item.findByIdAndRemove(checkedItemId)
      .then(() => {
        console.log("Item deleted!")
      })
      .catch((err) => {
        console.log(err)
      })

    res.redirect("/")
  }else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}) 
        .then((foundList, err) =>{
          if(!err){
            res.redirect("/" + listName)
            console.log(listName)
          }
        })
  } 
})



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(3000, function() {
  console.log("Server has started successfully");
});
