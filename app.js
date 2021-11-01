const express = require("express");
const mongoose = require ("mongoose")
const _ = require("lodash")

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-urmi:Reshmi95*@cluster0.d1ij7.mongodb.net/todolistDB", {useNewUrlParser: true} )

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema)

const item1 = new Item({
  name: "Welcome to ToDo lists"
})

const item2 = new Item({
  name: "Hit + to insert"
})

const item3 = new Item({
  name: "Check to delete"
})

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema)


// var items = [];
// var workItems = [];

app.get("/", function (req, res) {

  
  Item.find({}, function(err, items){
    if (items.length === 0)
    {
      Item.insertMany(defaultItems, function(err){
        if (err) console.log(err);
        else console.log("Successfully inserted");
      })
      res.redirect("/")
    }
    else {
      
      res.render("index", { listTitle: "Today", newItemArray: items });
    }
  })
})
  
app.get("/:listType", function(req,res){
  const listname = _.capitalize(req.params.listType)

  List.findOne({name: listname}, function(err, result){
    if (err) console.log(err);
    else{
      if (!result)
      {
        const newList = new List({
          name: listname,
          items: defaultItems,
        })
        newList.save()
        res.redirect("/" + listname)
      }
      else
      {
        res.render("index", {listTitle: result.name, newItemArray: result.items})
        
      }
    }
  })


})

  

//   var today = new Date();
//   var day = "";

//   options = {
//     day: "numeric",
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//   };

//   day = today.toLocaleDateString("en-US", options);

//   res.render("index", { listTitle: day, newItemArray: items });
// });

app.post("/", function (req, res) {
  var itemname = req.body.nextItem;
  var listName = req.body.list;

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }

  const newItem = new Item({
    name: itemname
  })

  if (listName === 'Today')
  {
    newItem.save()
    res.redirect("/")
  }else{
    List.findOne({name: listName}, function(err, result){
      result.items.push(newItem);
      result.save();
      res.redirect("/" + listName)
    })
  }  
});

app.post("/delete", function (req, res){
  const deletedItem = req.body.deletedItem;
  const listName = req.body.list;

  if (listName === "Today")
  {
    Item.findByIdAndRemove({_id: deletedItem}, function(err){
      if (err) console.log(err);
      else console.log("deleted successfully");
    })
    res.redirect("/")
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deletedItem}}}, function(err, results){
      if (err) console.log(err);
      else{
        res.redirect("/" + listName)
      }
    })
  }

})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port, function () {
  console.log("server has started");
});
