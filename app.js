//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Database Connection (mongoDB)
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB")

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
    const customListName = req.params.customListName
   
    const list = new List ({
      name: customListName,
      items: defaultItems
    })

    list.save()
  })

const day = date.getDate();

 
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item ({
    name: itemName
  })

  item.save()
  res.redirect("/")
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox

  Item.findByIdAndRemove(checkedItemId)
     .then( () =>{
      console.log("Item deleted!")
     })
     .catch((err) =>{
      console.log(err)
     })

  res.redirect("/")
})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
