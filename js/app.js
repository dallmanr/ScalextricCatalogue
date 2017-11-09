var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

var formidable = require('formidable');
var fs = require('fs');

var MongoClient = require('mongodb').MongoClient;

//Code for obtaining all car details
function getCatNumbers() {
  var catNumbers;
  $.getJSON("http://localhost:3000/allcars", function(data) {
    $.each(data, function(index, item) {
      catNumbers += "<option value='" + item.cat_number + "'>" + item.cat_number + " " + item.car_manufacturer + " " + item.manufacturer_model + " " + item.car_number + " " + item.type + "</option>";
    });
    $('#catNumberDropdown').html(catNumbers);
  });
};

function getACarsDetails(val) {
  console.log("Called in app.js " + val);
  var dbId;
  var catNumber = val;
  var remarks;
  var ltd_edition;
  var car_manufacturer;
  var manufacturer_model;
  var car_number;
  var colour;
  var type;
  var model_manufacturer;
  var cost;
  var received;
  var source;
  var make;
  var year;
  $.getJSON("http://localhost:3000/acar/" + catNumber, function(data) {
    dbId = data._id;
    ltd_edition = data.ltd_edition;
    car_manufacturer = data.car_manufacturer;
    manufacturer_model = data.manufacturer_model;
    car_number = data.car_number;
    colour = data.colour;
    type = data.type;
    model_manufacturer = data.model_manufacturer;
    cost = data.cost;
    received = data.received;
    source = data.source;
    make = data.make;
    year = data.year;
    remarks = data.remarks;
    img_path = data.img_path;
    // remarks = data.remarks;
    // localStorage.setItem("vanSerialDriverSignOut", serialNumber);
    document.getElementById("manufacturerModelField").value = manufacturer_model;
    document.getElementById("carManufacturerModelField").value = car_manufacturer;
    document.getElementById("carNumberField").value = car_number;
    document.getElementById("colourField").value = colour;
    document.getElementById("carTypeField").value = type;
    document.getElementById("ltdEditionField").value = ltd_edition;
    document.getElementById("modelManufacturerField").value = model_manufacturer;
    document.getElementById("sourceField").value = source;
    document.getElementById("carMakeField").value = make;
    document.getElementById("yearField").value = year;
    document.getElementById("costField").value = cost;
    document.getElementById("remarksField").value = remarks;
    document.getElementById('carImage').src = img_path;
  });
};
